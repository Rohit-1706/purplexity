import express from "express";
import { tavily } from "@tavily/core";
import { OpenAI } from "openai";
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from "./prompt";
import type { application } from "express";


const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
const app = express();

app.use(express.json());

app.post("/purplexity_ask", async (req, res) => {
    // step 1: get the query from the user
    const query = req.body.query;


    // step 2: make sure the user has access/credits to the endpoint

    
    //step 3: check if the webs search is indexed for a similar query, if so return the indexed result

    
    //step 4: if not, web search to gather results
    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced",
    });

    const webSearchResults = webSearchResponse.results;

    // step 5: do some context engineering on the prompt and the web search results to make it more relevant for the model


    // step 6: hit the model with the engineered prompt and stream the response back to the user
    
    const prompt = PROMPT_TEMPLATE
    .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResults))
    .replace("{{USER_QUERY}}", query);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "user", content: prompt },
            { role: "system", content: SYSTEM_PROMPT }
        ],
        
        stream: true
    });
    res.header("cache-control", "no-cache");
    res.header("Content-Type", "text/event-stream");
    res.header("Cache-Control", "no-cache");
    res.header("Connection", "keep-alive");
    res.header("X-Accel-Buffering", "no");

    for await (const part of result) {
        const content = part.choices[0]?.delta?.content;
        if (content) {
            res.write(content);
        }
    }

    res.write("\n<SOURCES>\n");

    res.write(JSON.stringify(webSearchResults.map((result) => ({ url: result.url}))));

    res.write("\n</SOURCES>\n");

    res.end();
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});