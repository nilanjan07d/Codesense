import { useState, useRef } from "react"
import { Upload, FileArchive, X, Loader2 } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
const ACCEPTED_TYPES = ["application/zip", "application/x-zip-compressed"]
const MAX_SIZE_MB = 50

export default function UploadBox() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const validateFile = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) return "Only .zip files are accepted."
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB.`
    return null
  }

  const pick = (f) => {
    if (!f) return
    const err = validateFile(f)
    if (err) { setError(err); setFile(null) }
    else { setError(""); setFile(f) }
  }

  const handleFileChange = (e) => pick(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files[0])
  }

  const uploadFile = async () => {
    if (!file) return
    setLoading(true)
    setError("")
    const formData = new FormData()
    formData.append("file", file)
    try {
      await axios.post(`${API_BASE}/upload`, formData)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const dropZoneClass = [
    "border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors",
    dragging
      ? "border-blue-400 bg-blue-500/10"
      : file
      ? "border-blue-600 bg-blue-500/5"
      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/30",
  ].join(" ")

  return (
    <div className="mt-10 flex flex-col gap-3">
      {/* Drop zone */}
      <label
        className={dropZoneClass}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className={`p-3 rounded-full transition-colors ${file ? "bg-blue-500/15" : "bg-gray-800"}`}>
          <Upload size={28} className={file ? "text-blue-400" : "text-gray-400"} />
        </div>
        <div className="text-center">
          <p className="text-gray-200 font-medium text-sm">
            {dragging ? "Drop it here" : file ? "Change ZIP file" : "Click or drag & drop a ZIP"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Max {MAX_SIZE_MB}MB · .zip only</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {/* File pill */}
      {file && (
        <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/60 border border-gray-700/60 px-3 py-2 rounded-lg">
          <FileArchive size={15} className="text-blue-400 shrink-0" />
          <span className="truncate flex-1">{file.name}</span>
          <span className="text-gray-500 shrink-0 text-xs">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
          <button
            onClick={() => { setFile(null); setError("") }}
            className="ml-1 text-gray-600 hover:text-red-400 transition-colors"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-400/8 border border-red-400/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={uploadFile}
        disabled={!file || loading}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-colors mt-1"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Uploading…" : "Analyze Code"}
      </button>
    </div>
  )
}