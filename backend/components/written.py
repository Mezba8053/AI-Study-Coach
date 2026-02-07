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
        current = None

        def _clean_prefix(text: str) -> str:
            cleaned = re.sub(r"^Q\d+\.?\s*", "", text, flags=re.IGNORECASE)
            cleaned = re.sub(r"^\d+\.?\s*", "", cleaned)
            return cleaned.strip()

        for line in lines:
            if re.match(r"^(Q\d+\.?\s*)?\d+\.?\s+", line, flags=re.IGNORECASE):
                if current:
                    questions.append({"question": current.strip()})
                current+=line
                # current = _clean_prefix(current)
            elif current:
                current += " " + line

        if current:
            questions.append({"question": current.strip()})

        return {"questions": questions}
    except Exception as e:
        return {"status": "error", "message": str(e)}

