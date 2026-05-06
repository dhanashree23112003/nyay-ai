# Nyay AI — Legal Intake Agent for India

A production-grade Voice AI Agent that helps Indian citizens file FIR complaints by speaking naturally in Hindi, English, or Hinglish. The agent extracts structured legal facts, identifies applicable IPC sections, and generates a formal complaint draft.

---

## Architecture

```
React Frontend (Vite)
      ↓
FastAPI Backend (async, Python)
      ↓
Claude API (extraction + IPC classification + followup)
Whisper API (speech-to-text, Hindi/English/Hinglish)
      ↓
SQLite (dev) / PostgreSQL (prod)
```

---

## Project Structure

```
nyay-ai/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── analyze.py           # Core extraction + followup endpoints
│   │   ├── audio.py             # Whisper transcription endpoint
│   │   └── cases.py             # Case CRUD + officer dashboard
│   ├── services/
│   │   └── claude_service.py    # Claude API calls
│   ├── models/
│   │   └── database.py          # SQLAlchemy models
│   └── prompts/
│       └── extraction.py        # All Claude prompts
└── frontend/
    └── src/
        └── App.jsx              # Full React UI
```

---

## Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys:
# ANTHROPIC_API_KEY=your_key
# OPENAI_API_KEY=your_key  (for Whisper)

# Run the server
python main.py
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

# Install dependencies (requires Node.js)
npm create vite@latest . -- --template react
npm install

# Copy App.jsx into src/App.jsx (replace existing)

# Run dev server
npm run dev
# Runs at http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analyze/ | Extract incident, get IPC sections + followup |
| POST | /api/analyze/{id}/generate-draft | Generate formal FIR draft |
| POST | /api/audio/transcribe | Transcribe audio (Hindi/English/Hinglish) |
| GET | /api/cases/ | List all cases (officer dashboard) |
| GET | /api/cases/{id} | Get full case details |
| PATCH | /api/cases/{id}/status | Update case status |

---

## Key Features

- **Multi-language**: Hindi, English, Hinglish auto-detected by Whisper
- **Multi-turn conversation**: Agent asks followup questions until complaint is complete
- **IPC classification**: Identifies applicable sections with confidence scores
- **Urgency detection**: Flags critical/high urgency cases automatically
- **FIR draft generation**: Formal legal complaint ready to print
- **Case persistence**: All cases stored with full conversation history
- **Officer dashboard**: View and manage all cases by status

---

## Production Upgrades (Week 3-4)

- [ ] Switch SQLite → PostgreSQL
- [ ] Add JWT authentication
- [ ] Docker + docker-compose
- [ ] Deploy to Railway/Render
- [ ] GitHub Actions CI/CD
- [ ] SMS notifications via Twilio
- [ ] PDF export via ReportLab

---

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **AI**: Anthropic Claude (claude-sonnet-4), OpenAI Whisper
- **Frontend**: React, Vite
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Languages supported**: Hindi, English, Hinglish

---

## LinkedIn Post Formula (when you demo this)

> "Filing an FIR in India is broken. People speak emotionally, out of order, in Hinglish. Police staff spend hours extracting facts.
>
> So I built Nyay AI.
>
> You speak. It listens. In real-time it extracts who, what, when, where — identifies the IPC sections — and generates a formal complaint ready to file.
>
> Hindi. English. Hinglish. Doesn't matter.
>
> [2-min demo video]
>
> Stack: FastAPI + Claude API + Whisper + React
> Open source: [GitHub link]"
