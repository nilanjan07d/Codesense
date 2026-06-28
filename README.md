# CodeSense AI

CodeSense AI is an intelligent code review assistant that helps developers understand, inspect, and improve their codebase using AI. Upload a source file or ZIP archive, and the app generates a structured analysis with a summary, issue report, improvement suggestions, and a conversational chat interface powered by Gemini.

## ✨ Features

- Upload a single source file or a ZIP project archive
- Analyze code with Gemini for:
  - project summary
  - detected issues
  - actionable suggestions
  - quality score
- Explore uploaded project structure in a visual file tree
- Ask follow-up questions through an AI chat experience
- Built with a modern React frontend and FastAPI backend

## 🧠 What this project does

CodeSense AI turns raw code into an understandable review experience. It is useful for:

- quickly understanding unfamiliar repositories
- spotting common issues and anti-patterns
- getting improvement ideas for maintainability and quality
- asking natural-language questions about a project after upload

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

### Backend
- FastAPI
- Uvicorn
- Python dotenv
- Google Generative AI
- Pydantic

## 📁 Project Structure

```text
codesense/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

## ✅ Prerequisites

Before running the app, make sure you have:

- Python 3.10+
- Node.js 18+
- npm or pnpm
- A Gemini API key from Google AI Studio

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd codesense
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the backend server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at:

```text
http://localhost:5173
```

## 🚀 Usage

1. Open the app in your browser.
2. Upload a source file or ZIP archive.
3. Review the AI-generated summary, issues, suggestions, and quality score.
4. Use the chat feature to ask follow-up questions about the uploaded project.

## 🔌 API Endpoints

The backend exposes the following routes:

- `GET /` — health check
- `POST /upload` — upload a file or ZIP archive for analysis
- `POST /chat` — chat with the AI about the uploaded project context

## 📦 Supported File Types

The app accepts common source and document formats such as:

- `.py`, `.js`, `.ts`, `.jsx`, `.tsx`
- `.java`, `.cpp`, `.c`, `.cs`
- `.go`, `.rs`, `.php`, `.rb`
- `.html`, `.css`, `.json`, `.yaml`, `.yml`
- `.md`, `.sql`, `.sh`

## ⚠️ Notes

- Maximum uploaded file size is 10 MB.
- The backend currently uses Gemini Flash for analysis and chat responses.
- A valid `GEMINI_API_KEY` is required for the app to work.

## 🤝 Contributing

Contributions are welcome. If you would like to improve CodeSense AI, feel free to fork the repository, make your changes, and open a pull request.

## 📄 License

This project is currently unlicensed. Add a license if you plan to distribute or share it publicly.
