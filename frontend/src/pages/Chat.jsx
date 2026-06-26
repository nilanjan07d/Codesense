import { useState, useRef, useEffect } from "react"
import Navbar from "../components/Navbar"
import ChatBox from "../components/ChatBox"
import { Bot, Paperclip, Send } from "lucide-react"

const INITIAL_MESSAGES = [
  {
    role: "ai",
    text: "Codebase loaded. I can see 12 files — ask me anything about structure, bugs, or improvements.",
    time: "09:41 AM",
  },
]

const SUGGESTIONS = [
  "What issues were found?",
  "Explain the file structure",
  "How can I improve performance?",
  "Any security concerns?",
]

function MessageBubble({ message }) {
  const isUser = message.role === "user"
  return (
    <div className={`flex gap-2 items-end ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center
                    text-[10px] font-semibold shrink-0 mb-1
                    ${isUser
                      ? "bg-indigo-400/15 border border-indigo-400/25 text-indigo-400"
                      : "bg-sky-400/12 border border-sky-400/20 text-sky-400"
                    }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      <div className={isUser ? "items-end flex flex-col" : "items-start flex flex-col"}>
        {/* Bubble */}
        <div
          className={`max-w-[78%] px-[14px] py-[10px] text-[12.5px] leading-relaxed
                      ${isUser
                        ? "bg-sky-400/12 border border-sky-400/20 text-sky-200 rounded-xl rounded-br-[3px]"
                        : "bg-[#0f1829]/95 border border-white/[0.07] text-slate-400 rounded-xl rounded-bl-[3px]"
                      }`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {message.text}
        </div>
        {/* Timestamp */}
        {message.time && (
          <span className="font-mono text-[9px] text-[#1e3a5f] mt-1 px-0.5">
            {message.time}
          </span>
        )}
      </div>
    </div>
  )
}

function Chat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleNewMessage = (userMsg, aiReply) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg, time: now },
      { role: "ai", text: aiReply, time: now },
    ])
  }

  const handleSuggestion = (text) => {
    handleNewMessage(text, "Processing your request…")
  }

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-200 flex flex-col relative overflow-hidden">

      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "radial-gradient(circle, #1e3a5f 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient glow — bottom center */}
      <div
        className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 w-[500px] h-[300px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(56,189,248,0.05) 0%, transparent 70%)",
        }}
      />

      <Navbar />

      <div className="relative flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <div className="w-[38px] h-[38px] rounded-[9px] bg-sky-400/[0.08] border border-sky-400/20
                          flex items-center justify-center shrink-0">
            <Bot size={18} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-slate-100 tracking-tight mb-0.5">
              Ask AI about your code
            </h1>
            <p className="font-mono text-[11px] text-slate-600">
              instant explanations, bug fixes, suggestions
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-green-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            model ready
          </div>
        </div>

        {/* Message history */}
        {messages.length > 0 && (
          <div className="flex-1 flex flex-col gap-2.5 mb-4 overflow-y-auto
                          max-h-[50vh] pr-1
                          [&::-webkit-scrollbar]:w-[3px]
                          [&::-webkit-scrollbar-thumb]:bg-sky-400/15
                          [&::-webkit-scrollbar-track]:bg-transparent">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-sky-400/[0.06] border border-sky-400/12
                            flex items-center justify-center">
              <Bot size={22} className="text-slate-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No messages yet</p>
            <p className="font-mono text-[11px] text-[#1e3a5f]">
              Ask anything about your codebase
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="font-mono text-[11px] px-3 py-1.5 rounded-md
                             bg-sky-400/[0.05] border border-sky-400/12 text-slate-600
                             hover:bg-sky-400/10 hover:border-sky-400/25 hover:text-sky-400
                             transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2 items-end flex-shrink-0">
          <div className="flex-1 flex items-center bg-[#0f1829]/95 border border-white/[0.08]
                          rounded-[10px] transition-colors focus-within:border-sky-400/35">
            <input
              type="text"
              placeholder="Ask about your code…"
              className="flex-1 bg-transparent border-none outline-none px-4 py-3
                         text-[13px] text-slate-300 placeholder-[#1e3a5f] font-sans"
            />
            <button className="px-3 text-slate-700 hover:text-sky-400 transition-colors">
              <Paperclip size={15} />
            </button>
          </div>
          <button
            className="w-[38px] h-[38px] rounded-[8px] bg-sky-400 border-none flex items-center
                       justify-center cursor-pointer transition-all shrink-0
                       hover:bg-sky-300 hover:-translate-y-px active:translate-y-0"
          >
            <Send size={14} className="text-[#080d14]" />
          </button>
        </div>

        {/* Wire up your real ChatBox below the custom UI */}
        <div className="hidden">
          <ChatBox onSend={handleNewMessage} />
        </div>

        <p className="text-center font-mono text-[10px] text-[#1e3a5f] mt-3">
          responses are AI-generated · always verify critical code changes
        </p>
      </div>
    </div>
  )
}

export default Chat