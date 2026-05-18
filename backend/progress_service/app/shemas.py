class Correctness(BaseModel):
    is_correct: bool
    score: float | None = None


class SkillEvidence(BaseModel):
    competency: str
    score: float
    weight: float
    applied: bool
    confidence: float = 1.0
    source: str = "ai_analysis"


class SkillState(BaseModel):
    mastery: float = 0.0
    recent_performance: float = 0.0
    attempts: int = 0
    trend: float = 0.0
    avg_involvement: float = 0.0
    confidence: float = 0.0
    deficit: float = 1.0
    uncertainty: float = 1.0
    mastery_reached: bool = False


class GeneratorTagRequirement(BaseModel):
    name: str
    required_level: float


class ModuleRecommendation(BaseModel):
    type: str = "educational_module"
    main_competency: str
    difficulty: float
    tags: list[GeneratorTagRequirement]
    goal: str
    priority: float
    explanation: dict