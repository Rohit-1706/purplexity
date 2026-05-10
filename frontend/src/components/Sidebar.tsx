import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { getConversations, createConversation, deleteConversation } from "../services/api";
import type { ConversationListItem } from "../types";
import { Button } from "./ui/button";

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function getConversationLabel(conv: ConversationListItem): string {
  if (conv.title && conv.title !== "New Conversation") {
    return conv.title;
  }
  const firstUserMsg = conv.messages?.find((m) => m.role === "User");
  if (firstUserMsg) {
    const content = firstUserMsg.content;
    return content.length > 36 ? content.substring(0, 36) + "..." : content;
  }
  return "New Conversation";
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeConversationId = searchParams.get("conversation");

  useEffect(() => {
    if (!collapsed) {
      loadConversations();
    }
  }, [collapsed]);

  async function loadConversations() {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleNewChat() {
    if (creating) return;
    try {
      setCreating(true);
      const conversation = await createConversation();
      navigate(`/?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, conversationId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    try {
      setDeleting(conversationId);
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setDeleting(null);
    }
  }

  function toggleSidebar() {
    onCollapsedChange?.(!collapsed);
  }

  if (collapsed) {
    return (
      <div className="flex flex-col h-full w-12 items-center py-3 gap-2 bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.06)] shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-[rgba(160,160,160,0.6)] hover:text-[rgba(240,240,240,0.9)]"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          disabled={creating}
          className="text-[rgba(160,160,160,0.6)] hover:text-[rgba(240,240,240,0.9)]"
        >
          {creating ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Plus size={14} strokeWidth={1.5} />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-[260px] bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.06)] shrink-0">
      <div className="flex items-center justify-between px-3 h-12 border-b border-[rgba(255,255,255,0.06)]">
        <span className="text-[11px] font-medium text-[rgba(160,160,160,0.6)] uppercase tracking-widest">
          Recent
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleNewChat}
            disabled={creating}
            className="text-[rgba(160,160,160,0.6)] hover:text-[rgba(240,240,240,0.9)]"
          >
            {creating ? <Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> : <Plus size={13} strokeWidth={1.5} />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="text-[rgba(160,160,160,0.6)] hover:text-[rgba(240,240,240,0.9)]"
          >
            <ChevronLeft size={13} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="space-y-1 px-2">
            <div className="h-9 rounded-lg skeleton" />
            <div className="h-9 rounded-lg skeleton" />
            <div className="h-9 rounded-lg skeleton" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-4">
            <MessageSquare size={16} strokeWidth={1.5} className="text-[rgba(96,96,96,0.8)]" />
            <p className="text-[11px] text-[rgba(96,96,96,0.8)] leading-relaxed">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] text-[rgba(160,160,160,0.7)] hover:text-[rgba(240,240,240,0.9)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150"
              >
                <button
                  onClick={() => navigate(`/?conversation=${conv.id}`)}
                  className={`flex items-center gap-2 flex-1 min-w-0 text-left transition-colors ${
                    conv.id === activeConversationId ? "text-white" : ""
                  }`}
                >
                  <MessageSquare size={12} strokeWidth={1.5} className="shrink-0 text-[rgba(96,96,96,0.6)] group-hover:text-[rgba(160,160,160,0.6)] transition-colors" />
                  <span className="truncate">{getConversationLabel(conv)}</span>
                </button>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  disabled={deleting === conv.id}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-[rgba(160,160,160,0.4)] hover:text-[rgba(239,68,68,0.9)] hover:bg-[rgba(239,68,68,0.1)] transition-all duration-150"
                  title="Delete conversation"
                >
                  {deleting === conv.id ? (
                    <Loader2 size={11} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <Trash2 size={11} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
