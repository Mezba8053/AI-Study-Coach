
from fastapi import APIRouter, HTTPException
from supabase import create_client
from dotenv import load_dotenv
from pathlib import Path
import os
import psycopg2
from postgrest.exceptions import APIError

base_dir = Path(__file__).resolve().parents[2]
load_dotenv(base_dir / ".env")
load_dotenv(base_dir / "frontend" / ".env")

router = APIRouter()


def _get_supabase_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_API_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def _get_db_url():
    return os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")


def _ensure_quizzes_table():
    db_url = _get_db_url()
    if not db_url:
        return False
    try:
        with psycopg2.connect(db_url) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    create table if not exists public.quizzes (
                        id uuid primary key default gen_random_uuid(),
                        payload jsonb not null,
                        created_at timestamptz not null default now()
                    );
                    """
                )
                conn.commit()
        return True
    except Exception:
        return False


@router.get("/api/quiz-history")
async def quiz_history():
    client = _get_supabase_client()
    if not client:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        result = (
            client.table("quizzes")
            .select("*")
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return result.data
    except APIError as e:
        if e.code == "PGRST205" and _ensure_quizzes_table():
            result = (
                client.table("quizzes")
                .select("*")
                .order("created_at", desc=True)
                .limit(50)
                .execute()
            )
            return result.data
        if e.code == "PGRST205":
            raise HTTPException(
                status_code=500,
                detail="Table 'quizzes' not found. Set SUPABASE_DB_URL (or DATABASE_URL) so the backend can auto-create it, or create the table manually in Supabase SQL editor.",
            )
        raise
