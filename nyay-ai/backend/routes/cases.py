from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.database import get_db, Case

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str

class NameUpdate(BaseModel):
    name: str

class ExtractedUpdate(BaseModel):
    extracted_data: dict


@router.get("/")
def get_all_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "case_name": c.case_name,
            "created_at": c.created_at,
            "urgency": c.urgency,
            "status": c.status,
            "complaint_ready": c.complaint_ready,
            "extracted_data": c.extracted_data or {},
            "ipc_sections": c.ipc_sections or [],
            "missing_fields": c.missing_fields or [],
        }
        for c in cases
    ]


@router.get("/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return {
        "id": case.id,
        "case_name": case.case_name,
        "created_at": case.created_at,
        "urgency": case.urgency,
        "status": case.status,
        "complaint_ready": case.complaint_ready,
        "extracted_data": case.extracted_data or {},
        "ipc_sections": case.ipc_sections or [],
        "missing_fields": case.missing_fields or [],
        "complaint_draft": case.complaint_draft,
        "conversation_history": case.conversation_history or [],
    }


@router.patch("/{case_id}/status")
def update_status(case_id: str, body: StatusUpdate, db: Session = Depends(get_db)):
    valid = ["draft", "submitted", "under_review", "closed"]
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid}")
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.status = body.status
    db.commit()
    return {"case_id": case_id, "status": body.status}


@router.patch("/{case_id}/name")
def update_name(case_id: str, body: NameUpdate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.case_name = body.name.strip()
    db.commit()
    return {"case_id": case_id, "case_name": case.case_name}


@router.patch("/{case_id}/extracted")
def update_extracted(case_id: str, body: ExtractedUpdate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    current = dict(case.extracted_data or {})
    current.update(body.extracted_data)
    case.extracted_data = current
    db.commit()
    return {"case_id": case_id, "extracted_data": case.extracted_data}


@router.delete("/{case_id}")
def delete_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(case)
    db.commit()
    return {"deleted": case_id}
