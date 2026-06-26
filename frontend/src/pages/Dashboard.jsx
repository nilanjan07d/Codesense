import Navbar from "../components/Navbar"
import FileTree from "../components/FileTree"
import { Sparkles, FileCode2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

const stats = [
  {
    label: "Total Files",
    value: "12",
    icon: FileCode2,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-400/10 border border-sky-400/20",
    valueColor: "text-slate-100",
  },
  {
    label: "Issues Found",
    value: "3",
    icon: AlertCircle,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-400/10 border border-yellow-400/20",
    valueColor: "text-yellow-400",
  },
  {
    label: "Checks Passed",
    value: "9",
    icon: CheckCircle,
    iconColor: "text-green-400",
    iconBg: "bg-green-400/10 border border-green-400/20",
    valueColor: "text-green-400",
  },
]

const summaryLines = [
  {
    bullet: "›",
    bulletColor: "text-sky-400",
    text: (
      <>
        <span className="text-slate-300">Clean structure</span>
        {" — good separation of concerns across components and utilities."}
      </>
    ),
  },
  {
    bullet: "›",
    bulletColor: "text-yellow-400",
    text: (
      <>
        <span className="text-yellow-400">3 issues in src/components</span>
        {" — potential null-ref in helpers.js and unhandled promise in routes.js."}
      </>
    ),
  },
  {
    bullet: "›",
    bulletColor: "text-green-400",
    text: (
      <>
        <span className="text-green-400">No security vulnerabilities</span>
        {" detected in the uploaded files."}
      </>
    ),
  },
]

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#080d14] text-slate-200 flex flex-col relative overflow-hidden">

      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #1e3a5f 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient glow — top-right corner */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 70%)",
        }}
      />

      <Navbar />

      <div className="relative max-w-6xl mx-auto w-full px-8 py-10">

        {/* Header row */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-bold text-slate-100 tracking-tight mb-1">
              Project dashboard
            </h1>
            <p className="font-mono text-[11px] text-slate-600">
              overview / last-upload · 2 min ago
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                       bg-white/[0.03] border border-white/[0.07] text-slate-500
                       text-xs font-medium transition-colors
                       hover:border-sky-400/30 hover:text-sky-400 hover:bg-sky-400/[0.05]"
          >
            <RefreshCw size={11} />
            Re-analyze
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {stats.map(({ label, value, icon: Icon, iconColor, iconBg, valueColor }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-[#0f1829]/90 border border-white/[0.06]
                         rounded-xl px-4 py-3.5 transition-colors hover:border-white/[0.12]"
            >
              <div className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={16} className={iconColor} />
              </div>
              <div>
                <p className={`font-mono text-[22px] font-bold leading-none mb-1 ${valueColor}`}>
                  {value}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-3">

          {/* File Tree panel */}
          <div className="bg-[#0f1829]/90 border border-white/[0.06] rounded-xl p-[18px]">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.05]">
              <FileCode2 size={14} className="text-sky-400" />
              <h2 className="text-[13px] font-semibold text-slate-300">File tree</h2>
              <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded
                               bg-sky-400/[0.08] border border-sky-400/15 text-sky-400">
                12 files
              </span>
            </div>
            <FileTree />
          </div>

          {/* AI Summary panel */}
          <div className="bg-[#0f1829]/90 border border-white/[0.06] rounded-xl p-[18px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.05]">
              <Sparkles size={14} className="text-sky-400" />
              <h2 className="text-[13px] font-semibold text-slate-300">AI summary</h2>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {summaryLines.map(({ bullet, bulletColor, text }, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 px-3 py-2.5 rounded-[7px]
                             bg-[#080d14]/60 border border-white/[0.04]
                             transition-colors hover:border-sky-400/10"
                >
                  <span className={`text-sm shrink-0 mt-px leading-snug ${bulletColor}`}>
                    {bullet}
                  </span>
                  <p className="text-[12px] text-slate-600 leading-[1.55]">{text}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
              <p className="font-mono text-[11px] text-slate-700">
                last scan · 2 min ago
              </p>
              <div className="flex items-center gap-2">
                <div className="w-[60px] h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-green-500/70 rounded-full" />
                </div>
                <span className="font-mono text-[11px] font-semibold text-green-400">
                  7 / 10
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard