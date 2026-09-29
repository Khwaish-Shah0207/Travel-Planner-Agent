

import json
import os
import threading
from typing import Any, Dict, Optional

STORE_PATH = os.path.join(os.path.dirname(__file__), "data", "conversations.json")
_lock = threading.Lock()  # local dev only has one user, but let's be tidy anyway


def _load_all() -> Dict[str, Any]:
    if not os.path.exists(STORE_PATH):
        return {}
    try:
        with open(STORE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}


def _save_all(data: Dict[str, Any]) -> None:
    with open(STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def get_previous_summary(conversation_id: str) -> str:
    """Returns a short text summary of the last trip for this conversation, or "" if none."""
    with _lock:
        data = _load_all()
    entry = data.get(conversation_id)
    if not entry:
        return ""
    req = entry.get("last_request", {})
    return (
        f"destination={req.get('destination')}, days={req.get('days')}, "
        f"travelers={req.get('travelers')}, budget={req.get('budget')}, "
        f"interests={req.get('interests')}"
    )


def update_conversation(
    conversation_id: str,
    destination: Optional[str],
    days: Optional[int],
    travelers: Optional[int],
    budget: Optional[float],
    interests: Optional[list],
    itinerary: Optional[str],
) -> None:
    with _lock:
        data = _load_all()
        data[conversation_id] = {
            "last_request": {
                "destination": destination,
                "days": days,
                "travelers": travelers,
                "budget": budget,
                "interests": interests,
            },
            "last_itinerary": itinerary,
        }
        _save_all(data)
