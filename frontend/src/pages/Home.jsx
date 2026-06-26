import Navbar from "../components/Navbar"
import UploadBox from "../components/UploadBox"
import { Code2, Zap, ShieldCheck, GitBranch } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    desc: "Full breakdown of your code in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Bug Detection",
    desc: "Spot issues, anti-patterns, and security risks.",
  },
  {
    icon: GitBranch,
    title: "Structure Mapping",
    desc: "Visualize layout and component relationships.",
  },
]

const fileTypes = [".py", ".ts", ".js", ".go", ".java", ".rs", ".cpp", "+ more"]

function Home() {
  return (
    <div className="min-h-screen bg-[#080d14] text-slate-200 flex flex-col relative overflow-hidden">

      {/* Dot-grid background — the signature element */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(circle, #1e3a5f 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(56,189,248,0.08) 0%, transparent 70%)",
        }}
      />

      <Navbar />

      <main className="relative flex-1 max-w-5xl mx-auto w-full px-8 py-14">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-sky-400/[0.08] border border-sky-400/20 rounded-full px-3 py-1 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-mono text-[11px] font-medium text-sky-400 tracking-widest uppercase">
            AI-Powered Code Intelligence
          </span>
        </div>

        {/* Hero headline */}
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-100 mb-4">
          Understand any
          <br />
          <span className="text-sky-400 relative">
            codebase instantly
            <span className="absolute left-0 right-0 bottom-0.5 h-0.5 bg-gradient-to-r from-sky-400 to-transparent rounded-full" />
          </span>
        </h1>

        <p className="text-slate-500 text-base leading-relaxed max-w-[460px] mb-8">
          Upload a file and get an AI-generated summary, issue report, and actionable
          improvements — in seconds.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 bg-[#0f1829]/80 border border-white/[0.06]
                         rounded-xl p-4 transition-colors hover:border-sky-400/20 hover:bg-sky-400/[0.04]"
            >
              <div className="shrink-0 mt-0.5 w-[30px] h-[30px] rounded-[7px]
                              bg-sky-400/[0.08] border border-sky-400/15
                              flex items-center justify-center">
                <Icon size={14} className="text-sky-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-300 mb-0.5">{title}</p>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div className="relative rounded-xl border-[1.5px] border-dashed border-sky-400/25
                        bg-[#080d14]/60 p-8 text-center cursor-pointer
                        transition-colors hover:border-sky-400/50 hover:bg-sky-400/[0.03]">

          {/* Corner brackets */}
          {["top-2.5 left-2.5 border-t-[1.5px] border-l-[1.5px]",
            "top-2.5 right-2.5 border-t-[1.5px] border-r-[1.5px]",
            "bottom-2.5 left-2.5 border-b-[1.5px] border-l-[1.5px]",
            "bottom-2.5 right-2.5 border-b-[1.5px] border-r-[1.5px]",
          ].map((cls, i) => (
            <span key={i} className={`absolute w-2.5 h-2.5 border-sky-400 ${cls}`} />
          ))}

          {/* Upload icon */}
          <div className="w-11 h-11 rounded-[10px] bg-sky-400/[0.08] border border-sky-400/20
                          flex items-center justify-center mx-auto mb-3">
            <Code2 size={20} className="text-sky-400" />
          </div>

          <p className="text-sm font-semibold text-slate-200 mb-1">Drop your code file here</p>
          <p className="font-mono text-[12px] text-slate-600 mb-4">
            or drag and drop · max 1 MB
          </p>

          <UploadBox />

          {/* File type pills */}
          <div className="flex justify-center flex-wrap gap-1.5 mt-4">
            {fileTypes.map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] px-2 py-0.5 rounded
                           border border-white/[0.07] text-slate-600 bg-white/[0.02]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

export default Home