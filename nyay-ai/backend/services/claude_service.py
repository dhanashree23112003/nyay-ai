from groq import Groq
import json
import os
import re
from datetime import datetime, timedelta
from prompts.extraction import EXTRACTION_SYSTEM_PROMPT, COMPLAINT_DRAFT_PROMPT

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL  = "llama-3.3-70b-versatile"

# ── Hard-coded questions (never let the AI choose) ──────────────────────────
_Q_EN = {
    "incident_location":   "Where did the incident occur? (city, area or address)",
    "complainant_contact": "What is the complainant's contact number?",
    "accused_name":        "What is the name of the accused person?",
    "accused_description": "Can you describe the accused? (age, appearance, clothing)",
    "incident_date":       "On what date did the incident occur?",
    "incident_time":       "At what time did the incident occur?",
    "injury_or_loss":      "What was stolen, damaged or lost?",
}
_Q_HI = {
    "incident_location":   "घटना कहाँ हुई थी? (शहर, इलाका या पता)",
    "complainant_contact": "शिकायतकर्ता का संपर्क नंबर क्या है?",
    "accused_name":        "आरोपी का नाम क्या है?",
    "accused_description": "आरोपी का विवरण बताएं? (उम्र, रंग-रूप, कपड़े)",
    "incident_date":       "घटना किस तारीख को हुई?",
    "incident_time":       "घटना किस समय हुई?",
    "injury_or_loss":      "क्या चुराया गया, क्या नुकसान हुआ या चोट लगी?",
}

# Ask in this order before marking complaint_ready
_FIELD_ORDER = [
    "incident_location",
    "complainant_contact",
    "accused_name",
    "accused_description",
    "incident_date",
    "incident_time",
    "injury_or_loss",
]

_DISMISS = {"no","nahi","nahin","na","nope","nothing","pata nahi",
            "don't know","dont know","nai","n","nhi","unknown"}


def _parse_json(raw: str) -> dict:
    clean = re.sub(r"```json|```", "", raw).strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        m = re.search(r'\{.*\}', clean, re.DOTALL)
        if m:
            return json.loads(m.group())
        raise ValueError(f"Bad JSON: {raw[:200]}")


def _is_hindi(text: str) -> bool:
    return bool(re.search(r'[ऀ-ॿ]', text))


def _translate_to_english(text: str) -> str:
    r = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "Translate to English. Return ONLY the translated sentence."},
            {"role": "user",   "content": text}
        ],
        temperature=0, max_tokens=120
    )
    return r.choices[0].message.content.strip()


def _fix_language(result: dict, language: str) -> dict:
    fq = result.get("followup_question")
    if fq and language == "english" and _is_hindi(fq):
        result["followup_question"] = _translate_to_english(fq)
    return result


def _date_context() -> str:
    now  = datetime.now()
    yest = now - timedelta(days=1)
    d2   = now - timedelta(days=2)
    return (
        f"TODAY: {now.strftime('%d %B %Y (%A), %I:%M %p IST')}\n"
        f"YESTERDAY: {yest.strftime('%d %B %Y (%A)')}\n"
        f"DAY BEFORE YESTERDAY: {d2.strftime('%d %B %Y (%A)')}\n"
        "Convert relative dates (yesterday/kal/aaj/last night) to exact dates above.\n\n"
    )


def _is_filled(val) -> bool:
    return bool(val) and val not in (None, [], "", "null", "not provided", "unknown")


def _next_field(extracted: dict, asked: set) -> str | None:
    """Return the next field to ask about, or None if all done."""
    for f in _FIELD_ORDER:
        if not _is_filled(extracted.get(f)) and f not in asked:
            return f
    return None


def _is_ready(extracted: dict, ipc_sections: list) -> bool:
    return (
        _is_filled(extracted.get("complainant_name")) and
        _is_filled(extracted.get("incident_location")) and
        _is_filled(extracted.get("incident_description")) and
        bool(ipc_sections)
    )


# ── Public API ───────────────────────────────────────────────────────────────

def extract_incident(text: str, language: str = "hindi") -> dict:
    lang = "english" if language == "english" else "hindi"
    system = f"RULE: followup_question MUST be in {lang.upper()} only.\n\n" + _date_context() + EXTRACTION_SYSTEM_PROMPT
    r = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": f"Incident description:\n\n{text}\n\nfollowup_question in {lang.upper()} only."}
        ],
        temperature=0.1, max_tokens=2000
    )
    result = _parse_json(r.choices[0].message.content)
    return _fix_language(result, language)


def continue_conversation(
    history: list,
    new_message: str,
    language: str = "hindi",
    current_extracted: dict = None
) -> dict:
    """
    Step 1 — Parse history to find:
      • what fields were already asked  (_asked_field metadata in each assistant entry)
      • what the LAST question was about (so we can map the user's answer)

    Step 2 — Ask AI to re-extract facts, with explicit hint:
      "The last question was about <field>. Map the user's answer to that field."

    Step 3 — Python code (not AI) decides the next question.
      Store _asked_field in result so future turns can read it.
    """
    lang = "english" if language == "english" else "hindi"
    questions = _Q_EN if language == "english" else _Q_HI

    # ── Parse history ─────────────────────────────────────────────────────
    asked: set = set()          # field names we've already asked about
    last_field: str | None = None
    transcript_lines: list = []

    for msg in history:
        role    = msg.get("role", "")
        content = str(msg.get("content", ""))
        if role == "user":
            transcript_lines.append(f"USER: {content}")
        elif role == "assistant":
            try:
                parsed = _parse_json(content)
                # ← This is the KEY: we store _asked_field when we ask a question
                af = parsed.get("_asked_field")
                if af:
                    asked.add(af)
                    last_field = af
                    q = parsed.get("followup_question", af)
                    transcript_lines.append(f"AI ASKED [{af}]: {q}")
            except Exception:
                transcript_lines.append("AI: (previous response)")

    # Also mark all currently-filled fields as "done" so we never re-ask
    filled = {k: v for k, v in (current_extracted or {}).items() if _is_filled(v)}
    for f in filled:
        asked.add(f)

    is_dismissal = new_message.strip().lower() in _DISMISS

    # ── Build extraction prompt ───────────────────────────────────────────
    # Explicitly tell AI which field the current answer belongs to
    field_hint = ""
    if last_field and not is_dismissal:
        field_hint = (
            f"\nIMPORTANT: The previous question was about the field '{last_field}'. "
            f"The user's answer '{new_message}' should be stored in extracted.{last_field}.\n"
        )

    transcript = "\n".join(transcript_lines)
    system = (
        f"RULE: followup_question MUST be in {lang.upper()} only.\n\n"
        + _date_context()
        + EXTRACTION_SYSTEM_PROMPT
    )
    user_prompt = (
        f"FULL CONVERSATION:\n{transcript}\n\n"
        f"USER'S LATEST REPLY: {new_message}"
        + ("\n(Dismissive — treat current field as done, move on.)" if is_dismissal else "")
        + field_hint
        + f"\n\nALREADY FILLED:\n{json.dumps(filled, ensure_ascii=False)}\n\n"
        "Re-extract ALL facts from the full conversation. "
        "Set followup_question=null (the system decides what to ask). "
        f"followup_question must be in {lang.upper()} only."
    )

    r = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user_prompt}
        ],
        temperature=0.1, max_tokens=2000
    )
    result = _parse_json(r.choices[0].message.content)

    # ── Merge extracted data ──────────────────────────────────────────────
    merged = dict(current_extracted or {})
    for k, v in result.get("extracted", {}).items():
        if _is_filled(v):
            merged[k] = v

    # If AI missed mapping last_field answer, do it ourselves
    if last_field and not is_dismissal and not _is_filled(merged.get(last_field)):
        if last_field in ("complainant_contact", "accused_name", "accused_description",
                          "incident_location", "incident_date", "incident_time",
                          "injury_or_loss", "complainant_name"):
            merged[last_field] = new_message.strip()

    result["extracted"] = merged

    # ── Decide next question (Python, not AI) ─────────────────────────────
    # Re-mark filled fields in asked (merged may have grown)
    for f in merged:
        if _is_filled(merged.get(f)):
            asked.add(f)

    next_f = _next_field(merged, asked)

    if next_f:
        result["complaint_ready"]  = False
        result["followup_question"] = questions[next_f]
        result["_asked_field"]     = next_f          # ← persisted in history
    elif _is_ready(merged, result.get("ipc_sections", [])):
        result["complaint_ready"]  = True
        result["followup_question"] = None
        result["_asked_field"]     = None
    else:
        result["complaint_ready"]  = False
        result["followup_question"] = None
        result["_asked_field"]     = None

    return _fix_language(result, language)


def generate_complaint_draft(case_data: dict) -> str:
    r = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": COMPLAINT_DRAFT_PROMPT},
            {"role": "user",   "content": f"Generate FIR:\n\n{json.dumps(case_data, indent=2, ensure_ascii=False)}"}
        ],
        temperature=0.2, max_tokens=2000
    )
    return r.choices[0].message.content
