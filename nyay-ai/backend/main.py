from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn
import uuid
import os

from routes.analyze import router as analyze_router
from routes.cases import router as cases_router
from routes.audio import router as audio_router

app = FastAPI(title="Nyay AI - Legal Intake Agent", version="1.0.0")

import os as _os
_allowed = _os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(cases_router, prefix="/api/cases", tags=["Cases"])
app.include_router(audio_router, prefix="/api/audio", tags=["Audio"])

@app.get("/")
def root():
    return {"status": "Nyay AI running", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
