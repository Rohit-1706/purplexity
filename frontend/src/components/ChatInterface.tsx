import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Search, Loader2, Globe, ArrowUp, Copy, Check, ExternalLink } from "lucide-react";
import { streamAsk, streamFollowup, getConversation } from "../services/api";
import type { Message } from "../types";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface SearchSource {
  url: string;
  title?: string;
}

interface ChatInterfaceProps {
  conversationId: string | null;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function parseMarkdownToSpans(text: string): (string | { type: string; content: string })[] {
  const parts: (string | { type: string; content: string })[] = [];
  let remaining = text;
  let key = 0;

  const patterns: { type: string; regex: RegExp; groupIndex: number; wrap: (c: string) => { type: string; content: string } }[] = [
    {
      type: "code-block",
      regex: /```(\w*)\n([\s\S]*?)```/,
      groupIndex: 2,
      wrap: (c) => ({ type: "code-block", content: c }),
    },
    {
      type: "inline-code",
      regex: /`([^`]+)`/,
      groupIndex: 1,
      wrap: (c) => ({ type: "inline-code", content: c }),
    },
    {
      type: "bold",
      regex: /\*\*([^*]+)\*\*/,
      groupIndex: 1,
      wrap: (c) => ({ type: "bold", content: c }),
    },
    {
      type: "italic",
      regex: /\*([^*]+)\*/,
      groupIndex: 1,
      wrap: (c) => ({ type: "italic", content: c }),
    },
    {
      type: "link",
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      groupIndex: 2,
      wrap: (c) => ({ type: "link", content: c }),
    },
  ];

  while (remaining) {
    let earliest = { index: remaining.length, type: "", match: null as RegExpMatchArray | null, pattern: null as typeof patterns[0] | null };

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined && match.index < earliest.index) {
        earliest = { index: match.index, type: pattern.type, match, pattern };
      }
    }

    if (earliest.pattern) {
      if (earliest.index > 0) {
        const textPart = remaining.substring(0, earliest.index);
        if (textPart) {
          for (const line of textPart.split("\n")) {
            if (line) parts.push(line);
            else parts.push({ type: "newline", content: "" });
          }
        }
      }

      const m = earliest.match!;
      const pattern = earliest.pattern;

      if (pattern.type === "code-block") {
        parts.push({ type: "code-block", content: m[2].trim() });
      } else if (pattern.type === "inline-code") {
        parts.push({ type: "inline-code", content: m[1] });
      } else if (pattern.type === "bold") {
        parts.push({ type: "bold", content: m[1] });
      } else if (pattern.type === "italic") {
        parts.push({ type: "italic", content: m[1] });
      } else if (pattern.type === "link") {
        parts.push({ type: "link", content: m[2] });
      }

      remaining = remaining.substring(earliest.index + m[0].length);
    } else {
      if (remaining) {
        for (const line of remaining.split("\n")) {
          if (line) parts.push(line);
          else parts.push({ type: "newline", content: "" });
        }
      }
      break;
    }
  }

  return parts;
}

interface StructuredResponse {
  answer: string | null;
  followUps: string[];
}

function parseStructuredResponse(content: string): StructuredResponse {
  const answerMatch = content.match(/<ANSWER>([\s\S]*?)<\/ANSWER>/i);
  const followUps = [...content.matchAll(/<question>([\s\S]*?)<\/question>/gi)].map((m) => m[1].trim());
  return {
    answer: answerMatch ? answerMatch[1].trim() : null,
    followUps,
  };
}

interface MessageItemProps {
  msg: Message;
  onFollowUpSelect?: (question: string) => void;
}

const MessageItem = memo(function MessageItem({ msg, onFollowUpSelect }: MessageItemProps) {
  const isUser = msg.role === "User";
  const structured = useMemo(() => parseStructuredResponse(msg.content), [msg.content]);
  const mainText = structured.answer ?? msg.content;

  const renderedContent = useMemo(() => {
    if (isUser) {
      return <p className="text-[15px] text-[rgba(240,240,240,0.95)] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>;
    }

    const spans = parseMarkdownToSpans(mainText);
    return (
      <div className="text-[15px] text-[rgba(240,240,240,0.95)] leading-relaxed">
        {spans.map((span, i) => {
          if (typeof span === "string") {
            return <span key={i}>{span}</span>;
          }
          switch (span.type) {
            case "newline":
              return <br key={i} />;
            case "bold":
              return <strong key={i} className="font-semibold">{span.content}</strong>;
            case "italic":
              return <em key={i} className="italic">{span.content}</em>;
            case "inline-code":
              return <code key={i} className="bg-[rgba(255,255,255,0.08)] px-[6px] py-[2px] rounded text-[13px] font-mono text-[rgba(160,160,160,0.9)]">{span.content}</code>;
            case "code-block":
              return (
                <pre key={i} className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 my-3 overflow-x-auto">
                  <code className="text-[13px] font-mono text-[rgba(240,240,240,0.85)] whitespace-pre">{span.content}</code>
                </pre>
              );
            case "link":
              return <a key={i} href={span.content} target="_blank" rel="noopener noreferrer" className="text-[#7c6af7] hover:underline underline-offset-2">{span.content}</a>;
            default:
              return <span key={i}>{span.content}</span>;
          }
        })}
      </div>
    );
  }, [isUser, mainText, msg.content]);

  return (
    <div className="flex gap-3 animate-in">
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser
            ? "bg-[rgba(240,240,240,0.85)] text-[#0a0a0a]"
            : "bg-gradient-to-br from-[#7c6af7] to-[#a855f7] text-white"
        }`}
      >
        {isUser ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {renderedContent}
        {!isUser && structured.followUps.length > 0 && (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
            <p className="text-[12px] uppercase tracking-wider text-[rgba(160,160,160,0.6)] mb-2">
              Suggested follow-ups
            </p>
            <div className="flex flex-wrap gap-2">
              {structured.followUps.map((question, idx) => (
                <button
                  key={`${question}-${idx}`}
                  className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-[12px] text-[rgba(240,240,240,0.85)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  onClick={() => onFollowUpSelect?.(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!isStreaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  async function loadConversation(id: string) {
    try {
      setIsLoadingConversation(true);
      const conversation = await getConversation(id);
      setMessages(conversation.messages);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setIsLoadingConversation(false);
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || isStreaming || !conversationId) return;

    const question = query.trim();
    setQuery("");
    setError(null);

    setIsStreaming(true);
    setCurrentResponse("");
    setSources([]);

    const userMessage: Message = {
      id: Date.now(),
      content: question,
      role: "User",
      ConversationId: conversationId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const isFirstMessage = messages.length === 0;
    let responseText = "";

    function onChunk(text: string) {
      responseText += text;
      setCurrentResponse(responseText);
    }

    function onComplete() {
      if (!isStreamingRef.current) return;
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          content: responseText,
          role: "Assistant",
          ConversationId: conversationId,
          createdAt: new Date().toISOString(),
        },
      ]);
      setCurrentResponse("");
    }

    function onErr(err: string) {
      setError(err);
      setIsStreaming(false);
    }

    if (isFirstMessage) {
      streamAsk(question, conversationId, onChunk, (srcs) => setSources(srcs), onComplete, onErr);
    } else {
      streamFollowup(question, conversationId, onChunk, onComplete, onErr);
    }
  }, [query, isStreaming, conversationId, messages.length]);

  function handleFollowUpSelect(question: string) {
    setQuery(question);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function copyToClipboard() {
    const textToCopy = currentResponse || messages.map((m) => m.content).join("\n\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const streamingContent = useMemo(() => {
    const streamingStructured = parseStructuredResponse(currentResponse);
    const streamingText = streamingStructured.answer ?? currentResponse;
    const spans = parseMarkdownToSpans(streamingText);
    return (
      <div className="text-[15px] text-[rgba(240,240,240,0.95)] leading-relaxed">
        {spans.map((span, i) => {
          if (typeof span === "string") {
            return <span key={i}>{span}</span>;
          }
          switch (span.type) {
            case "newline":
              return <br key={i} />;
            case "bold":
              return <strong key={i} className="font-semibold">{span.content}</strong>;
            case "italic":
              return <em key={i} className="italic">{span.content}</em>;
            case "inline-code":
              return <code key={i} className="bg-[rgba(255,255,255,0.08)] px-[6px] py-[2px] rounded text-[13px] font-mono text-[rgba(160,160,160,0.9)]">{span.content}</code>;
            case "code-block":
              return (
                <pre key={i} className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 my-3 overflow-x-auto">
                  <code className="text-[13px] font-mono text-[rgba(240,240,240,0.85)] whitespace-pre">{span.content}</code>
                </pre>
              );
            case "link":
              return <a key={i} href={span.content} target="_blank" rel="noopener noreferrer" className="text-[#7c6af7] hover:underline underline-offset-2">{span.content}</a>;
            default:
              return <span key={i}>{span.content}</span>;
          }
        })}
        <span className="inline-block w-[2px] h-[16px] ml-[1px] bg-[#7c6af7] animate-pulse align-middle" />
      </div>
    );
  }, [currentResponse]);

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-4 py-6">
          {isLoadingConversation ? (
            <div className="space-y-2 px-3">
              <div className="h-4 rounded skeleton" style={{ width: "85%" }} />
              <div className="h-4 rounded skeleton" style={{ width: "70%" }} />
              <div className="h-4 rounded skeleton" style={{ width: "90%" }} />
            </div>
          ) : messages.length === 0 && !currentResponse ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-5 animate-in">
              <div className="relative">
                <div className="absolute inset-0 bg-[rgba(124,106,247,0.2)] rounded-full blur-2xl" />
                <div className="relative w-14 h-14 rounded-full bg-[rgba(17,17,17,0.95)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                  <Search size={24} strokeWidth={1.5} className="text-[#7c6af7]" />
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <h2 className="text-[20px] font-semibold text-[rgba(240,240,240,0.95)] tracking-tight">
                  Ask me anything
                </h2>
                <p className="text-[13px] text-[rgba(160,160,160,0.6)] max-w-xs">
                  I will search the web and give you a comprehensive answer
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {messages.map((msg, idx) => (
                <MessageItem key={msg.id ?? idx} msg={msg} onFollowUpSelect={handleFollowUpSelect} />
              ))}

              {isStreaming && currentResponse && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#7c6af7] to-[#a855f7] flex items-center justify-center text-white mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">{streamingContent}</div>
                </div>
              )}

              {error && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-[rgba(239,68,68,0.8)] flex items-center justify-center text-white mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1 text-[13px] text-[rgba(239,68,68,0.9)]">
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
        <div className="max-w-[680px] mx-auto px-4 py-4">
          {sources.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-[rgba(160,160,160,0.5)] font-medium uppercase tracking-widest">
                <Globe size={10} strokeWidth={1.5} />
                Sources
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)] rounded-md text-[11px] text-[rgba(240,240,240,0.75)] hover:text-[rgba(240,240,240,0.95)] transition-all duration-150"
                  >
                    {getHostname(src.url)}
                    <ExternalLink size={9} strokeWidth={1.5} className="text-[rgba(160,160,160,0.5)]" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="relative flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up..."
              rows={1}
              className="h-auto max-h-40 min-h-[48px] resize-none bg-[rgba(26,26,26,0.95)] px-4 py-3 text-[15px] text-[rgba(240,240,240,0.95)]"
              disabled={isStreaming || !conversationId}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                disabled={messages.length === 0 && !currentResponse}
                className="text-[rgba(160,160,160,0.5)] hover:text-[rgba(240,240,240,0.9)]"
              >
                {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
              </Button>
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!query.trim() || !conversationId || isStreaming}
                className="bg-[#7c6af7] text-white hover:bg-[#9585f9]"
              >
                {isStreaming ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
