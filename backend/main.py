from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import anthropic
import httpx

# ── Config ───────────────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp",
                      ".c", ".cs", ".go", ".rs", ".php", ".rb", ".swift",
                      ".kt", ".html", ".css", ".json", ".yaml", ".yml",
                      ".sh", ".bash", ".sql", ".md"}

MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024  # 1 MB

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="CodeSense AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic()

# ── Helpers ──────────────────────────────────────────────────────────────────

def get_file_extension(filename: str) -> str:
    """Return the lowercased file extension, e.g. '.py'."""
    dot_index = filename.rfind(".")
    if dot_index == -1:
        return ""
    return filename[dot_index:].lower()


def validate_file(file: UploadFile, content: bytes) -> None:
    """Raise HTTPException if the file fails any validation check."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing.")

    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type '{ext}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the 1 MB size limit ({len(content)} bytes received).",
        )


async def analyze_with_claude(filename: str, code: str) -> dict:
    """
    Send code to Claude and return structured analysis.
    Returns a dict with keys: summary, issues, suggestions, quality_score.
    """
    prompt = f"""You are an expert code reviewer. Analyze the following code file and respond ONLY with a JSON object — no markdown, no explanation outside the JSON.

File: {filename}

```
{code}
```

Respond with this exact JSON structure:
{{
  "summary": "One-paragraph overview of what this code does.",
  "issues": [
    {{"severity": "error|warning|info", "line": <int or null>, "message": "description"}}
  ],
  "suggestions": ["actionable improvement 1", "actionable improvement 2"],
  "quality_score": <integer 1-10>
}}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()

        # Strip accidental markdown fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        import json
        return json.loads(raw)

    except anthropic.APIConnectionError:
        raise HTTPException(status_code=503, detail="Could not connect to Claude API.")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Claude API rate limit exceeded. Try again shortly.")
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def home():
    """Health check endpoint."""
    return {"message": "CodeSense AI running", "status": "ok"}


@app.post("/upload", tags=["Code Analysis"])
async def upload_code(file: UploadFile = File(...)):
    """
    Upload a source code file and receive an AI-powered analysis.

    - Validates file type and size
    - Sends code to Claude for review
    - Returns summary, issues, suggestions, and a quality score
    """
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read the uploaded file.")

    # Validate before doing anything expensive
    validate_file(file, content)

    code_text = content.decode("utf-8", errors="replace")
    analysis = await analyze_with_claude(file.filename, code_text)

    return {
        "filename": file.filename,
        "size_bytes": len(content),
        "language": get_file_extension(file.filename).lstrip("."),
        "analysis": analysis,
    }