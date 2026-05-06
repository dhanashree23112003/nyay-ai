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
    """True if text contains Devanagari characters."""
    return bool(re.search(r'[ऀ-ॿ]', text))


def _translate_to_english(text: str) -> str:
    """Translate a single Hindi question to English using a tiny focused call."""
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a translator. Translate the following Hindi text to English. Return ONLY the translated text, nothing else."},
            {"role": "user", "content": text}
        ],
        temperature=0,
        max_tokens=120
    )
    return resp.choices[0].message.content.strip()


def _fix_language(result: dict, language: str) -> dict:
    """
    If the model returned the followup_question in the wrong language,
    translate it automatically. This is the guaranteed fallback.
    """
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
        f"DAY BEFORE YESTERDAY (parso): {day_before.strftime('%d %B %Y (%A)')}\n"
        f"RULE: When the person uses relative time words — 'yesterday', 'kal', 'aaj', "
        f"'last night', 'parso', 'do din pehle', 'last week', 'subah', 'raat', etc. — "
        f"resolve them to the EXACT calendar date and clock time using the dates above. "
        f"Store resolved date as DD Month YYYY in incident_date (e.g. '04 May 2026'), "
        f"and resolved time as HH:MM AM/PM in incident_time (e.g. '07:00 PM'). "
        f"Never store 'yesterday' or 'kal' literally.\n\n"
    )


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
            {"role": "user", "content": (
                f"Incident description:\n\n{text}\n\n"
                f"Remember: followup_question must be in {lang_line.upper()} only."
            )}
        ],
        temperature=0.1,
        max_tokens=2000
    )
    result = _parse_json(response.choices[0].message.content)
    return _fix_language(result, language)


def continue_conversation(history: list, new_message: str, language: str = "hindi", current_extracted: dict = None) -> dict:
    """
    Re-extracts all info from the full conversation history and asks
    only the next unanswered question in the chosen language.
    """
    transcript_lines = []
    already_asked = []

    for msg in history:
        role = msg.get("role", "user")
        content = str(msg.get("content", ""))

        if role == "user":
            transcript_lines.append(f"USER: {content}")
        elif role == "assistant":
            try:
                parsed = _parse_json(content)
                fq = parsed.get("followup_question")
                if fq:
                    already_asked.append(fq)
                    transcript_lines.append(f"AI ASKED: {fq}")
            except Exception:
                transcript_lines.append("AI: (previous response)")

    lang_line = "english" if language == "english" else "hindi"
    transcript = "\n".join(transcript_lines)

    # Build a summary of fields that are ALREADY filled from the DB state

    filled = {k: v for k, v in (current_extracted or {}).items()
              if v and v != [] and v != "null"}

    # Detect dismissive replies so we can flag them explicitly
    _dismiss = {"no", "nahi", "nahin", "na", "nope", "nothing",
                "pata nahi", "don't know", "dont know", "nai", "n"}
    is_dismissal = new_message.strip().lower() in _dismiss

    system = (
        f"RULE: Your followup_question MUST be in {lang_line.upper()} only.\n\n"
        + _date_context()
        + CONVERSATION_SYSTEM_PROMPT
    )

    user_prompt = (
        f"ALREADY FILLED FIELDS (extracted from conversation so far — "
        f"DO NOT ask about any of these again):\n"
        f"{json.dumps(filled, ensure_ascii=False, indent=2)}\n\n"
        f"QUESTIONS ALREADY ASKED — DO NOT REPEAT EVEN IF REPHRASED:\n"
        f"{json.dumps(already_asked, ensure_ascii=False, indent=2)}\n\n"
        f"CONVERSATION:\n{transcript}\n\n"
        f"USER'S LATEST REPLY: {new_message}\n"
        + (f"(User said NO — accept this, skip this field, move to the next one.)\n"
           if is_dismissal else "") +
        f"\nInstructions:\n"
        f"1. Use the ALREADY FILLED FIELDS above — do NOT ask about any field that already has a value.\n"
        f"2. Do NOT repeat any question from the ALREADY ASKED list, even rephrased.\n"
        f"3. If the user's reply was dismissive ('no', 'nahi', etc.) mark that field as done and move on.\n"
        f"4. Ask only the NEXT missing field that is null AND hasn't been asked yet.\n"
        f"5. followup_question MUST be in {lang_line.upper()} only.\n"
        f"6. If complainant_name + incident_location + incident_description + at least one IPC section "
        f"are all present, set complaint_ready=true and followup_question=null immediately."
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.1,
        max_tokens=2000
    )
    result = _parse_json(response.choices[0].message.content)
    return _fix_language(result, language)


def generate_complaint_draft(case_data: dict) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": COMPLAINT_DRAFT_PROMPT},
            {"role": "user", "content": f"Generate FIR complaint for this case:\n\n{json.dumps(case_data, indent=2, ensure_ascii=False)}"}
        ],
        temperature=0.2,
        max_tokens=2000
    )
    return response.choices[0].message.content
