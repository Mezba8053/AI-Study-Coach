from fastapi import APIRouter

router = APIRouter()


@router.get("/:saveQuiz")
async def save_quiz(quiz: str):
    try:
        with open("saved_quiz.txt", "w") as f:
            f.write(quiz)
        return {"status": "success", "message": "Quiz saved successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
