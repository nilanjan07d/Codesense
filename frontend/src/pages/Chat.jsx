import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import ChatBox from "../components/ChatBox"
import { Bot, Sparkles } from "lucide-react"

const SUGGESTIONS = [
  "What issues were found?",
  "Explain the file structure",
  "How can I improve performance?",
  "Any security concerns?",
  "Which file has the most problems?",
  "Summarize the project in one sentence",
]

function MessageBubble({ message }) {
  const isUser = message.role === "user"
  return (
    <div className={`flex gap-2.5 items-end ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center
                    text-[10px] font-bold shrink-0 mb-1
                    ${isUser
                      ? "bg-indigo-400/15 border border-indigo-400/25 text-indigo-400"
                      : "bg-sky-400/12 border border-sky-400/20 text-sky-400"
                    }`}
      >
        {isUser ? "U" : "AI"}
      </div>
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-[14px] py-[10px] text-[12.5px] leading-relaxed rounded-xl
                      ${isUser
                        ? "bg-sky-400/12 border border-sky-400/20 text-sky-200 rounded-br-[3px]"
                        : "bg-[#0f1829]/95 border border-white/[0.07] text-slate-300 rounded-bl-[3px]"
                      }`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {message.text}
        </div>
        {message.time && (
          <span className="font-mono text-[9px] text-slate-700 px-0.5">{message.time}</span>
        )}
      </div>
    </div>
  )
}

// Load project from router state OR sessionStorage fallback
function loadProject(locationState) {
  if (locationState?.analysis) return locationState
  try {
    const saved = sessionStorage.getItem("codesense_project")
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

function Chat() {
  const location = useLocation()
  const project = loadProject(location.state)
  const analysis = project?.analysis
  const filename = project?.filename

  const [messages, setMessages] = useState(() => {
    if (analysis) {
      return [{
        role: "ai",
        text: `Codebase loaded ✓\n\nI've analyzed **${filename}** and found ${analysis.issues?.length ?? 0} issue(s) with a quality score of ${analysis.quality_score}/10.\n\nAsk me anything about your code — structure, bugs, improvements, or specific files.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]
    }
    return []
  })

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleNewMessage = (userMsg, aiReply) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setMessages(prev => [
      ...prev,
      { role: "user", text: userMsg, time: now },
      { role: "ai",   text: aiReply, time: now },
    ])
  }

  const handleSuggestion = (text) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setMessages(prev => [...prev, { role: "user", text, time: now }])
    fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: messages }),
    })
      .then(r => r.json())
      .then(data => {
        setMessages(prev => [
          ...prev,
          { role: "ai", text: data.reply ?? "No response.", time: now },
        ])
      })
      .catch(() => {
        setMessages(prev => [
          ...prev,
          { role: "ai", text: "Couldn't reach the server. Is the backend running?", time: now },
        ])
      })
  }

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-200 flex flex-col relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "radial-gradient(circle, #1e3a5f 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 w-[500px] h-[300px]"
        style={{ background: "radial-gradient(ellipse, rgba(56,189,248,0.05) 0%, transparent 70%)" }}
      />

      <Navbar />

      <div className="relative flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <div className="w-[38px] h-[38px] rounded-[9px] bg-sky-400/[0.08] border border-sky-400/20
                          flex items-center justify-center shrink-0">
            <Bot size={18} className="text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-bold text-slate-100 tracking-tight">CodeSense Chat</h1>
            <p className="font-mono text-[11px] text-slate-600 truncate">
              {filename ? `context: ${filename}` : "no project loaded — upload from Home first"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0 text-green-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            live
          </div>
        </div>

        {/* No project warning */}
        {!analysis && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl
                          bg-yellow-400/[0.06] border border-yellow-400/15 text-yellow-400 text-[12px]">
            <span className="text-base shrink-0">⚠</span>
            No project loaded. Go to Home, upload a ZIP, then come back to chat.
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto mb-4
                        [&::-webkit-scrollbar]:w-[3px]
                        [&::-webkit-scrollbar-thumb]:bg-sky-400/15
                        [&::-webkit-scrollbar-track]:bg-transparent">

          {messages.length === 0 && analysis && (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 py-12">
              <div className="w-12 h-12 rounded-xl bg-sky-400/[0.06] border border-sky-400/12
                              flex items-center justify-center">
                <Sparkles size={20} className="text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Ready to answer</p>
                <p className="font-mono text-[11px] text-slate-700 mt-0.5">Try one of these to get started</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-1 max-w-md">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSuggestion(s)}
                    className="font-mono text-[11px] px-3 py-1.5 rounded-md
                               bg-sky-400/[0.05] border border-sky-400/12 text-slate-600
                               hover:bg-sky-400/10 hover:border-sky-400/25 hover:text-sky-400 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => <MessageBubble key={i} message={m} />)}

          {/* Suggestion chips after welcome message */}
          {messages.length === 1 && messages[0].role === "ai" && (
            <div className="flex flex-wrap gap-2 mt-1 ml-9">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSuggestion(s)}
                  className="font-mono text-[11px] px-3 py-1.5 rounded-md
                             bg-sky-400/[0.05] border border-sky-400/12 text-slate-600
                             hover:bg-sky-400/10 hover:border-sky-400/25 hover:text-sky-400 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatBox onSend={handleNewMessage} history={messages} />
        </div>
      </div>
    </div>
  )
}

export default Chat