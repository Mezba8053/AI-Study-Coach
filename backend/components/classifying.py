from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
 
class QuizFormat(BaseModel):
    content: str
    question: str
    options: list[str]
    answer: str
@router.post("/format_quiz")
async def format_quiz(quiz: QuizFormat):
    raw_quiz = quiz.content
    lines=raw_quiz.split("\n")
    formatted_quiz =[]
    answer_key = ""
    q_number = 1
    for line in lines:
        if "Answer:" in line:
            answer_key = line.split("Answer:")[1].strip()
        elif line.strip():
            formatted_quiz.append(
                f"{q_number}. {line.strip()}"

            )
            q_number += 1
    return {"formatted_quiz": formatted_quiz, "answer_key": answer_key}