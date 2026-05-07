<div align="center">

```
███╗   ██╗██╗   ██╗ █████╗ ██╗   ██╗     █████╗ ██╗
████╗  ██║╚██╗ ██╔╝██╔══██╗╚██╗ ██╔╝    ██╔══██╗██║
██╔██╗ ██║ ╚████╔╝ ███████║ ╚████╔╝     ███████║██║
██║╚██╗██║  ╚██╔╝  ██╔══██║  ╚██╔╝      ██╔══██║██║
██║ ╚████║   ██║   ██║  ██║   ██║       ██║  ██║██║
╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝       ╚═╝  ╚═╝╚═╝
```

**न्याय — Justice for all. Not just the legalese-fluent.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-nyay--ai--nine.vercel.app-7c3aed?style=for-the-badge)](https://nyay-ai-nine.vercel.app/)
[![Built with LLaMA](https://img.shields.io/badge/LLaMA_3.3_70B-Groq_API-orange?style=for-the-badge)](https://groq.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://nyay-ai-nine.vercel.app/)

---

> *The cop at your local thana still uses a typewriter.*
> *A complainant who doesn't speak legalese waits for hours.*
> *FIRs get lost in bureaucracy.*
>
> **Not anymore.**

</div>

---

## 🚨 The Problem

India has **1.4 billion people**. Most of them speak neither English nor legalese.

Filing a First Information Report means navigating a Byzantine system of IPC sections, police procedures, and paperwork — in a language you may not fully understand. Officers manually cross-reference hundreds of sections. Errors happen constantly. Cases get filed under the wrong sections. Justice delayed is justice denied.

**Nyay AI fixes this.** Speak naturally. In Hindi. In English. In Hinglish. The AI figures out the rest.

---

## ⚡ What It Does

| Metric | Result |
|--------|--------|
| 🕐 FIR Filing Time | **↓ 80% faster** |
| ⚖️ IPC Sections Auto-Identified | **14+ sections** |
| 🗣️ Languages Supported | **Hindi + English + Hinglish** |
| 📋 Legal Knowledge Required from Complainant | **Zero** |

---

## 🏗️ How It Works

```
Complainant speaks naturally
          │
          ▼
┌─────────────────────┐
│   Web Speech API    │  ← No app. No install. Just talk.
│  (Browser Mic)      │
└────────┬────────────┘
         │  raw transcript
         ▼
┌─────────────────────┐
│  LLaMA 3.3 70B      │  ← via Groq API (blazing fast inference)
│  Legal Extraction   │  ← identifies parties, incident, timeline
│  IPC Mapping        │  ← 14+ sections with confidence scoring
└────────┬────────────┘
         │  structured intent
         ▼
┌─────────────────────┐
│  Multi-turn Conv.   │  ← DB-extracted state injected into each LLM turn
│  with DB State      │  ← no repeat questions, no context loss
│  Injection          │
└────────┬────────────┘
         │  complete picture
         ▼
┌─────────────────────┐
│  Language Enforce   │  ← Unicode regex detects Devanagari
│  Fallback           │  ← fires secondary Groq translation call
│  (post-processing)  │  ← when model ignores English-mode instruction
└────────┬────────────┘
         │
         ▼
  ✅ Structured FIR Draft
     IPC sections pre-filled
     Confidence scores visible
     Ready for officer review
```

---

## ⚖️ IPC Sections Auto-Mapped

From unstructured speech → precise legal classification. No manual lookup. No errors.

| IPC Section | Offence |
|-------------|---------|
| `IPC 302` | Murder |
| `IPC 307` | Attempt to Murder |
| `IPC 376` | Rape |
| `IPC 420` | Cheating / Fraud |
| `IPC 379` | Theft |
| `IPC 392` | Robbery |
| `IPC 354` | Assault on Woman |
| `IPC 498A` | Domestic Violence |
| `IPC 406` | Criminal Breach of Trust |
| `IPC 323` | Voluntarily Causing Hurt |
| `IPC 341` | Wrongful Restraint |
| `IPC 506` | Criminal Intimidation |
| `IPC 363` | Kidnapping |
| `IPC 447` | Criminal Trespass |

---

## 🐛 The Bug That Was Caught & Fixed (Engineering Transparency)

Multi-turn conversations were **silently breaking**. The model kept repeating questions it had already asked. Took a while to find why.

**Root cause:** Python's `str()` on dicts mangles unicode characters.

```python
# ❌ THE BAD VERSION (mangled unicode, broken context)
history.append({
    "role": "assistant",
    "content": str(result)  # \u0930\u093e\u092e instead of राम
})
# LLM sees garbled nonsense → repeats questions → user confused → FIR broken

# ✅ THE FIX (unicode preserved, context intact)
history.append({
    "role": "assistant",
    "content": json.dumps(result, ensure_ascii=False)  # राम ✓
})
# Multi-turn context works → no repeat questions → FIR complete
```

Found it. Fixed it. **Disclosed it.** That's how engineering should work.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Model** | LLaMA 3.3 70B |
| **Inference** | Groq API |
| **Backend** | FastAPI (Python) |
| **Frontend** | React |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Voice Input** | Web Speech API (browser-native) |
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | Render |
| **Language Detection** | Unicode regex (Devanagari range `\u0900-\u097F`) |

---

## 🚀 Run It Yourself

```bash
# Clone
git clone https://github.com/dhanashree23112003/nyay-ai
cd nyay-ai

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in GROQ_API_KEY and DATABASE_URL in .env
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
# Say anything. In any language. Justice loads.
```

---

## 🔑 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://user:password@host:5432/nyay_db
```

Get your Groq API key at [console.groq.com](https://console.groq.com) — it's free to start.

---

## 🌐 Live Demo

👉 **[nyay-ai-nine.vercel.app](https://nyay-ai-nine.vercel.app/)**

Try it out:
1. Click the mic button
2. Describe an incident — in Hindi, English, or Hinglish
3. Watch it auto-map IPC sections with confidence scores
4. Get a pre-filled FIR draft in seconds

---

## 👩‍💻 Built By

**Dhanashree Bansode** — AI/ML Engineer

- 🌐 [portfoliodhanashree.vercel.app](https://portfoliodhanashree.vercel.app)
- 💼 [linkedin.com/in/dhanashree2311](https://linkedin.com/in/dhanashree2311)
- 🐙 [github.com/dhanashree23112003](https://github.com/dhanashree23112003)
- 📬 dhanashree.professional@gmail.com

B.E. Artificial Intelligence & Machine Learning | GS Moze College of Engineering, SPPU | GPA: 8.95/10

---

<div align="center">

**न्याय** *(nyāy)* — Justice

*Built because everyone deserves access to the law, regardless of language.*

</div>
