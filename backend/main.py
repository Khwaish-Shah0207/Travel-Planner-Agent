

import os
import uuid

from dotenv import load_dotenv

load_dotenv()  # load backend/.env before anything else touches os.environ

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import memory
from agent.graph import compiled_graph
from agent.state import build_initial_state

app = FastAPI(title="AI Travel Planner Agent")

# Allow the local Next.js dev server (http://localhost:3000) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PlanTripRequest(BaseModel):
    request: str  # the free-text user message, e.g. "Plan a 3 day Goa trip..."
    conversation_id: str | None = None


class PlanTripResponse(BaseModel):
    itinerary: str
    steps: list[str]
    conversation_id: str
    trip_details: dict


@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Travel Planner backend is running."}


@app.post("/plan-trip", response_model=PlanTripResponse)
def plan_trip(payload: PlanTripRequest):
    # ---- Basic input validation (section 17: error handling) ----
    if not payload.request or not payload.request.strip():
        raise HTTPException(status_code=400, detail="Please describe the trip you want to plan.")

    conversation_id = payload.conversation_id or str(uuid.uuid4())

    if not os.environ.get("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured on the backend. "
            "Add your Groq API key to backend/.env."
        )

    # ---- Load simple memory for follow-up requests like "make it cheaper" ----
    previous_summary = memory.get_previous_summary(conversation_id)

    initial_state = build_initial_state(
        user_request=payload.request.strip(),
        conversation_id=conversation_id,
        previous_summary=previous_summary,
    )

    try:
        result = compiled_graph.invoke(initial_state)
    except RuntimeError as e:
        # e.g. missing/invalid Gemini API key raised from agent/nodes.py
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"The agent ran into an error: {e}")

    if not result.get("itinerary"):
        raise HTTPException(status_code=500, detail="The agent could not produce an itinerary. Please try again.")

    # ---- Save memory for the next follow-up message in this conversation ----
    memory.update_conversation(
        conversation_id=conversation_id,
        destination=result.get("destination"),
        days=result.get("days"),
        travelers=result.get("travelers"),
        budget=result.get("budget"),
        interests=result.get("interests"),
        itinerary=result.get("itinerary"),
    )

    return PlanTripResponse(
        itinerary=result["itinerary"],
        steps=result["steps"],
        conversation_id=conversation_id,
        trip_details={
            "destination": result.get("destination"),
            "days": result.get("days"),
            "travelers": result.get("travelers"),
            "budget": result.get("budget"),
            "interests": result.get("interests"),
        },
    )
