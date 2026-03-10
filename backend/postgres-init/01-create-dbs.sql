CREATE DATABASE attempts;

\connect attempts

CREATE SCHEMA IF NOT EXISTS attempts;

CREATE TABLE attempts.attempts (
    attempt_id UUID PRIMARY KEY,
    learning_session_id VARCHAR,
    timestamp TIMESTAMPTZ NOT NULL,
    mode VARCHAR,
    code_hash VARCHAR,
    analysis JSONB,
    mentor_action JSONB,
    episode_id UUID,
    skill_scores JSONB,
    total_score FLOAT,
    is_correct BOOLEAN,
    user_id VARCHAR
);