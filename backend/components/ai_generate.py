from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import time
import google.generativeai as genai
from pathlib import Path
import json
import re

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

if API_KEY:
    genai.configure(api_key=API_KEY)
    _MODEL = genai.GenerativeModel("gemini-1.5-pro")
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


def _generate_text(prompt: str, max_output_tokens: int):
    model = _ensure_model()
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_output_tokens
        ),
    )
    return response.text


def _extract_json(text: str):
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                return None
    return None


class GenerateRequest(BaseModel):
    prompt: str
    force: bool | None = False
    nonce: str | None = None


class GradeRequest(BaseModel):
    question: str
    answer: str


@router.post("/api/generate-quiz")
async def generate_quiz(req: GenerateRequest):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    key = f"quiz::{prompt}"
    cached = None if req.force or req.nonce else _cache_get(key)
    if cached:
        return {"text": cached, "cached": True}

    short_prompt = prompt[:1200]
    full_prompt = (
        f"Quiz Topic: {short_prompt}\n"
        "Generate 5 MCQ questions. Each question with 4 options a-d. "
        "Provide Answer Key only. Be concise."
    )

    text = _generate_text(full_prompt, max_output_tokens=800)
    _cache_set(key, text)
    return {"text": text, "cached": False}


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

    short_question = question[:600]
    short_answer = answer[:800]
    prompt = (
        "Return a single-line JSON only with keys score, feedback, improve. "
        "Example: {\"score\":7,\"feedback\":\"...\",\"improve\":\"...\"}.\n"
        f"Q: {short_question}\nA: {short_answer}"
    )

    text = _generate_text(prompt, max_output_tokens=400)
    parsed = _extract_json(text)
    _cache_set(key, text)
    return {"text": text, "result": parsed, "cached": False}
