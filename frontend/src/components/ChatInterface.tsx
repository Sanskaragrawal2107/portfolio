"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, MessageSquare } from "lucide-react";

// Tambo-inspired component registry
import { componentRegistry } from "@/lib/component-registry";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  isStreaming?: boolean;
  /** Component names to render alongside this message */
  components?: string[];
}

export default function ChatInterface() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Suggestion chips rotation
  const [chipOffset, setChipOffset] = useState(0);
  const suggestions = [
    "Tell me about your most impressive project",
    "What makes you different from other AI engineers?",
    "Which hackathons has Sanskar won?",
    "What is Sanskar's experience with RAG and LangGraph?",
    "Show me Sanskar's GitHub activity",
    "What tech stack does Sanskar work with?",
  ];

  // Track which components have been shown (for sidebar persistence)
  const [activeSidebarComponents, setActiveSidebarComponents] = useState<
    string[]
  >([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Helper: Generate UUID v4
  const generateUUID = (): string => {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.randomUUID
    ) {
      return window.crypto.randomUUID();
    }
    return "session_" + Math.random().toString(36).substring(2, 15);
  };

  // 1. Initial Load & Session Prep
  useEffect(() => {
    setSessionId(generateUUID());

    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Hi, I'm Sanskar's AI — built on RAG, LangGraph, and live MCP connections to his GitHub and LeetCode. I know everything about him. Ask me anything, or pick a suggestion below.",
      },
    ]);
  }, []);

  // 2. Rotate suggestions every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setChipOffset((prev) => (prev + 3) % suggestions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  // 3. Listen to external events (like clicking "Ask AI" on Project Cards)
  const handleSubmitRef = useRef<
    ((e?: React.FormEvent, customMsg?: string) => Promise<void>) | null
  >(null);

  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.message) {
        setInput(customEvent.detail.message);
        setTimeout(() => {
          handleSubmitRef.current?.(undefined, customEvent.detail.message);
        }, 300);
      }
    };

    window.addEventListener("prefill-chat", handlePrefill);
    return () => window.removeEventListener("prefill-chat", handlePrefill);
  }, []);


  // 4. Handle submission & Stream reading (with component event parsing)
  const handleSubmit = useCallback(
    async (e?: React.FormEvent, customMsg?: string) => {
      if (e) e.preventDefault();
      const query = (customMsg || input).trim();
      if (!query) return;

      setInput("");

      const userMsgId = generateUUID();
      const userMessage: Message = {
        id: userMsgId,
        sender: "user",
        text: query,
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsTyping(true);

      const aiMsgId = generateUUID();
      let accumulatedText = "";

      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query, session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error("API call failed");
        }

        setIsTyping(false);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No reader stream");

        // Initialize AI message placeholder
        setMessages((prev) => [
          ...prev,
          { id: aiMsgId, sender: "ai", text: "", isStreaming: true },
        ]);

        let buffer = "";
        const detectedComponents: string[] = [];

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith("data: ")) {
              const dataContent = cleanLine.slice(6);

              // Check if this is a structured component event from the backend
              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.type === "component" && parsed.name) {
                  // This is a component rendering instruction — don't display as text
                  detectedComponents.push(parsed.name);
                  continue;
                }
                // Some backends return {token: "..."} format
                const token = parsed.token || parsed.content || "";
                if (token) {
                  accumulatedText += token;
                }
              } catch {
                // Plain string token — this is the normal case
                accumulatedText += dataContent;
              }

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? { ...msg, text: accumulatedText }
                    : msg,
                ),
              );
            }
          }
        }

        // Streaming complete — attach detected components to the message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  isStreaming: false,
                  components:
                    detectedComponents.length > 0
                      ? detectedComponents
                      : undefined,
                }
              : msg,
          ),
        );

        // Add to sidebar persistence
        if (detectedComponents.length > 0) {
          setActiveSidebarComponents((prev) => {
            const merged = [...prev];
            for (const c of detectedComponents) {
              if (!merged.includes(c)) merged.push(c);
            }
            return merged;
          });
        }
      } catch (error) {
        console.error("Stream connection failed:", error);
        setIsTyping(false);

        setMessages((prev) => [
          ...prev,
          {
            id: generateUUID(),
            sender: "ai",
            text: "Sanskar's AI is thinking... try again in a moment.",
          },
        ]);
      }
    },
    [input, sessionId],
  );

  // Keep ref updated for external event handler
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Helper: Slice suggestions to display current set of 3
  const visibleSuggestions = [
    suggestions[chipOffset],
    suggestions[(chipOffset + 1) % suggestions.length],
    suggestions[(chipOffset + 2) % suggestions.length],
  ];

  /** Render a registered component by name */
  const renderComponent = (name: string) => {
    const entry = componentRegistry[name];
    if (!entry) return null;
    const Comp = entry.component;
    return <Comp />;
  };

  return (
    <div
      id="chat-section"
      className="h-screen w-full flex flex-col bg-[#FFFDF5] bg-dot-grid text-[#1E293B] font-sans border-b-2 border-[#1E293B]"
    >
      {/* Top Header */}
      <header className="h-14 border-b-2 border-[#1E293B] bg-[#FFFDF5] px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#8B5CF6] border-2 border-[#1E293B] shadow-pop-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-base tracking-wide text-[#1E293B] uppercase">
            Sanskar.AI
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#34D399] px-3.5 py-1 rounded-full border-2 border-[#1E293B] shadow-pop-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] text-[#1E293B] font-mono font-bold tracking-wider">
            SYSTEM_ONLINE
          </span>
        </div>
      </header>

      {/* Main Core Layout: Chat + Sidebar */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Left Side: Chat Messages Feed */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFDF5] bg-dot-grid relative">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className="max-w-3xl mx-auto space-y-4">
                <div
                  className={`flex items-start gap-4 ${
                    msg.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-[#1E293B] text-[11px] font-mono shrink-0 select-none shadow-pop-sm ${
                      msg.sender === "user"
                        ? "bg-[#F472B6] text-white"
                        : "bg-[#FBBF24] text-[#1E293B] font-bold"
                    }`}
                  >
                    {msg.sender === "user" ? "USR" : "AI"}
                  </div>

                  {/* Chat Bubble */}
                  <div
                    className={`min-w-0 flex-1 px-5 py-4 border-2 border-[#1E293B] text-sm leading-relaxed transition-bounce ${
                      msg.sender === "user"
                        ? "bg-[#8B5CF6] text-white shadow-pop-accent rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none font-medium"
                        : "bg-white text-[#1E293B] shadow-pop-secondary rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none"
                    }`}
                  >
                    {msg.sender === "ai" ? (
                      <div className="prose prose-xs max-w-none text-[#1E293B] prose-headings:font-heading prose-headings:font-bold prose-headings:text-[#1E293B] prose-p:text-[#1E293B] prose-strong:text-[#1E293B] prose-code:text-[#8B5CF6] prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-a:text-[#8B5CF6] prose-a:underline">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    )}

                    {/* Mobile Inline Reactive Components (rendered below message) */}
                    {msg.sender === "ai" &&
                      msg.components &&
                      msg.components.length > 0 && (
                        <div className="mt-4 md:hidden space-y-4">
                          {msg.components.map((name) => (
                            <motion.div
                              key={name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                type: "spring" as const,
                                stiffness: 200,
                                damping: 20,
                              }}
                            >
                              {renderComponent(name)}
                            </motion.div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}

            {/* Bouncing Dots typing indicator */}
            {isTyping && (
              <div className="max-w-3xl mx-auto flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-[#FBBF24] border-2 border-[#1E293B] flex items-center justify-center text-[11px] font-mono text-[#1E293B] shadow-pop-sm shrink-0 font-bold">
                  AI
                </div>
                <div className="bg-white border-2 border-[#1E293B] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none px-5 py-4 flex items-center gap-1.5 shadow-pop-sm">
                  <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-[#FBBF24] rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Area: Suggestions + Input */}
          <div className="border-t-2 border-[#1E293B] bg-[#FFFDF5] px-6 py-5 shrink-0">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Suggestion Chips */}
              <div className="relative overflow-hidden h-9 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={chipOffset}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-2 overflow-x-auto no-scrollbar py-1"
                  >
                    {visibleSuggestions.map((suggest, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubmit(undefined, suggest)}
                        className="shrink-0 px-4 py-1.5 rounded-full bg-white hover:bg-[#FBBF24] border-2 border-[#1E293B] shadow-pop-sm text-xs font-semibold text-[#1E293B] transition-bounce cursor-none interactive"
                      >
                        {suggest}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSubmit} className="flex gap-3 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Sanskar's AI..."
                  className="flex-1 bg-white border-2 border-[#1E293B] focus:border-[#8B5CF6] rounded-xl py-3.5 pl-4 pr-14 text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all duration-200 shadow-pop-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7c3aed] text-white border-2 border-[#1E293B] shadow-pop-sm transition-bounce active:translate-x-[1px] active:translate-y-[1px] active:shadow-pop-sm cursor-none interactive"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Desktop Reactive Sidebar (components determined by backend) */}
        <AnimatePresence>
          {activeSidebarComponents.length > 0 && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 352, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                type: "spring" as const,
                stiffness: 220,
                damping: 24,
              }}
              className="hidden md:flex flex-col border-l-2 border-[#1E293B] bg-[#FFFDF5] overflow-y-auto p-4 space-y-4 scrollbar-thin select-none shrink-0"
            >
              <div className="flex items-center gap-2 px-1 py-1 text-xs text-[#1E293B] font-heading font-extrabold border-b-2 border-[#1E293B] pb-2 mb-1">
                <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
                <span className="tracking-wide">LIVE INTEGRATIONS</span>
              </div>

              {activeSidebarComponents.map((name) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: "spring" as const,
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  {renderComponent(name)}
                </motion.div>
              ))}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
