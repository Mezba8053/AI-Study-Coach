from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import time
import google.generativeai as genai
from pathlib import Path
import json
import re
from google.api_core.exceptions import ResourceExhausted

router = APIRouter()

def _load_env_file(path: Path):
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


# Best-effort load local .env files (no external dependency)
base_dir = Path(__file__).resolve().parents[2]
_load_env_file(base_dir / ".env")
_load_env_file(base_dir / "frontend" / ".env")

API_KEY = (
    os.getenv("GOOGLE_API_KEY")
    or os.getenv("GEMINI_API_KEY")
    or os.getenv("REACT_APP_GOOGLE_API_KEY")
)

def _select_model():
    preferred = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-3-flash",
    ]
    try:
        models = genai.list_models()
        available = {
            m.name.split("/")[-1]: m
            for m in models
            if "generateContent" in getattr(m, "supported_generation_methods", [])
        }
        for name in preferred:
            if name in available:
                return genai.GenerativeModel(name)
        if available:
            first = next(iter(available.keys()))
            return genai.GenerativeModel(first)
    except Exception:
        pass
    return genai.GenerativeModel("gemini-pro")


if API_KEY:
    genai.configure(api_key=API_KEY)
    _MODEL = _select_model()
else:
    _MODEL = None

CACHE_TTL_SECONDS = 900
CACHE_MAX_ITEMS = 200
_CACHE = {}


def _cache_get(key: str):
    item = _CACHE.get(key)
    if not item:
        return None
    expires_at, value = item
    if time.time() > expires_at:
        _CACHE.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: str):
    if len(_CACHE) >= CACHE_MAX_ITEMS:
        oldest_key = next(iter(_CACHE))
        _CACHE.pop(oldest_key, None)
    _CACHE[key] = (time.time() + CACHE_TTL_SECONDS, value)


def _ensure_model():
    if not _MODEL:
        raise HTTPException(
            status_code=500,
            detail="Missing GOOGLE_API_KEY (or GEMINI_API_KEY) in backend environment.",
        )
    return _MODEL


def _generate_text(
    prompt: str,
    max_output_tokens: int,
    json_only: bool = False,
    retries: int = 3,
    base_delay: float = 2.0,
    stop_sequences: list[str] | None = None,
):
    model = _ensure_model()
    for attempt in range(retries + 1):
        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_output_tokens,
                    response_mime_type="application/json" if json_only else None,
                    stop_sequences=stop_sequences,
                ),
            )
            return response.text
        except ResourceExhausted:
            if attempt >= retries:
                raise
            sleep_for = base_delay * (2 ** attempt)
            time.sleep(sleep_for)


def _extract_json(text: str):
    cleaned = text.strip()
    cleaned = re.sub(r"```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                return None
    return None


def _mcq_is_valid(text: str) -> bool:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    questions = []
    answer_lines = []
    i = 0
    while i < len(lines):
        if re.match(r"^\d+\.", lines[i]):
            options = []
            i += 1
            while i < len(lines) and re.match(r"^[a-dA-D][\).]", lines[i]):
                options.append(lines[i])
                i += 1
            questions.append(options)
            continue
        if re.match(r"^\d+\.\s*[a-dA-D]", lines[i]):
            answer_lines.append(lines[i])
        i += 1

    if len(questions) < 5:
        return False
    if not all(len(opts) >= 4 for opts in questions[:5]):
        return False

    required = {str(n) for n in range(1, 6)}
    found = {line.split(".")[0] for line in answer_lines}
    return required.issubset(found)


class GenerateRequest(BaseModel):
    prompt: str
    force: bool | None = False
    nonce: str | None = None
    difficulty: str | None = "medium"


class GradeRequest(BaseModel):
    question: str
    answer: str


@router.post("/api/generate-quiz")
async def generate_quiz(req: GenerateRequest):
    prompt = req.prompt.strip()
    difficulty = req.difficulty or "medium"
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    key = f"quiz::{prompt}::{difficulty}"
    cached = None if req.force or req.nonce else _cache_get(key)
    if cached:
        return {"text": cached, "cached": True}

    short_prompt = prompt[:1200]
    full_prompt = (
        f"Quiz Topic: {short_prompt}\n"
        f"Difficulty: {difficulty}.\n"
        "Generate exactly 5 multiple-choice questions with 4 options (a-d).\n"
        # "Output ONLY the following format, nothing else:\n"
        # "1. Question text\n"
        # "a) option\n"
        # "b) option\n"
        # "c) option\n"
        # "d) option\n"
        # "Answer Key:\n"
        # "1. a\n"
        # "2. b\n"
        # "3. c\n"
        # "4. d\n"
        # "5. a"
    )

    text = ""
    for attempt in range(3):
        strict_note = "\nSTRICT: Include all 4 options AND full Answer Key for 1-5." if attempt > 0 else ""
        text = _generate_text(full_prompt + strict_note, max_output_tokens=1000)
        if _mcq_is_valid(text):
            break
    if not _mcq_is_valid(text):
        raise HTTPException(status_code=502, detail="Quiz generation incomplete, retry.")
    print(f"Generated quiz text: {text}")
    _cache_set(key, text)
    return {"text": text, "cached": False}
# @router.post("/api/saveQuiz")
# async def saveQuiz(req: saveRequest):
#     quiz= req.quizData.strip()
#     if not quiz:
#         raise HTTPException(status_code=400, detail="Quiz data is required.")
#     try:


@router.post("/api/generate-written-exam")
async def generate_written_exam(req: GenerateRequest):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    key = f"written::{prompt}"
    cached = None if req.force or req.nonce else _cache_get(key)
    if cached:
        return {"text": cached, "cached": True}

    short_prompt = prompt[:1500]
    full_prompt = (
        "Create 5 short written questions (no MCQ) based on:\n" + short_prompt
    )

    text = _generate_text(full_prompt, max_output_tokens=700)
    _cache_set(key, text)
    return {"text": text, "cached": False}


@router.post("/api/grade-written-answer")
async def grade_written_answer(req: GradeRequest):
    question = req.question.strip()
    answer = req.answer.strip()
    if not question or not answer:
        raise HTTPException(status_code=400, detail="Question and answer required.")

    key = f"grade::{question}::{answer}"
    cached = _cache_get(key)
    if cached:
        return {"text": cached, "cached": True}

    short_question = question[:400]
    short_answer = answer[:600]
    base_prompt = (
        "Return ONLY a single JSON object. No preface, no markdown. "
        "Keys: score, feedback, improve. "
        "Example: {\"score\":7,\"feedback\":\"...\",\"improve\":\"...\"}. "
    )

    parsed = None
    text = ""
    for _ in range(2):
        prompt = base_prompt + f"Q: {short_question} A: {short_answer}"
        text = _generate_text(
            prompt,
            max_output_tokens=900,
            json_only=True,
            stop_sequences=None,
        )
        print(f"Grading response text: {text}")
        parsed = _extract_json(text)
        if parsed:
            break
    _cache_set(key, text)
    return {"text": text, "result": parsed, "cached": False}
