-- CREATE EXTENSION
-- IF NOT EXISTS "uuid-ossp";

create table quizzes
(
    id uuid primary key default gen_random_uuid(),
    topic text,
    questions jsonb,
    answer_key text,
    created_at timestamp default now()
);
