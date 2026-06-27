import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Sparkles, AlertCircle, MessageSquare, BookOpen, 
  HelpCircle, ShieldCheck, RefreshCw, Layers, BrainCircuit, GraduationCap 
} from "lucide-react";
import { StudyDoc, AIChat, Message } from "../types";

interface ChatViewProps {
  documents: StudyDoc[];
  user: any;
  theme: "light" | "dark";
}

export default function ChatView({ documents, user, theme }: ChatViewProps) {
  const isDark = theme === "dark";
  const [selectedDocId, setSelectedDocId] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<AIChat[]>([]);

  // Explain like I'm 10 state
  const [explainTerm, setExplainTerm] = useState("");
  const [explainLevel, setExplainLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [explanationText, setExplanationText] = useState("");
  const [explaining, setExplaining] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat histories on select document
  useEffect(() => {
    async function loadChatHistory() {
      try {
        const response = await fetch("/api/chats", {
          headers: { "x-user-id": user?.id || "user-123" }
        });
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data.chats);
          
          if (selectedDocId) {
            const activeChat = data.chats.find((c: AIChat) => c.docId === selectedDocId);
            if (activeChat) {
              setMessages(activeChat.messages);
            } else {
              setMessages([
                {
                  sender: "ai",
                  text: "Hello! I am your intelligent RAG Syllabus Tutor. Ask me any question based on this study material. I am bounded to respond only using facts found inside your uploaded notes.",
                  timestamp: new Date().toISOString()
                }
              ]);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadChatHistory();
  }, [selectedDocId, user]);

  // Set default document if available
  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      const processed = documents.find((d) => d.processingStatus === "processed");
      if (processed) setSelectedDocId(processed.id);
    }
  }, [documents]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedDocId) return;

    const userMsgText = query;
    setQuery("");
    setLoading(true);

    // Append local user message
    const tempMessages = [
      ...messages,
      { sender: "user" as const, text: userMsgText, timestamp: new Date().toISOString() }
    ];
    setMessages(tempMessages);

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({
          docId: selectedDocId,
          message: userMsgText
        })
      });

      if (response.ok) {
        const data = await response.json();
        const activeChat = data.chat as AIChat;
        setMessages(activeChat.messages);
      } else {
        setMessages([
          ...tempMessages,
          { sender: "ai", text: "AI Tutor server was unable to formulate a response. Ensure your API key has quota.", timestamp: new Date().toISOString() }
        ]);
      }
    } catch (err: any) {
      setMessages([
        ...tempMessages,
        { sender: "ai", text: `Connection timeout: ${err.message}`, timestamp: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Explain concept lookups
  const handleExplainConcept = async () => {
    if (!explainTerm.trim()) return;
    setExplaining(true);
    setExplanationText("");
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({
          concept: explainTerm,
          level: explainLevel
        })
      });
      if (response.ok) {
        const data = await response.json();
        setExplanationText(data.explanation);
      } else {
        setExplanationText("Failed to compile explanation context.");
      }
    } catch (err) {
      setExplanationText("Syllabus service timeout.");
    } finally {
      setExplaining(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="space-y-6 h-[calc(100vh-8.5rem)] flex flex-col justify-between">
      
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden min-h-0">
        
        {/* Main Conversation Column */}
        <div className={`p-5 rounded-2xl border lg:col-span-3 flex flex-col justify-between h-full min-h-0 ${
          isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"
        }`}>
          {/* Header select */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800/50 mb-4 gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold font-display">Bounded Document Context:</span>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className={`text-xs p-1.5 rounded-lg border outline-hidden max-w-[250px] truncate ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                {documents.filter((d) => d.processingStatus === "processed").length === 0 ? (
                  <option value="">No Processed Documents</option>
                ) : (
                  documents
                    .filter((d) => d.processingStatus === "processed")
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))
                )}
              </select>
            </div>

            {activeDoc && (
              <span className="text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md shrink-0 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Bounded RAG Security: 100% Guaranteed
              </span>
            )}
          </div>

          {/* Conversation Screen Scroll */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${
                  msg.sender === "user" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-[#161e31] text-indigo-400 border border-gray-800"
                }`}>
                  {msg.sender === "user" ? "ME" : "AI"}
                </div>

                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-indigo-600/90 text-white rounded-tr-none"
                    : isDark 
                      ? "bg-[#161d30]/60 border border-gray-800 text-gray-200 rounded-tl-none" 
                      : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-none shadow-xs"
                }`}>
                  {msg.text}
                  <span className="text-[9px] text-gray-500 block text-right mt-1.5 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#161e31] border border-gray-800 flex items-center justify-center text-indigo-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#161d30]/30 border border-gray-800/30 text-xs text-gray-500 flex items-center gap-2">
                  <span>AI Tutor is querying indexing database...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Prompt Entry Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              required
              disabled={!selectedDocId}
              placeholder={selectedDocId ? "Query active document... e.g. 'What is process management?'" : "Ingest a document first to start chatting."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-1 text-xs p-3 rounded-xl border outline-hidden ${
                isDark ? "bg-[#161e31] border-gray-800 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 focus:bg-white text-gray-800"
              }`}
            />
            <button
              type="submit"
              disabled={!selectedDocId || loading}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white shadow-lg shadow-indigo-600/10 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Explain Like I'm 10 Look-up Column */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between h-full min-h-0 ${
          isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"
        }`}>
          <div className="space-y-4 overflow-y-auto pr-1">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <BrainCircuit className="w-4.5 h-4.5 text-indigo-500" />
              <span>Explain like I'm 10</span>
            </h3>
            <p className={`text-[10px] leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Lookup any academic jargon, scientific formula, or system concept across three customizable explanation models.
            </p>

            {/* Input concept */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Concept or Term</label>
              <input
                type="text"
                placeholder="e.g., Backpropagation, RTOS"
                value={explainTerm}
                onChange={(e) => setExplainTerm(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              />
            </div>

            {/* Explain level select */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Pedagogical Tier</label>
              <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden border border-gray-800 text-[9px] font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setExplainLevel("beginner")}
                  className={`p-1.5 transition-all cursor-pointer ${explainLevel === "beginner" ? "bg-indigo-600 text-white" : "text-gray-400"}`}
                >
                  ELI10
                </button>
                <button
                  type="button"
                  onClick={() => setExplainLevel("intermediate")}
                  className={`p-1.5 transition-all cursor-pointer ${explainLevel === "intermediate" ? "bg-indigo-600 text-white" : "text-gray-400"}`}
                >
                  Grad
                </button>
                <button
                  type="button"
                  onClick={() => setExplainLevel("advanced")}
                  className={`p-1.5 transition-all cursor-pointer ${explainLevel === "advanced" ? "bg-indigo-600 text-white" : "text-gray-400"}`}
                >
                  PhD
                </button>
              </div>
            </div>

            <button
              onClick={handleExplainConcept}
              disabled={explaining || !explainTerm}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase shadow-md shrink-0 cursor-pointer"
            >
              {explaining ? "Decompiling Concept..." : "Analyze Concept"}
            </button>

            {/* Response area scroll */}
            <div className={`p-3 rounded-xl border max-h-48 overflow-y-auto leading-relaxed ${
              isDark ? "bg-[#161e31]/50 border-gray-800/40 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
            }`}>
              {explanationText ? (
                <p className="text-[10px] whitespace-pre-wrap">{explanationText}</p>
              ) : (
                <p className="text-[10px] text-gray-500 text-center py-4">No concept analyzed yet.</p>
              )}
            </div>
          </div>

          <div className={`pt-3 border-t text-[9px] text-gray-500 leading-relaxed font-semibold uppercase font-mono ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}>
            Multi-tier explaining adapts syntax structures instantly.
          </div>
        </div>

      </div>
    </div>
  );
}
