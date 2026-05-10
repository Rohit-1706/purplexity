import express from "express";
import cors from "cors";
import { tavily } from "@tavily/core";
import { OpenAI } from "openai";
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from "./prompt";
import type { Request, Response } from "express";
import { authMiddleware } from "./middleware";
import { prisma } from "./db";
import crypto from "crypto";
import { MessageRole } from "./prisma/generated/enums";

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json());
app.use(cors());

interface AuthenticatedRequest extends Request {
    userId: string;
    body: Record<string, unknown>;
}

app.post("/conversations", authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;
    const title = req.body?.title as string | undefined;

    const slug = crypto.randomBytes(8).toString("hex");

    const conversation = await prisma.conversation.create({
        data: {
            userId,
            title: title || "New Conversation",
            slug,
        },
    });

    res.json(conversation);
});

app.get("/conversations", authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;

    const conversations = await prisma.conversation.findMany({
        where: { userId },
        include: {
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    res.json(conversations);
});

app.get("/conversation/:conversationId", authMiddleware, async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId as string;
    const userId = (req as AuthenticatedRequest).userId;

    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId,
        },
        include: {
            messages: {
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
});

app.delete("/conversation/:conversationId", authMiddleware, async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId as string;
    const userId = (req as AuthenticatedRequest).userId;

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
    });

    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }

    await prisma.message.deleteMany({ where: { ConversationId: conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });

    res.json({ success: true });
});

app.post("/purplexity_ask", authMiddleware, async (req: Request, res: Response) => {
    const query = req.body?.query as string;
    const conversationId = req.body?.conversationId as string;
    const userId = (req as AuthenticatedRequest).userId;

    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    if (!conversationId) {
        return res.status(400).json({ error: "Conversation ID is required" });
    }

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
    });

    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }

    const webSearchResponse = await tavilyClient.search(query, {
        searchDepth: "advanced",
    });

    const webSearchResults = webSearchResponse.results;

    const prompt = PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResults))
        .replace("{{USER_QUERY}}", query);

    const stream = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
        ],
        stream: true,
    });

    res.header("Content-Type", "text/event-stream");
    res.header("Cache-Control", "no-cache");
    res.header("Connection", "keep-alive");
    res.header("X-Accel-Buffering", "no");

    let fullContent = "";

    for await (const part of stream) {
        const content = part.choices[0]?.delta?.content;
        if (content) {
            fullContent += content;
            res.write(content);
        }
    }

    await prisma.message.create({
        data: {
            content: query,
            role: MessageRole.User,
            ConversationId: conversationId,
        },
    });

    await prisma.message.create({
        data: {
            content: fullContent,
            role: MessageRole.Assistant,
            ConversationId: conversationId,
        },
    });

    res.write("\n<SOURCES>\n");
    res.write(JSON.stringify(webSearchResults.map((r) => ({ url: r.url }))));
    res.write("\n</SOURCES>\n");
    res.end();
});

app.post("/purplexity_ask/followup", authMiddleware, async (req: Request, res: Response) => {
    const query = req.body?.query as string;
    const conversationId = req.body?.conversationId as string;
    const userId = (req as AuthenticatedRequest).userId;

    if (!query || !conversationId) {
        return res.status(400).json({ error: "Query and conversation ID are required" });
    }

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }

    const historyMessages = conversation.messages.map((m) => ({
        role: m.role === MessageRole.User ? ("user" as const) : ("assistant" as const),
        content: m.content,
    }));

    const stream = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...historyMessages,
            { role: "user", content: query },
        ],
        stream: true,
    });

    res.header("Content-Type", "text/event-stream");
    res.header("Cache-Control", "no-cache");
    res.header("Connection", "keep-alive");
    res.header("X-Accel-Buffering", "no");

    let fullContent = "";

    for await (const part of stream) {
        const content = part.choices[0]?.delta?.content;
        if (content) {
            fullContent += content;
            res.write(content);
        }
    }

    await prisma.message.create({
        data: {
            content: query,
            role: MessageRole.User,
            ConversationId: conversationId,
        },
    });

    await prisma.message.create({
        data: {
            content: fullContent,
            role: MessageRole.Assistant,
            ConversationId: conversationId,
        },
    });

    res.end();
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
