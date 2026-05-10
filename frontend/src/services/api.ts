import axios from "axios";
import type { Conversation, ConversationListItem } from "../types";
import { BACKEND_URL } from "../lib/config";
import { supabase } from "../config";

async function getAuthToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    return token;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const refreshResult = await supabase.auth.refreshSession();
    return refreshResult.data.session?.access_token || "";
  }

  throw new Error("Not authenticated");
}

export async function createConversation(title?: string): Promise<Conversation> {
  const token = await getAuthToken();
  const { data } = await axios.post(
    `${BACKEND_URL}/conversations`,
    { title },
    { headers: { Authorization: token } },
  );
  return data;
}

export async function getConversations(): Promise<ConversationListItem[]> {
  const token = await getAuthToken();
  const { data } = await axios.get(`${BACKEND_URL}/conversations`, {
    headers: { Authorization: token },
  });
  return data;
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  const token = await getAuthToken();
  const { data } = await axios.get(`${BACKEND_URL}/conversation/${conversationId}`, {
    headers: { Authorization: token },
  });
  return data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const token = await getAuthToken();
  await axios.delete(`${BACKEND_URL}/conversation/${conversationId}`, {
    headers: { Authorization: token },
  });
}

export function streamAsk(
  query: string,
  conversationId: string,
  onChunk: (text: string) => void,
  onSources: (sources: { url: string }[]) => void,
  onComplete: () => void,
  onError: (error: string) => void
): () => void {
  let cancelled = false;

  (async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${BACKEND_URL}/purplexity_ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ query, conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }));
        onError(errorData.error || "Request failed");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError("No response body");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let inSources = false;
      let sourcesBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          if (trimmed === "<SOURCES>") {
            inSources = true;
            continue;
          }
          if (trimmed === "</SOURCES>") {
            inSources = false;
            try {
              const sources = JSON.parse(sourcesBuffer);
              onSources(sources);
            } catch {
              onSources([]);
            }
            sourcesBuffer = "";
            continue;
          }

          if (inSources) {
            sourcesBuffer += trimmed;
          } else {
            onChunk(trimmed);
          }
        }
      }

      if (buffer.trim()) {
        onChunk(buffer.trim());
      }

      onComplete();
    } catch (err) {
      onError(err instanceof Error ? err.message : "An error occurred");
    }
  })();

  return () => {
    cancelled = true;
  };
}

export function streamFollowup(
  query: string,
  conversationId: string,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): () => void {
  let cancelled = false;

  (async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${BACKEND_URL}/purplexity_ask/followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ query, conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }));
        onError(errorData.error || "Request failed");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError("No response body");
        return;
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;

        const text = decoder.decode(value, { stream: true });
        onChunk(text);
      }

      onComplete();
    } catch (err) {
      onError(err instanceof Error ? err.message : "An error occurred");
    }
  })();

  return () => {
    cancelled = true;
  };
}
