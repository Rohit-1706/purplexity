import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { ChatInterface } from "../components/ChatInterface";
import { useAuth } from "../contexts/AuthContext";
import { createConversation } from "../services/api";
import { LogOut, PanelLeft } from "lucide-react";

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut, loading } = useAuth();
  const conversationId = searchParams.get("conversation");
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !conversationId && user) {
      handleNewChat();
    }
  }, [loading]);

  async function handleNewChat() {
    if (creatingConversation) return;
    try {
      setCreatingConversation(true);
      const conversation = await createConversation();
      setSearchParams({ conversation: conversation.id });
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setCreatingConversation(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between h-12 px-4 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(160,160,160,0.5)] hover:text-[rgba(240,240,240,0.9)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150"
              title={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
            >
              <PanelLeft size={15} strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7c6af7]">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] font-semibold text-[rgba(240,240,240,0.9)] tracking-tight">
                Purplexity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#7c6af7] flex items-center justify-center text-white text-[11px] font-medium">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-[11px] text-[rgba(160,160,160,0.6)] hidden sm:inline">
                  {user.email}
                </span>
              </div>
            )}
            <button
              onClick={signOut}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(160,160,160,0.5)] hover:text-[rgba(240,240,240,0.9)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150"
              title="Sign out"
            >
              <LogOut size={14} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <ChatInterface conversationId={conversationId} />
      </div>
    </div>
  );
}
