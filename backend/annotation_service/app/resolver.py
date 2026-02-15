'''import ast
import re
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from dataclasses import dataclass


# ==========================================================
# Domain Model
# ==========================================================

@dataclass
class Annotation:
    line: int
    type: str
    message: str
    confidence: float


# ==========================================================
# Base Resolver (language-agnostic entry)
# ==========================================================

class BaseResolver(ABC):

    @abstractmethod
    def resolve(self, code: str, analysis: Dict) -> List[Annotation]:
        pass


# ==========================================================
# Python Implementation
# ==========================================================

class PythonResolver(BaseResolver):

    def resolve(self, code: str, analysis: Dict) -> List[Annotation]:
        tree = ast.parse(code)
        print(tree)
        lines = code.split("\n")

        structural = StructuralMatcher(tree)
        similarity = SimilarityMatcher(lines)

        annotations = []

        for text, ann_type in self._extract_analysis_texts(analysis):

            # 1️⃣ Structural first
            line = structural.match(text)

            if line:
                annotations.append(
                    Annotation(line, ann_type, text, 0.85)
                )
                continue

            # 2️⃣ Similarity fallback
            sim_line, score = similarity.match(text)

            if score > 0.15:
                annotations.append(
                    Annotation(sim_line, ann_type, text, round(score, 2))
                )
                continue

            # 3️⃣ Default fallback
            fallback = structural.get_primary_anchor()
            annotations.append(
                Annotation(fallback, ann_type, text, 0.4)
            )
        print("annotations in ast", annotations)
        return annotations

    # -------------------------

    def _extract_analysis_texts(self, analysis: Dict):

        for w in analysis.get("weaknesses", []):
            yield w, "warning"

        for s in analysis.get("strengths", []):
            yield s, "info"

        for r in analysis.get("recommendations", []):
            yield r, "suggestion"


# ==========================================================
# Structural Matcher (AST Layer)
# ==========================================================

class StructuralMatcher:

    def __init__(self, tree: ast.AST):
        self.tree = tree
        self.function = self._find_first_function()

    # -------------------------

    def match(self, text: str) -> Optional[int]:

        text_lower = text.lower()

        if self._is_validation_issue(text_lower):
            return self._validation_anchor()

        if self._is_recursion_issue(text_lower):
            return self._recursion_anchor()

        if self._is_loop_issue(text_lower):
            return self._loop_anchor()

        if self._is_error_issue(text_lower):
            return self._error_anchor()

        return None

    # -------------------------

    def get_primary_anchor(self) -> int:
        return self.function.lineno if self.function else 1

    # -------------------------
    # Issue classification
    # -------------------------

    def _is_validation_issue(self, text):
        return "провер" in text or "валидац" in text

    def _is_recursion_issue(self, text):
        return "рекурс" in text

    def _is_loop_issue(self, text):
        return "цикл" in text

    def _is_error_issue(self, text):
        return "ошиб" in text or "исключен" in text

    # -------------------------
    # Anchors
    # -------------------------

    def _validation_anchor(self):
        if not self._has_if_statement():
            return self.get_primary_anchor()
        return None

    def _recursion_anchor(self):
        if not self.function:
            return None

        name = self.function.name

        for node in ast.walk(self.function):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == name:
                    return node.lineno
        return None

    def _loop_anchor(self):
        for node in ast.walk(self.tree):
            if isinstance(node, (ast.For, ast.While)):
                return node.lineno
        return None

    def _error_anchor(self):
        if not self._has_try():
            return self.get_primary_anchor()
        return None

    # -------------------------

    def _has_if_statement(self):
        for node in ast.walk(self.tree):
            if isinstance(node, ast.If):
                return True
        return False

    def _has_try(self):
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Try):
                return True
        return False

    def _find_first_function(self):
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                return node
        return None


# ==========================================================
# Similarity Matcher (Token Overlap)
# ==========================================================

class SimilarityMatcher:

    def __init__(self, lines: List[str]):
        self.lines = lines

    def match(self, text: str):

        tokens = self._tokenize(text)
        best_score = 0
        best_line = 1

        for i, line in enumerate(self.lines):
            line_tokens = self._tokenize(line)
            overlap = tokens.intersection(line_tokens)

            score = len(overlap) / (len(tokens) + 1e-5)

            if score > best_score:
                best_score = score
                best_line = i + 1

        return best_line, best_score

    def _tokenize(self, text: str):
        text = text.lower()
        text = re.sub(r"[^\w\s]", "", text)
        return set(text.split())'''



# получше но все равно хуевый
'''import ast
import re
from dataclasses import dataclass
from typing import List, Dict, Optional, Set
from abc import ABC, abstractmethod


# ==========================================================
# Domain Model
# ==========================================================

@dataclass
class Annotation:
    line: int        # 0 = глобальная аннотация
    type: str
    message: str
    confidence: float


# ==========================================================
# Base Resolver
# ==========================================================

class BaseResolver(ABC):

    @abstractmethod
    def resolve(self, code: str, analysis: Dict) -> List[Annotation]:
        pass


# ==========================================================
# Universal AST Indexer
# ==========================================================

class ASTIndexer:
    """
    Индексирует AST и собирает:
    - имена функций
    - вызовы
    - атрибуты
    - keyword-аргументы
    - переменные
    """

    def __init__(self, tree: ast.AST):
        self.calls = {}         # name -> lineno
        self.attributes = {}    # attr -> lineno
        self.keywords = {}      # keyword arg -> lineno
        self.functions = {}     # function name -> lineno
        self.names = {}         # variable name -> lineno

        self._index(tree)

    def _index(self, tree: ast.AST):

        for node in ast.walk(tree):

            # Function definitions
            if isinstance(node, ast.FunctionDef):
                self.functions[node.name] = node.lineno

            # Function calls
            if isinstance(node, ast.Call):

                # foo()
                if isinstance(node.func, ast.Name):
                    self.calls[node.func.id] = node.lineno

                # obj.foo()
                if isinstance(node.func, ast.Attribute):
                    self.calls[node.func.attr] = node.lineno

                # keyword arguments
                for kw in node.keywords:
                    if kw.arg:
                        self.keywords[kw.arg] = node.lineno

            # Attribute access
            if isinstance(node, ast.Attribute):
                self.attributes[node.attr] = node.lineno

            # Variable names
            if isinstance(node, ast.Name):
                self.names[node.id] = node.lineno


# ==========================================================
# Entity Extractor (из текста анализа)
# ==========================================================

class EntityExtractor:
    """
    Извлекает потенциальные кодовые сущности из текста анализа.
    Работает для любого ответа ИИ.
    """

    IDENTIFIER_PATTERN = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\b")

    def extract(self, text: str) -> Set[str]:

        candidates = set()

        # 1. стандартные идентификаторы
        for match in self.IDENTIFIER_PATTERN.findall(text):
            if not match.isdigit():
                candidates.add(match)

        # 2. слова внутри backticks
        backticks = re.findall(r"`([^`]+)`", text)
        candidates.update(backticks)

        # 3. слова перед скобками foo(...)
        func_calls = re.findall(r"([A-Za-z_][A-Za-z0-9_]*)\s*\(", text)
        candidates.update(func_calls)

        return candidates


# ==========================================================
# Evidence Matcher
# ==========================================================

class EvidenceMatcher:

    def match(
        self,
        entities: Set[str],
        index: ASTIndexer
    ) -> Optional[tuple]:

        """
        Возвращает (line, confidence)
        """

        # 1️⃣ Функции
        for e in entities:
            if e in index.functions:
                return index.functions[e], 0.95

        # 2️⃣ Вызовы
        for e in entities:
            if e in index.calls:
                return index.calls[e], 0.9

        # 3️⃣ Keyword arguments
        for e in entities:
            if e in index.keywords:
                return index.keywords[e], 0.9

        # 4️⃣ Атрибуты
        for e in entities:
            if e in index.attributes:
                return index.attributes[e], 0.85

        # 5️⃣ Переменные
        for e in entities:
            if e in index.names:
                return index.names[e], 0.75

        return None


# ==========================================================
# Python Resolver (новая логика)
# ==========================================================

class PythonResolver(BaseResolver):

    def __init__(self):
        self.extractor = EntityExtractor()
        self.matcher = EvidenceMatcher()

    def resolve(self, code: str, analysis: Dict) -> List[Annotation]:

        try:
            tree = ast.parse(code)
        except SyntaxError:
            return []

        index = ASTIndexer(tree)

        annotations: List[Annotation] = []

        for text, ann_type in self._extract_analysis_texts(analysis):

            entities = self.extractor.extract(text)

            match = self.matcher.match(entities, index)

            if match:
                line, confidence = match
                annotations.append(
                    Annotation(
                        line=line,
                        type=ann_type,
                        message=text,
                        confidence=confidence
                    )
                )
            else:
                # глобальная аннотация
                annotations.append(
                    Annotation(
                        line=0,
                        type=ann_type,
                        message=text,
                        confidence=0.4
                    )
                )

        return annotations

    # ------------------------------------------------------

    def _extract_analysis_texts(self, analysis: Dict):

        for w in analysis.get("weaknesses", []):
            yield w, "warning"

        for s in analysis.get("strengths", []):
            yield s, "info"

        for r in analysis.get("recommendations", []):
            yield r, "suggestion"'''


import ast
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


MODEL = SentenceTransformer("all-MiniLM-L6-v2")


@dataclass
class Annotation:
    line: int
    type: str
    message: str
    confidence: float


class PythonResolver:

    def __init__(self, code: str):
        self.code = code
        self.lines = code.split("\n")
        self.tree = ast.parse(code)

        self.spans = self._extract_spans()
        self.span_embeddings = self._embed_spans()

    def _extract_spans(self):
        spans = []

        for node in ast.walk(self.tree):
            if hasattr(node, "lineno"):
                start = node.lineno
                end = getattr(node, "end_lineno", node.lineno)

                text = "\n".join(self.lines[start - 1:end])

                spans.append({
                    "start": start,
                    "end": end,
                    "text": text,
                    "type": type(node).__name__
                })

        return spans

    def _embed_spans(self):
        texts = [span["text"] for span in self.spans]
        return MODEL.encode(texts)

    def _collect_comments(self, analysis: Dict[str, Any]):

        comments = []

        for key in ["strengths", "weaknesses", "recommendations"]:
            if key in analysis and isinstance(analysis[key], list):
                for item in analysis[key]:
                    comments.append((key, item))

        if "detailed_analysis" in analysis:
            comments.append(("info", analysis["detailed_analysis"]))

        return comments

    def _match_comment(self, comment: str):

        comment_embedding = MODEL.encode([comment])

        similarities = cosine_similarity(
            comment_embedding,
            self.span_embeddings
        )[0]

        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])
        best_span = self.spans[best_idx]

        return best_span["start"], best_score

    def resolve(self, analysis_json: Dict[str, Any]) -> List[Annotation]:

        annotations = []
        comments = self._collect_comments(analysis_json)

        for category, text in comments:
            if not isinstance(text, str) or not text.strip():
                continue

            line, similarity = self._match_comment(text)

            confidence = min(0.95, similarity)

            annotations.append(
                Annotation(
                    line=line,
                    type=category,
                    message=text.strip(),
                    confidence=round(confidence, 3)
                )
            )

        return annotations