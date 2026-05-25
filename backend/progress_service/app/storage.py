import json
import os
import sqlite3
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np

from app.state import (
    ACTIVE_MODULES,
    COMPETENCY_GRAPH,
    EVIDENCE_STORE,
    PENDING_ACTIONS,
    RAW_ANALYSIS,
    RECOMMENDATION_HISTORY,
    USER_BANDIT_STATS,
    USER_PROGRESS,
    USER_RECOMMENDATIONS,
)


DEFAULT_DB_PATH = Path(os.getenv("PROGRESS_DB_PATH", "data/progress_service.sqlite3"))
DEFAULT_EVENT_LOG_PATH = Path(
    os.getenv("PROGRESS_EVENT_LOG_PATH", "data/progress_service_events.jsonl")
)


STATE_KEYS = {
    "active_modules": ACTIVE_MODULES,
    "competency_graph": COMPETENCY_GRAPH,
    "evidence_store": EVIDENCE_STORE,
    "pending_actions": PENDING_ACTIONS,
    "raw_analysis": RAW_ANALYSIS,
    "recommendation_history": RECOMMENDATION_HISTORY,
    "user_bandit_stats": USER_BANDIT_STATS,
    "user_progress": USER_PROGRESS,
    "user_recommendations": USER_RECOMMENDATIONS,
}


def init_storage(db_path: Path | str = DEFAULT_DB_PATH) -> None:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with _connect(path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS key_value_state (
                name TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS ml_event_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                user_id TEXT,
                learning_session_id TEXT,
                attempt_id TEXT,
                mode TEXT,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_ml_event_log_user_created
            ON ml_event_log(user_id, created_at)
            """
        )
        conn.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_ml_event_log_type_created
            ON ml_event_log(event_type, created_at)
            """
        )


def load_runtime_state(db_path: Path | str = DEFAULT_DB_PATH) -> None:
    init_storage(db_path)

    with _connect(db_path) as conn:
        rows = conn.execute("SELECT name, data FROM key_value_state").fetchall()

    loaded = {row["name"]: json.loads(row["data"]) for row in rows}

    _replace_dict(USER_PROGRESS, loaded.get("user_progress", {}))
    _replace_dict(USER_RECOMMENDATIONS, loaded.get("user_recommendations", {}))
    _replace_dict(RAW_ANALYSIS, loaded.get("raw_analysis", {}))
    _replace_dict(EVIDENCE_STORE, loaded.get("evidence_store", {}))
    _replace_dict(PENDING_ACTIONS, loaded.get("pending_actions", {}))
    _replace_dict(ACTIVE_MODULES, loaded.get("active_modules", {}))

    RECOMMENDATION_HISTORY.clear()
    for user_id, history in loaded.get("recommendation_history", {}).items():
        RECOMMENDATION_HISTORY[user_id] = history

    COMPETENCY_GRAPH.clear()
    for source, edges in loaded.get("competency_graph", {}).items():
        COMPETENCY_GRAPH[source] = defaultdict(float, edges)

    USER_BANDIT_STATS.clear()
    for context_id, actions in loaded.get("user_bandit_stats", {}).items():
        USER_BANDIT_STATS[context_id] = {}
        for action_key, stats in actions.items():
            USER_BANDIT_STATS[context_id][action_key] = {
                "A": np.array(stats["A"], dtype=float),
                "b": np.array(stats["b"], dtype=float),
                "count": int(stats.get("count", 0)),
                "value": float(stats.get("value", 0.0)),
            }


def persist_runtime_state(db_path: Path | str = DEFAULT_DB_PATH) -> None:
    init_storage(db_path)
    now = _utc_now()

    with _connect(db_path) as conn:
        for name, value in STATE_KEYS.items():
            conn.execute(
                """
                INSERT INTO key_value_state(name, data, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(name) DO UPDATE SET
                    data = excluded.data,
                    updated_at = excluded.updated_at
                """,
                (name, json.dumps(_to_jsonable(value)), now),
            )


def append_event(
    event_type: str,
    payload: dict,
    user_id: str | None = None,
    learning_session_id: str | None = None,
    attempt_id: str | None = None,
    mode: str | None = None,
    db_path: Path | str = DEFAULT_DB_PATH,
) -> None:
    init_storage(db_path)
    created_at = _utc_now()

    with _connect(db_path) as conn:
        conn.execute(
            """
            INSERT INTO ml_event_log(
                event_type,
                user_id,
                learning_session_id,
                attempt_id,
                mode,
                payload,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_type,
                user_id,
                None if learning_session_id is None else str(learning_session_id),
                None if attempt_id is None else str(attempt_id),
                None if mode is None else str(mode),
                json.dumps(_to_jsonable(payload)),
                created_at,
            ),
        )

    _append_jsonl_event(
        {
            "event_type": event_type,
            "user_id": user_id,
            "learning_session_id": None if learning_session_id is None else str(learning_session_id),
            "attempt_id": None if attempt_id is None else str(attempt_id),
            "mode": None if mode is None else str(mode),
            "payload": _to_jsonable(payload),
            "created_at": created_at,
        }
    )


def load_events(
    limit: int = 1000,
    user_id: str | None = None,
    event_type: str | None = None,
    db_path: Path | str = DEFAULT_DB_PATH,
) -> list[dict]:
    init_storage(db_path)
    clauses = []
    params: list[Any] = []

    if user_id is not None:
        clauses.append("user_id = ?")
        params.append(user_id)

    if event_type is not None:
        clauses.append("event_type = ?")
        params.append(event_type)

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    params.append(limit)

    with _connect(db_path) as conn:
        rows = conn.execute(
            f"""
            SELECT *
            FROM ml_event_log
            {where}
            ORDER BY id DESC
            LIMIT ?
            """,
            params,
        ).fetchall()

    return [
        {
            "id": row["id"],
            "event_type": row["event_type"],
            "user_id": row["user_id"],
            "learning_session_id": row["learning_session_id"],
            "attempt_id": row["attempt_id"],
            "mode": row["mode"],
            "payload": json.loads(row["payload"]),
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def _connect(db_path: Path | str) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def _replace_dict(target: dict, value: dict) -> None:
    target.clear()
    target.update(value)


def _to_jsonable(value):
    if isinstance(value, np.ndarray):
        return value.tolist()

    if isinstance(value, defaultdict):
        value = dict(value)

    if isinstance(value, dict):
        return {str(key): _to_jsonable(item) for key, item in value.items()}

    if isinstance(value, list):
        return [_to_jsonable(item) for item in value]

    if isinstance(value, tuple):
        return [_to_jsonable(item) for item in value]

    if isinstance(value, (np.floating, np.integer)):
        return value.item()

    return value


def _append_jsonl_event(event: dict, log_path: Path | str = DEFAULT_EVENT_LOG_PATH) -> None:
    path = Path(log_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("a", encoding="utf-8") as file:
        file.write(json.dumps(event, ensure_ascii=False) + "\n")


def _utc_now() -> str:
    return datetime.utcnow().isoformat()
