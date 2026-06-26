import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Loader2 } from "lucide-react"

function ChatBox({ onSend }) {
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef(null)

  // Auto-resize textarea as content grows
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px"
  }, [msg])

  const handleAsk = async () => {
    if (!msg.trim() || loading) return
    const userMessage = msg.trim()
    setLoading(true)
    setError("")
    setMsg("")

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      const aiReply = data.reply ?? data.message ?? "No response from server."

      onSend?.(userMessage, aiReply)
    } catch (err) {
      setError("Couldn't reach the server. Check your connection and try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const isEmpty = !msg.trim()

  return (
    <div className="flex flex-col gap-2">

      {/* Input wrapper */}
      <div
        className={`flex items-end gap-2 bg-[#0f1829]/95 rounded-xl
                    border transition-colors
                    ${error
                      ? "border-red-500/40"
                      : loading
                        ? "border-sky-400/20"
                        : "border-white/[0.08] focus-within:border-sky-400/35"
                    }`}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask about your code… (Enter to send, Shift+Enter for newline)"
          className="flex-1 bg-transparent border-none outline-none resize-none
                     px-4 py-3 text-[13px] text-slate-300 leading-relaxed
                     placeholder-[#1e3a5f] font-sans
                     disabled:opacity-50 disabled:cursor-not-allowed
                     overflow-hidden"
          style={{ minHeight: "44px", maxHeight: "140px" }}
        />

        {/* Attach button */}
        <button
          type="button"
          className="px-2 pb-3 text-slate-700 hover:text-sky-400 transition-colors shrink-0"
          title="Attach file"
        >
          <Paperclip size={15} />
        </button>

        {/* Send button */}
        <button
          onClick={handleAsk}
          disabled={loading || isEmpty}
          className="m-2 w-[34px] h-[34px] shrink-0 rounded-[7px] flex items-center justify-center
                     transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0
                     bg-sky-400 hover:bg-sky-300 hover:-translate-y-px active:translate-y-0"
          title="Send message"
        >
          {loading
            ? <Loader2 size={14} className="text-[#080d14] animate-spin" />
            : <Send size={13} className="text-[#080d14]" />
          }
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg
                        bg-red-500/[0.07] border border-red-500/20">
          <span className="text-red-400 text-sm shrink-0 mt-px">›</span>
          <p className="text-[12px] text-red-400/80 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Hint */}
      <p className="text-center font-mono text-[10px] text-[#1e3a5f]">
        Shift+Enter for newline · Enter to send
      </p>
    </div>
  )
}

export default ChatBox