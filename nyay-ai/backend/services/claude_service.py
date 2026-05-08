from groq import Groq
import json
import os
import re
from datetime import datetime, timedelta
from prompts.extraction import EXTRACTION_SYSTEM_PROMPT, CONVERSATION_SYSTEM_PROMPT, COMPLAINT_DRAFT_PROMPT

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def _parse_json(raw: str) -> dict:
    clean = re.sub(r"```json|```", "", raw).strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', clean, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Did not return valid JSON. Raw: {raw[:300]}")


def _is_hindi(text: str) -> bool:
    return bool(re.search(r'[ऀ-ॿ]', text))


def _translate_to_english(text: str) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "Translate the following Hindi text to English. Return ONLY the translated sentence, nothing else."},
            {"role": "user", "content": text}
        ],
        temperature=0,
        max_tokens=120
    )
    return resp.choices[0].message.content.strip()


def _fix_language(result: dict, language: str) -> dict:
    fq = result.get("followup_question")
    if not fq:
        return result
    if language == "english" and _is_hindi(fq):
        result["followup_question"] = _translate_to_english(fq)
    return result


def _date_context() -> str:
    now = datetime.now()
    yesterday  = now - timedelta(days=1)
    day_before = now - timedelta(days=2)
    return (
        f"TODAY: {now.strftime('%d %B %Y (%A), %I:%M %p IST')}\n"
        f"YESTERDAY: {yesterday.strftime('%d %B %Y (%A)')}\n"
        f"DAY BEFORE YESTERDAY: {day_before.strftime('%d %B %Y (%A)')}\n"
        f"Resolve relative time words (yesterday/kal/aaj/last night/parso) to exact dates above.\n\n"
    )


# ── Hardcoded questions so the AI never picks the wrong field ─────────────────

_QUESTIONS_EN = {
    "incident_location":   "Where did the incident occur? (city, area, or address)",
    "complainant_contact": "What is the complainant's contact number?",
    "accused_name":        "What is the name of the accused person?",
    "accused_description": "Can you describe the accused? (appearance, age, gender)",
    "incident_date":       "What date did the incident occur?",
    "incident_time":       "What time did the incident occur?",
    "injury_or_loss":      "What was stolen, damaged, or lost?",
    "witnesses":           "Were there any witnesses to the incident?",
    "evidence":            "Is there any evidence available (CCTV, photos, messages)?",
}

_QUESTIONS_HI = {
    "incident_location":   "घटना कहाँ हुई थी? (शहर, इलाका या पता)",
    "complainant_contact": "शिकायतकर्ता का संपर्क नंबर क्या है?",
    "accused_name":        "आरोपी का नाम क्या है?",
    "accused_description": "आरोपी का विवरण दें (उम्र, रंग, पहचान)?",
    "incident_date":       "घटना किस तारीख को हुई?",
    "incident_time":       "घटना किस समय हुई?",
    "injury_or_loss":      "क्या चुराया गया, नुकसान हुआ, या चोट लगी?",
    "witnesses":           "क्या कोई गवाह था?",
    "evidence":            "क्या कोई सबूत है? (CCTV, फोटो, मैसेज)",
}

# Fields needed before complaint_ready = true
_CRITICAL = {"complainant_name", "incident_location", "incident_description"}

# Priority order for asking
_FIELD_ORDER = [
    "incident_location",
    "complainant_contact",
    "accused_name",
    "accused_description",
    "incident_date",
    "incident_time",
    "injury_or_loss",
    "witnesses",
    "evidence",
]

_DISMISS_WORDS = {
    "no", "nahi", "nahin", "na", "nope", "nothing",
    "pata nahi", "don't know", "dont know", "nai", "n",
    "nhi", "nhii", "nhin", "unknown",
}


def _next_question(extracted: dict, asked_fields: set, language: str) -> str | None:
    """
    Programmatically decide the next field to ask about.
    Returns the question string, or None if all critical fields are present.
    """
    questions = _QUESTIONS_EN if language == "english" else _QUESTIONS_HI

    for field in _FIELD_ORDER:
        val = extracted.get(field)
        is_empty = not val or val in (None, "", [], "null", "not provided", "unknown")
        if is_empty and field not in asked_fields:
            return questions[field]

    return None  # nothing more to ask


def _is_ready(extracted: dict) -> bool:
    """complaint_ready = name + location + description + at least one IPC section."""
    has_name = bool(extracted.get("complainant_name"))
    has_loc  = bool(extracted.get("incident_location"))
    has_desc = bool(extracted.get("incident_description"))
    return has_name and has_loc and has_desc


def extract_incident(text: str, language: str = "hindi") -> dict:
    lang_line = "english" if language == "english" else "hindi"
    system = (
        f"RULE: Your followup_question MUST be in {lang_line.upper()} only.\n\n"
        + _date_context()
        + EXTRACTION_SYSTEM_PROMPT
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": f"Incident description:\n\n{text}\n\nfollowup_question must be in {lang_line.upper()} only."}
        ],
        temperature=0.1,
        max_tokens=2000
    )
    result = _parse_json(response.choices[0].message.content)
    return _fix_language(result, language)


def continue_conversation(
    history: list,
    new_message: str,
    language: str = "hindi",
    current_extracted: dict = None
) -> dict:
    """
    1. Use the AI to re-extract all facts from the full conversation.
    2. Use Python code (not the AI) to decide what question to ask next.
       This prevents the AI from repeating questions.
    """
    # ── Build conversation transcript ────────────────────────────────────────
    transcript_lines = []
    asked_fields: set = set()   # field NAMES that have been asked already
    questions_asked: list = []  # the actual question strings

    questions_map = _QUESTIONS_EN if language == "english" else _QUESTIONS_HI
    # Reverse map: question string → field name
    reverse_map = {v: k for k, v in questions_map.items()}
    # Also map English questions for Hindi sessions (in case of mixed)
    for k, v in _QUESTIONS_EN.items():
        reverse_map[v] = k

    for msg in history:
        role    = msg.get("role", "user")
        content = str(msg.get("content", ""))

        if role == "user":
            transcript_lines.append(f"USER: {content}")
        elif role == "assistant":
            try:
                parsed = _parse_json(content)
                fq = parsed.get("followup_question")
                if fq:
                    questions_asked.append(fq)
                    transcript_lines.append(f"AI ASKED: {fq}")
                    # Map question → field name
                    field = reverse_map.get(fq)
                    if field:
                        asked_fields.add(field)
                    else:
                        # Try fuzzy match: if question mentions a keyword
                        fl = fq.lower()
                        if any(w in fl for w in ["location", "kahan", "कहाँ", "where"]):
                            asked_fields.add("incident_location")
                        elif any(w in fl for w in ["contact", "number", "phone", "संपर्क", "नंबर"]):
                            asked_fields.add("complainant_contact")
                        elif any(w in fl for w in ["accused", "aropee", "आरोपी", "name of"]):
                            asked_fields.add("accused_name")
                        elif any(w in fl for w in ["witness", "sakshi", "गवाह"]):
                            asked_fields.add("witnesses")
                        elif any(w in fl for w in ["evidence", "sabut", "सबूत"]):
                            asked_fields.add("evidence")
                        elif any(w in fl for w in ["date", "when", "kab", "तारीख"]):
                            asked_fields.add("incident_date")
                        elif any(w in fl for w in ["time", "samay", "समय"]):
                            asked_fields.add("incident_time")
                        elif any(w in fl for w in ["stolen", "loss", "chori", "नुकसान", "injury"]):
                            asked_fields.add("injury_or_loss")
            except Exception:
                transcript_lines.append("AI: (previous response)")

    # Also mark filled fields as "asked" so we never ask about them
    filled = {k: v for k, v in (current_extracted or {}).items()
              if v and v not in (None, [], "", "null", "not provided", "unknown")}
    for field in filled:
        asked_fields.add(field)

    is_dismissal = new_message.strip().lower() in _DISMISS_WORDS

    transcript = "\n".join(transcript_lines)
    lang_line  = "english" if language == "english" else "hindi"

    # ── Step 1: Ask AI to re-extract all facts from conversation ────────────
    system = (
        f"RULE: followup_question MUST be in {lang_line.upper()} only.\n\n"
        + _date_context()
        + CONVERSATION_SYSTEM_PROMPT
    )

    user_prompt = (
        f"FULL CONVERSATION:\n{transcript}\n\n"
        f"USER'S LATEST REPLY: {new_message}"
        + ("\n(User gave a dismissive answer — treat this field as done.)" if is_dismissal else "")
        + f"\n\nALREADY FILLED FIELDS:\n{json.dumps(filled, ensure_ascii=False, indent=2)}\n\n"
        f"Instructions:\n"
        f"1. Re-extract ALL facts from the ENTIRE conversation above.\n"
        f"2. Set followup_question to null — the system will decide what to ask next.\n"
        f"3. Set complaint_ready=true if complainant_name + incident_location + incident_description + IPC section are all present.\n"
        f"4. followup_question MUST be in {lang_line.upper()} only.\n"
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user_prompt}
        ],
        temperature=0.1,
        max_tokens=2000
    )
    result = _parse_json(response.choices[0].message.content)

    # ── Step 2: Override followup_question with our programmatic decision ────
    new_extracted = result.get("extracted", {})

    # Merge with current_extracted so we don't lose previously filled fields
    merged = dict(current_extracted or {})
    for k, v in new_extracted.items():
        if v and v not in (None, [], "", "null", "not provided"):
            merged[k] = v
    result["extracted"] = merged

    # Re-check if ready
    if _is_ready(merged) and result.get("ipc_sections"):
        result["complaint_ready"] = True
        result["followup_question"] = None
    else:
        result["complaint_ready"] = False
        # Our code decides the next question — AI cannot override this
        next_q = _next_question(merged, asked_fields, language)
        result["followup_question"] = next_q
        if not next_q:
            # No more questions to ask — check if we have enough to be ready
            if _is_ready(merged):
                result["complaint_ready"] = True

    return _fix_language(result, language)


def generate_complaint_draft(case_data: dict) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": COMPLAINT_DRAFT_PROMPT},
            {"role": "user",   "content": f"Generate FIR complaint:\n\n{json.dumps(case_data, indent=2, ensure_ascii=False)}"}
        ],
        temperature=0.2,
        max_tokens=2000
    )
    return response.choices[0].message.content
