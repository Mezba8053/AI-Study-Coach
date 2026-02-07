from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter()


class WrittenExamRequest(BaseModel):
    content: str


@router.post("/format-written-exam")
async def format_written_exam(written: WrittenExamRequest):
    try:
        text = written.content.strip()
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        questions = []
        for line in lines:
            if re.match(r"^\d+\.", line):
                questions.append({"question": line})

        return {"questions": questions}
    except Exception as e:
        return {"status": "error", "message": str(e)}

