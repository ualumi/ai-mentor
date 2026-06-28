from typing import Any

from pydantic import BaseModel, Field


class Correctness(BaseModel):
    is_correct: bool = False
    score: float | None = Field(default=None, ge=0.0, le=1.0)


class SkillEvidence(BaseModel):
    competency: str
    score: float = Field(ge=0.0, le=10.0)
    weight: float = Field(default=1.0, ge=0.0, le=1.0)
    applied: bool = False
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source: str = "ai_analysis"
    reason: str | None = None


class GeneratorTagRequirement(BaseModel):
    name: str
    required_level: float = Field(ge=0.0, le=1.0)


class ModuleRecommendation(BaseModel):
    type: str = "educational_module"
    main_competency: str
    difficulty: float = Field(ge=0.0, le=1.0)
    tags: list[GeneratorTagRequirement]
    goal: str
    priority: float = Field(ge=0.0)
    explain_goal: str | None = None
    explanation: dict[str, Any]
