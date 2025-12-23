# app/state.py
from typing import Dict
import asyncio

class TaskState:
    def __init__(self):
        self.condition = None
        self.code = None
        self.mentor_reply = None
        self.sandbox_reply = None
        self.step_id = None

        self.condition_event = asyncio.Event()
        self.code_event = asyncio.Event()
        self.reply_event = asyncio.Event()

TASKS: Dict[str, TaskState] = {}
