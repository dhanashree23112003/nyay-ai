from fastapi import APIRouter, UploadFile, File, HTTPException
from groq import Groq
import os

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe English audio using Groq Whisper — handles Indian accents well."""
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty audio file")

        transcription = client.audio.transcriptions.create(
            file=(file.filename or "recording.webm", content, file.content_type or "audio/webm"),
            model="whisper-large-v3-turbo",
            language="en",
            response_format="text",
        )
        return {"text": str(transcription).strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.get("/status")
def audio_status():
    return {"status": "ok", "whisper": "whisper-large-v3-turbo"}
