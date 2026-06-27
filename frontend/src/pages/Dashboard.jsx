import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import {
  Sparkles, FileCode2, AlertCircle, CheckCircle,
  RefreshCw, Folder, FolderOpen, FileText, ChevronRight, ChevronDown
} from "lucide-react"

function severityColor(severity) {
  if (severity === "error") return { bullet: "text-red-400", border: "hover:border-red-400/10" }
  if (severity === "warning") return { bullet: "text-yellow-400", border: "hover:border-yellow-400/10" }
  return { bullet: "text-sky-400", border: "hover:border-sky-400/10" }
}

// ── File Tree Node ────────────────────────────────────────────────────────────
function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2)
  const isFolder = node.type === "folder"

  const ext = node.name.split(".").pop()
  const fileColor =
    ["jsx", "tsx"].includes(ext) ? "text-sky-400" :
    ["js", "ts"].includes(ext)   ? "text-yellow-400" :
    ["py"].includes(ext)         ? "text-green-400" :
    ["css", "scss"].includes(ext)? "text-pink-400" :
    ["json", "yaml", "yml"].includes(ext) ? "text-orange-400" :
    ["md"].includes(ext)         ? "text-purple-400" :
    "text-slate-400"

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-[3px] rounded-md cursor-pointer
                   text-[12px] hover:bg-white/[0.04] transition-colors group"
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
        onClick={() => isFolder && setOpen(o => !o)}
      >
        {isFolder ? (
          <>
            <span className="text-slate-600 w-3 shrink-0">
              {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </span>
            {open
              ? <FolderOpen size={13} className="text-yellow-400/80 shrink-0" />
              : <Folder size={13} className="text-yellow-400/60 shrink-0" />
            }
            <span className="text-slate-300 font-medium">{node.name}</span>
            {node.children && (
              <span className="ml-auto pr-2 text-[10px] text-slate-700 font-mono opacity-0 group-hover:opacity-100">
                {node.children.length}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <FileText size={12} className={`${fileColor} shrink-0`} />
            <span className="text-slate-400">{node.name}</span>
          </>
        )}
      </div>
      {isFolder && open && node.children?.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const location = useLocation()
  const [analysis, setAnalysis] = useState(null)
  const [meta, setMeta] = useState(null)
  const [fileTree, setFileTree] = useState([])

  // Load from router state OR sessionStorage fallback
  useEffect(() => {
    const src = location.state?.analysis
      ? location.state
      : (() => {
          try { return JSON.parse(sessionStorage.getItem("codesense_project") || "null") }
          catch { return null }
        })()
    if (src?.analysis) {
      setAnalysis(src.analysis)
      setMeta({ filename: src.filename, size_bytes: src.size_bytes, language: src.language })
      setFileTree(src.file_tree || [])
    }
  }, [location.state])

  const issueCount = analysis?.issues?.length ?? 0
  const suggCount  = analysis?.suggestions?.length ?? 0
  const score      = analysis?.quality_score ?? null

  const stats = [
    {
      label: "Language",
      value: meta?.language?.toUpperCase() ?? "—",
      icon: FileCode2,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-400/10 border border-sky-400/20",
      valueColor: "text-slate-100",
    },
    {
      label: "Issues Found",
      value: issueCount,
      icon: AlertCircle,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-400/10 border border-yellow-400/20",
      valueColor: issueCount > 0 ? "text-yellow-400" : "text-slate-100",
    },
    {
      label: "Suggestions",
      value: suggCount,
      icon: CheckCircle,
      iconColor: "text-green-400",
      iconBg: "bg-green-400/10 border border-green-400/20",
      valueColor: "text-green-400",
    },
  ]

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-200 flex flex-col relative overflow-hidden">

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle, #1e3a5f 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      {/* Glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px]"
        style={{ background: "radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 70%)" }}
      />

      <Navbar />

      <div className="relative max-w-6xl mx-auto w-full px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-bold text-slate-100 tracking-tight mb-1">Project Dashboard</h1>
            <p className="font-mono text-[11px] text-slate-600">
              {meta?.filename
                ? `${meta.filename} · ${(meta.size_bytes / 1024).toFixed(1)} KB`
                : "No file analyzed yet — upload from Home"}
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                       bg-white/[0.03] border border-white/[0.07] text-slate-500
                       text-xs font-medium transition-colors
                       hover:border-sky-400/30 hover:text-sky-400 hover:bg-sky-400/[0.05]"
          >
            <RefreshCw size={11} /> Re-analyze
          </button>
        </div>

        {/* Empty state */}
        {!analysis && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <FileCode2 size={36} className="text-slate-700" />
            <p className="text-slate-500 text-sm">No analysis data found.</p>
            <p className="text-slate-700 text-xs">Upload a file from the Home page to get started.</p>
          </div>
        )}

        {analysis && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {stats.map(({ label, value, icon: Icon, iconColor, iconBg, valueColor }) => (
                <div key={label}
                  className="flex items-center gap-3 bg-[#0f1829]/90 border border-white/[0.06]
                             rounded-xl px-4 py-3.5 transition-colors hover:border-white/[0.12]"
                >
                  <div className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                  <div>
                    <p className={`font-mono text-[22px] font-bold leading-none mb-1 ${valueColor}`}>{value}</p>
                    <p className="text-[11px] text-slate-600 font-medium">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid md:grid-cols-2 gap-3">

              {/* Left: Summary + Issues */}
              <div className="flex flex-col gap-3">

                {/* Summary */}
                <div className="bg-[#0f1829]/90 border border-white/[0.06] rounded-xl p-[18px]">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.05]">
                    <Sparkles size={14} className="text-sky-400" />
                    <h2 className="text-[13px] font-semibold text-slate-300">AI Summary</h2>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Issues */}
                <div className="bg-[#0f1829]/90 border border-white/[0.06] rounded-xl p-[18px]">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.05]">
                    <AlertCircle size={14} className="text-yellow-400" />
                    <h2 className="text-[13px] font-semibold text-slate-300">Issues</h2>
                    <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded
                                     bg-yellow-400/[0.08] border border-yellow-400/15 text-yellow-400">
                      {issueCount} found
                    </span>
                  </div>
                  {issueCount === 0 ? (
                    <p className="text-[12px] text-slate-600">No issues detected.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {analysis.issues.map((issue, i) => {
                        const { bullet, border } = severityColor(issue.severity)
                        return (
                          <div key={i}
                            className={`flex gap-2.5 px-3 py-2.5 rounded-[7px]
                                       bg-[#080d14]/60 border border-white/[0.04] transition-colors ${border}`}
                          >
                            <span className={`text-sm shrink-0 mt-px ${bullet}`}>›</span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className={`text-[10px] font-semibold uppercase ${bullet}`}>{issue.severity}</span>
                                {issue.file && <span className="font-mono text-[10px] text-slate-600">{issue.file}</span>}
                                {issue.line && <span className="font-mono text-[10px] text-slate-700">line {issue.line}</span>}
                              </div>
                              <p className="text-[12px] text-slate-400 leading-snug">{issue.message}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Suggestions + File Tree */}
              <div className="flex flex-col gap-3">

                {/* Suggestions */}
                <div className="bg-[#0f1829]/90 border border-white/[0.06] rounded-xl p-[18px]">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.05]">
                    <CheckCircle size={14} className="text-green-400" />
                    <h2 className="text-[13px] font-semibold text-slate-300">Suggestions</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i}
                        className="flex gap-2.5 px-3 py-2.5 rounded-[7px]
                                   bg-[#080d14]/60 border border-white/[0.04]
                                   transition-colors hover:border-green-400/10"
                      >
                        <span className="text-sm shrink-0 mt-px text-green-400">›</span>
                        <p className="text-[12px] text-slate-400 leading-[1.55]">{s}</p>
                      </div>
                    ))}
                  </div>
                  {score !== null && (
                    <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                      <p className="font-mono text-[11px] text-slate-700">quality score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-[60px] h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-green-500/70" style={{ width: `${score * 10}%` }} />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-green-400">{score} / 10</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-time File Tree */}
                <div className="bg-[#0f1829]/90 border border-white/[0.06] rounded-xl p-[18px]">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.05]">
                    <Folder size={14} className="text-yellow-400" />
                    <h2 className="text-[13px] font-semibold text-slate-300">File Structure</h2>
                    <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded
                                     bg-yellow-400/[0.08] border border-yellow-400/15 text-yellow-400">
                      {meta?.filename}
                    </span>
                  </div>

                  {fileTree.length === 0 ? (
                    <p className="text-[12px] text-slate-600">No file structure available.</p>
                  ) : (
                    <div className="max-h-[260px] overflow-y-auto pr-1
                                    scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                      {fileTree.map((node, i) => (
                        <TreeNode key={i} node={node} depth={0} />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}