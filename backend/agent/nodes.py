

import inspect
import os
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from agent.prompts import (
    DECISION_SYSTEM_PROMPT,
    EXTRACTION_SYSTEM_PROMPT,
    FINAL_RESPONSE_SYSTEM_PROMPT,
)
from agent.state import AgentState
from tools.activities import search_activities
from tools.budget import calculate_budget
from tools.destination import get_destination_info
from tools.weather import get_weather

MAX_TOOL_CALLS = 6  # Hard safety cap so the agent loop can never run forever.

FRIENDLY_STEP_LABELS = {
    "get_destination_info": "Looking up destination information",
    "search_activities": "Finding matching activities",
    "get_weather": "Checking the weather",
    "calculate_budget": "Calculating estimated budget",
}


# ---------------------------------------------------------------------------
# Set up the Gemini model. Model name comes from an env var so it's easy to
# swap (e.g. gemini-3.8-flash, gemini-2.5-flash) without touching code.
# ---------------------------------------------------------------------------


def _get_llm() -> ChatGroq:
    api_key = os.environ.get("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add your Groq API key to backend/.env"
        )

    model_name = os.environ.get(
        "GROQ_MODEL",
        "openai/gpt-oss-120b",
    )

    max_retries = int(
        os.environ.get("GROQ_MAX_RETRIES", "0")
    )

    return ChatGroq(
        model=model_name,
        api_key=api_key,
        temperature=0.3,
        max_retries=max_retries,
    )


# ---------------------------------------------------------------------------
# Pydantic schema used for STRUCTURED OUTPUT in the planner node.
# This is a different mechanism from "tool calling" - here we just ask Gemini
# to fill in a fixed schema, which is perfect for one-shot extraction.
# ---------------------------------------------------------------------------
class TravelRequest(BaseModel):
    destination: str = Field(description="City or region name, e.g. 'Goa'")
    days: int = Field(description="Number of days for the trip", ge=1, le=30)
    travelers: int = Field(description="Number of travelers", ge=1, le=20)
    budget: float = Field(description="Total trip budget in INR", ge=0)
    interests: List[str] = Field(description="Lowercase interest tags, e.g. ['beaches','cafes']")


# ---------------------------------------------------------------------------
# LangChain @tool wrappers around our plain Python tool functions.
# Wrapping them like this lets us hand them to Gemini via `.bind_tools(...)`,
# so GEMINI ITSELF decides which one to call and with what arguments -
# that's the actual "LLM tool calling" this project is meant to demonstrate.
# The underlying logic is still the plain functions in backend/tools/*.py.
# ---------------------------------------------------------------------------
@tool
def get_destination_info_tool(destination: str) -> Dict[str, Any]:
    """Get attractions, travel info and average daily costs for a destination."""
    return get_destination_info(destination)


@tool
def search_activities_tool(destination: str, interests: List[str]) -> Dict[str, Any]:
    """Find activities in a destination that match the traveler's interests."""
    return search_activities(destination, interests)


@tool
def get_weather_tool(destination: str) -> Dict[str, Any]:
    """Get current weather for a destination."""
    return get_weather(destination)


@tool
def calculate_budget_tool(budget: float, days: int, travelers: int) -> Dict[str, Any]:
    """Calculate an estimated cost breakdown (hotel/food/transport/activities) for a trip."""
    # Enrich with real destination rates if we already looked them up.
    return calculate_budget(budget, days, travelers)


TOOL_REGISTRY = {
    "get_destination_info": (get_destination_info_tool, get_destination_info),
    "search_activities": (search_activities_tool, search_activities),
    "get_weather": (get_weather_tool, get_weather),
    "calculate_budget": (calculate_budget_tool, calculate_budget),
}


# ---------------------------------------------------------------------------
# NODE 1: planner
# Understands the free-text request and turns it into structured fields.
# ---------------------------------------------------------------------------
def planner_node(state: AgentState) -> Dict[str, Any]:
    llm = _get_llm()
    structured_llm = llm.with_structured_output(TravelRequest)

    user_prompt = f"Traveler's message: {state['user_request']}"
    if state.get("previous_summary"):
        user_prompt += f"\n\nPREVIOUS TRIP SUMMARY (for follow-up requests):\n{state['previous_summary']}"

    messages = [SystemMessage(content=EXTRACTION_SYSTEM_PROMPT), HumanMessage(content=user_prompt)]
    extracted: TravelRequest = structured_llm.invoke(messages)

    return {
        "destination": extracted.destination,
        "days": extracted.days,
        "travelers": extracted.travelers,
        "budget": extracted.budget,
        "interests": extracted.interests,
        "steps": ["Understood your request: "
                  f"{extracted.destination}, {extracted.days} day(s), "
                  f"{extracted.travelers} traveler(s), budget ₹{extracted.budget:.0f}"],
    }

def destination_info_node(state: AgentState) -> Dict[str, Any]:
    print("[LangGraph] Destination tool")

    result = get_destination_info(state["destination"])

    return {
        "tool_results": {
            **state["tool_results"],
            "get_destination_info": result,
        },
        "tools_called": ["get_destination_info"],
        "steps": ["Looking up destination information"],
    }


def activities_node(state: AgentState) -> Dict[str, Any]:
    print("[LangGraph] Activities tool")

    result = search_activities(
        state["destination"],
        state["interests"],
    )

    return {
        "tool_results": {
            **state["tool_results"],
            "search_activities": result,
        },
        "tools_called": ["search_activities"],
        "steps": ["Finding matching activities"],
    }


def weather_node(state: AgentState) -> Dict[str, Any]:
    print("[LangGraph] Weather tool")

    result = get_weather(state["destination"])

    return {
        "tool_results": {
            **state["tool_results"],
            "get_weather": result,
        },
        "tools_called": ["get_weather"],
        "steps": ["Checking the weather"],
    }


def budget_node(state: AgentState) -> Dict[str, Any]:
    print("[LangGraph] Budget tool")

    destination_info = state["tool_results"].get(
        "get_destination_info", {}
    )

    avg_daily_costs = destination_info.get("avg_daily_costs")

    if avg_daily_costs:
        result = calculate_budget(
            budget=state["budget"],
            days=state["days"],
            travelers=state["travelers"],
            destination_avg_costs=avg_daily_costs,
        )
    else:
        result = calculate_budget(
            budget=state["budget"],
            days=state["days"],
            travelers=state["travelers"],
        )

    return {
        "tool_results": {
            **state["tool_results"],
            "calculate_budget": result,
        },
        "tools_called": ["calculate_budget"],
        "steps": ["Calculating estimated budget"],
    }
# ---------------------------------------------------------------------------
# NODE 2: decision
# Gemini looks at what's known so far and decides: call another tool, or
# are we ready for the final itinerary? This is real LLM tool-calling.
# ---------------------------------------------------------------------------
def decision_node(state: AgentState) -> Dict[str, Any]:
    # Safety valve: never loop forever.
    if len(state["tools_called"]) >= MAX_TOOL_CALLS:
        return {"next_tool": None, "next_tool_args": {}, "steps": ["Enough information gathered, generating itinerary"]}

    llm = _get_llm()
    tool_objs = [t[0] for t in TOOL_REGISTRY.values()]
    llm_with_tools = llm.bind_tools(tool_objs)

    summary = (
        f"Trip requirements: destination={state['destination']}, days={state['days']}, "
        f"travelers={state['travelers']}, budget={state['budget']}, interests={state['interests']}\n"
        f"Tools already called: {state['tools_called']}\n"
        f"Tool results so far: {state['tool_results']}"
    )

    messages = [SystemMessage(content=DECISION_SYSTEM_PROMPT), HumanMessage(content=summary)]
    response = llm_with_tools.invoke(messages)

    if response.tool_calls:
        call = response.tool_calls[0]
        tool_name = call["name"]
        # Map the LangChain tool wrapper name (e.g. "get_destination_info_tool")
        # back to our plain registry key (e.g. "get_destination_info").
        registry_key = tool_name[:-5] if tool_name.endswith("_tool") else tool_name
        label = FRIENDLY_STEP_LABELS.get(registry_key, f"Calling {registry_key} tool")
        return {
            "next_tool": registry_key,
            "next_tool_args": call["args"],
            "steps": [label],
        }

    return {"next_tool": None, "next_tool_args": {}, "steps": ["Enough information gathered, generating itinerary"]}


# ---------------------------------------------------------------------------
# NODE 3: tool_executor
# Actually runs the plain Python function Gemini asked for, and stores the
# observation back into state so the decision node can see it next loop.
# ---------------------------------------------------------------------------
def tool_executor_node(state: AgentState) -> Dict[str, Any]:
    tool_name = state["next_tool"]
    args = dict(state["next_tool_args"] or {})

    # Fill in any missing arguments from state as a safety net (Gemini
    # sometimes omits args it thinks are "obvious" from context).
    args.setdefault("destination", state["destination"])
    if tool_name == "search_activities":
        args.setdefault("interests", state["interests"])
    if tool_name == "calculate_budget":
        args.setdefault("budget", state["budget"])
        args.setdefault("days", state["days"])
        args.setdefault("travelers", state["travelers"])
        # Enrich the plain budget calculator with real destination rates if we have them.
        dest_info = state["tool_results"].get("get_destination_info")
        if dest_info and "avg_daily_costs" in dest_info:
            result = calculate_budget(
                budget=args["budget"], days=args["days"], travelers=args["travelers"],
                destination_avg_costs=dest_info["avg_daily_costs"],
            )
            return _store_tool_result(state, tool_name, result)

    _, plain_fn = TOOL_REGISTRY[tool_name]
    # Only pass the arguments the underlying plain function actually accepts.
    accepted = inspect.signature(plain_fn).parameters
    filtered_args = {k: v for k, v in args.items() if k in accepted}
    result = plain_fn(**filtered_args)

    return _store_tool_result(state, tool_name, result)


def _store_tool_result(state: AgentState, tool_name: str, result: Any) -> Dict[str, Any]:
    new_tool_results = {**state["tool_results"], tool_name: result}
    return {
        "tool_results": new_tool_results,
        "tools_called": [tool_name],  # appended via the operator.add reducer
        "next_tool": None,
        "next_tool_args": {},
    }


# ---------------------------------------------------------------------------
# ROUTING FUNCTION for the conditional edge after `decision`.
# ---------------------------------------------------------------------------
def route_after_decision(state: AgentState) -> str:
    return "tool_executor" if state["next_tool"] else "final_response"


# ---------------------------------------------------------------------------
# NODE 4: final_response
# Gemini writes the itinerary using everything gathered so far.
# ---------------------------------------------------------------------------
def final_response_node(state: AgentState) -> Dict[str, Any]:
    llm = _get_llm()

    context = (
        f"Trip requirements: destination={state['destination']}, days={state['days']}, "
        f"travelers={state['travelers']}, budget={state['budget']}, interests={state['interests']}\n\n"
        f"Tool results:\n{state['tool_results']}"
    )

    messages = [SystemMessage(content=FINAL_RESPONSE_SYSTEM_PROMPT), HumanMessage(content=context)]
    response = llm.invoke(messages)

    return {"itinerary": response.content, "steps": ["Generating final itinerary"]}
