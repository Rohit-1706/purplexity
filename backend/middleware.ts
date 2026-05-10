import type { Request, Response, NextFunction } from "express";
import { createSupabaseClient } from "./client";
import { prisma } from "./db";

const client = createSupabaseClient();

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    const data = await client.auth.getUser(token || "");
    const userId = data.data.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const provider = data.data.user?.app_metadata.provider === "google" ? "Google" : "Github";
    const email = data.data.user?.email || "";
    const name = data.data.user?.user_metadata.full_name || data.data.user?.user_metadata.name || "";

    await prisma.user.upsert({
        where: { supabaseId: userId },
        update: {},
        create: {
            id: userId,
            supabaseId: userId,
            email,
            provider,
            name,
        },
    });

    (req as any).userId = userId;
    next();
}
