import { useState } from "react"
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown } from "lucide-react"

const tree = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "components",
        type: "folder",
        children: [],
      },
      {
        name: "pages",
        type: "folder",
        children: [],
      },
      { name: "App.jsx", type: "file" },
      { name: "main.jsx", type: "file" },
    ],
  },
]

function TreeNode({ node, depth = 0, selectedFile, onSelect }) {
  const [open, setOpen] = useState(depth === 0)
  const isFolder = node.type === "folder"
  const isSelected = !isFolder && selectedFile === node.name

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer text-sm transition-colors
          ${isSelected
            ? "bg-blue-600/20 text-blue-300"
            : isFolder
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) setOpen((o) => !o)
          else onSelect(isSelected ? null : node.name)
        }}
      >
        {isFolder ? (
          <>
            <span className="text-gray-600">
              {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
            {open
              ? <FolderOpen size={15} className="text-yellow-400 shrink-0" />
              : <Folder size={15} className="text-yellow-400 shrink-0" />
            }
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <FileCode size={15} className={isSelected ? "text-blue-400" : "text-blue-500 shrink-0"} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && open && node.children?.map((child) => (
        <TreeNode
          key={child.name}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default function FileTree() {
  const [selectedFile, setSelectedFile] = useState(null)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden w-64">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200 tracking-wide">Project</h2>
        {selectedFile && (
          <span className="text-xs text-gray-500 truncate max-w-32">{selectedFile}</span>
        )}
      </div>

      {/* tree */}
      <div className="p-2">
        {tree.map((node) => (
          <TreeNode
            key={node.name}
            node={node}
            selectedFile={selectedFile}
            onSelect={setSelectedFile}
          />
        ))}
      </div>

      {/* footer */}
      <div className="px-4 py-2 border-t border-gray-800 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-xs text-gray-600">
          {selectedFile ? selectedFile : "No file selected"}
        </span>
      </div>
    </div>
  )
}