from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import uuid
import json

from models.database import get_db, Case, init_db
from services.claude_service import extract_incident, continue_conversation, generate_complaint_draft

router = APIRouter()
init_db()

class AnalyzeRequest(BaseModel):
    text: str
    case_id: Optional[str] = None
    language: Optional[str] = "hindi"   # "hindi" | "english"

class AnalyzeResponse(BaseModel):
    case_id: str
    extracted: dict
    ipc_sections: list
    missing_fields: list
    followup_question: Optional[str]
    complaint_ready: bool
    urgency: str

@router.post("/", response_model=AnalyzeResponse)
async def analyze_incident(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """Analyze incident text and extract structured legal data."""
    
    if request.case_id:
        # Continue existing case
        case = db.query(Case).filter(Case.id == request.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        history = case.conversation_history or []
        
        # Add previous assistant message to history for context
        if history:
            result = continue_conversation(
                history, request.text,
                request.language or "hindi",
                case.extracted_data or {}
            )
        else:
            result = extract_incident(request.text, request.language or "hindi")
        
        # Update history
        history.append({"role": "user", "content": request.text})
        history.append({"role": "assistant", "content": json.dumps(result, ensure_ascii=False)})
        
        # Update case
        case.extracted_data = result.get("extracted", {})
        case.ipc_sections = result.get("ipc_sections", [])
        case.missing_fields = result.get("missing_fields", [])
        case.complaint_ready = result.get("complaint_ready", False)
        case.urgency = result.get("extracted", {}).get("urgency", "low")
        case.conversation_history = history
        db.commit()
        
    else:
        # New case
        result = extract_incident(request.text, request.language or "hindi")
        
        history = [
            {"role": "user", "content": request.text},
            {"role": "assistant", "content": json.dumps(result, ensure_ascii=False)}
        ]
        
        case = Case(
            id=str(uuid.uuid4()),
            extracted_data=result.get("extracted", {}),
            ipc_sections=result.get("ipc_sections", []),
            missing_fields=result.get("missing_fields", []),
            complaint_ready=result.get("complaint_ready", False),
            urgency=result.get("extracted", {}).get("urgency", "low"),
            conversation_history=history,
            transcript=request.text
        )
        db.add(case)
        db.commit()
        db.refresh(case)
    
    return AnalyzeResponse(
        case_id=case.id,
        extracted=case.extracted_data or {},
        ipc_sections=case.ipc_sections or [],
        missing_fields=case.missing_fields or [],
        followup_question=result.get("followup_question"),
        complaint_ready=case.complaint_ready,
        urgency=case.urgency
    )

@router.post("/{case_id}/generate-draft")
async def generate_draft(case_id: str, db: Session = Depends(get_db)):
    """Generate formal FIR complaint draft for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if not case.complaint_ready:
        raise HTTPException(status_code=400, detail="Case is not ready — missing critical information")
    
    draft = generate_complaint_draft({
        "extracted": case.extracted_data,
        "ipc_sections": case.ipc_sections
    })
    
    case.complaint_draft = draft
    db.commit()
    
    return {"case_id": case_id, "draft": draft}
