from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizFormat(BaseModel):
    quizText: str


@app.post("/format-quiz")
async def format_quiz(quiz: QuizFormat):
    try:
        text = quiz.quizText.strip()
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        questions = []
        answers = {}

        i = 0
        while i < len(lines):
            # Question line: "1. Question?"
            if re.match(r"^\d+\.", lines[i]):
                question_text = lines[i]
                options = []

                # Collect options
                i += 1
                while i < len(lines) and re.match(r"^[a-d][\).]", lines[i]):
                    options.append(lines[i])
                    i += 1

                questions.append({
                    "question": question_text,
                    "options": options
                })
            else:
                i += 1

            # Stop when answers section starts
            if i > 0 and i < len(lines) and lines[i-1].lower().startswith("answer"):
                break

        # Extract answers section
        answer_lines = [l for l in lines if re.match(r"^\d+\.\s*[a-d]", l)]
        for ans in answer_lines:
            parts = ans.split(".")
            if len(parts) >= 2:
                q_num = parts[0]
                letter = parts[1].strip().lower()
                answers[int(q_num) - 1] = letter

        # Map correct answers
        answer_key = {}
        for idx, q in enumerate(questions):
            correct_letter = answers.get(idx)
            if correct_letter:
                for opt in q["options"]:
                    if opt.lower().startswith(correct_letter):
                        answer_key[idx] = opt
                        break
            else:
                answer_key[idx] = None

        # Don't include correct_answer in questions - only return questions without answers
        return {"questions": questions, "answer_key": answer_key}
    except Exception as e:
        print(f"Error parsing quiz: {e}")
        return {"questions": [], "error": str(e)}
@app.get("/:saveQuiz")
async def save_quiz(quiz: str):
    try:
        with open("saved_quiz.txt", "w") as f:
            f.write(quiz)
        return {"status": "success", "message": "Quiz saved successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

