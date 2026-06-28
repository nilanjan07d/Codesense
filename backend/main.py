from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
import zipfile
import io

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp",
                      ".c", ".cs", ".go", ".rs", ".php", ".rb", ".swift",
                      ".kt", ".html", ".css", ".json", ".yaml", ".yml",
                      ".sh", ".bash", ".sql", ".md", ".zip"}

CODE_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp",
                   ".c", ".cs", ".go", ".rs", ".php", ".rb", ".swift",
                   ".kt", ".html", ".css", ".json", ".yaml", ".yml",
                   ".sh", ".bash", ".sql", ".md"}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="CodeSense AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://codesense-six.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini Setup ──────────────────────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# ── In-memory session store ───────────────────────────────────────────────────
# Stores the last uploaded project context for the chat endpoint
project_context: dict = {}

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_file_extension(filename: str) -> str:
    dot_index = filename.rfind(".")
    if dot_index == -1:
        return ""
    return filename[dot_index:].lower()


def validate_file(file: UploadFile, content: bytes) -> None:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing.")
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f"Unsupported file type '{ext}'.")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB size limit.")


def extract_file_tree(zip_bytes: bytes) -> list:
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            paths = [
                name for name in zf.namelist()
                if not name.startswith("__MACOSX") and not name.endswith(".DS_Store")
            ]
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file.")

    root = {}
    for path in paths:
        parts = path.strip("/").split("/")
        node = root
        for part in parts:
            if not part:
                continue
            if part not in node:
                node[part] = {}
            node = node[part]

    def dict_to_tree(name, children, path=""):
        full_path = f"{path}/{name}" if path else name
        is_file = len(children) == 0
        node = {"name": name, "type": "file" if is_file else "folder", "path": full_path}
        if not is_file:
            node["children"] = [
                dict_to_tree(k, v, full_path)
                for k, v in sorted(children.items(), key=lambda x: (len(x[1]) == 0, x[0]))
            ]
        return node

    return [dict_to_tree(k, v) for k, v in sorted(root.items(), key=lambda x: (len(x[1]) == 0, x[0]))]


def extract_code_from_zip(zip_bytes: bytes) -> str:
    combined = []
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            for name in zf.namelist():
                if name.startswith("__MACOSX") or name.endswith("/"):
                    continue
                ext = get_file_extension(name)
                if ext in CODE_EXTENSIONS:
                    try:
                        code = zf.read(name).decode("utf-8", errors="replace")
                        combined.append(f"### File: {name}\n{code}")
                    except Exception:
                        continue
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file.")

    if not combined:
        raise HTTPException(status_code=400, detail="No readable code files found in ZIP.")

    return "\n\n".join(combined[:20])


async def analyze_with_gemini(filename: str, code: str) -> dict:
    prompt = f"""You are an expert code reviewer. Analyze the following code and respond ONLY with a JSON object — no markdown, no explanation outside the JSON.

Project: {filename}

{code}

Respond with this exact JSON structure:
{{
  "summary": "One-paragraph overview of what this project does.",
  "issues": [
    {{"severity": "error|warning|info", "line": <int or null>, "message": "description", "file": "filename"}}
  ],
  "suggestions": ["actionable improvement 1", "actionable improvement 2"],
  "quality_score": <integer 1-10>
}}"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def home():
    return {"message": "CodeSense AI running", "status": "ok"}


@app.post("/upload", tags=["Code Analysis"])
async def upload_code(file: UploadFile = File(...)):
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read the uploaded file.")

    validate_file(file, content)

    if get_file_extension(file.filename) == ".zip":
        file_tree = extract_file_tree(content)
        code_text = extract_code_from_zip(content)
    else:
        file_tree = []
        code_text = content.decode("utf-8", errors="replace")

    analysis = await analyze_with_gemini(file.filename, code_text)

    # Save context for chat
    project_context["filename"] = file.filename
    project_context["code"] = code_text
    project_context["analysis"] = analysis

    return {
        "filename": file.filename,
        "size_bytes": len(content),
        "language": get_file_extension(file.filename).lstrip("."),
        "file_tree": file_tree,
        "analysis": analysis,
    }


# ── Chat endpoint ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []  # [{ "role": "user"|"ai", "text": "..." }]


@app.post("/chat", tags=["Chat"])
async def chat(req: ChatRequest):
    if not project_context.get("code"):
        raise HTTPException(
            status_code=400,
            detail="No project uploaded yet. Please upload a file first."
        )

    # Build conversation history for context
    history_text = ""
    for turn in req.history[-10:]:  # last 10 messages for context
        role = "User" if turn["role"] == "user" else "Assistant"
        history_text += f"{role}: {turn['text']}\n"

    prompt = f"""You are CodeSense AI, an expert code assistant. You have already analyzed the following project.

Project: {project_context['filename']}

--- CODE ---
{project_context['code'][:6000]}

--- PREVIOUS ANALYSIS ---
Summary: {project_context['analysis'].get('summary', '')}
Issues: {json.dumps(project_context['analysis'].get('issues', []))}
Suggestions: {json.dumps(project_context['analysis'].get('suggestions', []))}
Quality Score: {project_context['analysis'].get('quality_score', 'N/A')}/10

--- CONVERSATION HISTORY ---
{history_text}

--- USER QUESTION ---
{req.message}

Answer helpfully and concisely. Reference specific files or line numbers when relevant. If the question is unrelated to the codebase, politely redirect."""

    try:
        response = model.generate_content(prompt)
        return {"reply": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")