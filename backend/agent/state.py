

import operator
from typing import Annotated, Any, Dict, List, Optional, TypedDict


class AgentState(TypedDict):
    # ---- Input ----
    user_request: str
    conversation_id: str
    previous_summary: str

    # ---- Structured trip info (filled in by the planner node) ----
    destination: Optional[str]
    days: Optional[int]
    travelers: Optional[int]
    budget: Optional[float]
    interests: List[str]

    # ---- Tool bookkeeping ----
    tool_results: Dict[str, Any]
    tools_called: Annotated[List[str], operator.add]
    next_tool: Optional[str]
    next_tool_args: Dict[str, Any]

    # ---- UI-facing execution log (safe, high-level, no chain-of-thought) ----
    steps: Annotated[List[str], operator.add]

    # ---- Output ----
    itinerary: Optional[str]
    error: Optional[str]


def build_initial_state(
    user_request: str,
    conversation_id: str,
    previous_summary: str = "",
) -> AgentState:
    """Helper to construct a clean starting state for a new graph run."""
    return AgentState(
        user_request=user_request,
        conversation_id=conversation_id,
        previous_summary=previous_summary,
        destination=None,
        days=None,
        travelers=None,
        budget=None,
        interests=[],
        tool_results={},
        tools_called=[],
        next_tool=None,
        next_tool_args={},
        steps=[],
        itinerary=None,
        error=None,
    )
