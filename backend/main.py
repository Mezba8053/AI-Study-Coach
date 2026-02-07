from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from components.quiz_format import router as quiz_format_router
from components.save_quiz import router as save_quiz_router
from components.classifying import router as classifying_router
from components.written import router as written_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz_format_router)
app.include_router(save_quiz_router)
app.include_router(classifying_router)
app.include_router(written_router)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

