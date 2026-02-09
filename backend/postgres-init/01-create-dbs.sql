CREATE DATABASE attempts;
\connect attempts

CREATE SCHEMA IF NOT EXISTS attempts;
CREATE TABLE attempts.attempts (
    attempt_id UUID PRIMARY KEY,
    session_id VARCHAR NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    mode VARCHAR,
    code_hash VARCHAR,
    analysis JSONB,
    mentor_action JSONB,
    episode_id UUID
);