export interface Message {
  id: number;
  content: string;
  role: "User" | "Assistant";
  ConversationId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  slug: string;
  userId: string;
  messages: Message[];
}

export interface ConversationListItem {
  id: string;
  title: string | null;
  slug: string;
  userId: string;
  messages: Message[];
}

export interface SearchSource {
  url: string;
  title?: string;
}

export interface AskResponse {
  answer: string;
  sources: SearchSource[];
}
