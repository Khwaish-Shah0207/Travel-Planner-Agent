

import json
import os
from typing import Any, Dict, List

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "destinations.json")


def _load_destinations() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def search_activities(destination: str, interests: List[str]) -> Dict[str, Any]:
    """
    INPUT:
        destination: e.g. "Goa"
        interests:   e.g. ["beaches", "adventure"] - matched against each
                     activity's "category" field (case-insensitive, partial match)

    OUTPUT:
        {
          "destination": "Goa",
          "matched_activities": [ {...}, {...} ],   # activities matching interests
          "all_activities": [ {...}, ... ]          # full local list, as a fallback
        }
        or {"error": ...} if the destination isn't in our dataset.
    """
    destinations = _load_destinations()
    key = destination.strip().lower()


    if key not in destinations:
        return {
            "destination": destination,
            "matched_activities": [],
            "all_activities": [],
            "source": "external destination information",
            "note": (
                "No local activity dataset is available for this destination. "
                "Use the external destination information from the destination tool "
                "to suggest activities without inventing unsupported facts."
            ),
        }
    all_activities = destinations[key]["activities"]

    if not interests:
        matched = all_activities
    else:
        normalized_interests = [i.strip().lower() for i in interests]
        matched = [
            a for a in all_activities
            if any(interest in a["category"].lower() for interest in normalized_interests)
        ]
        # If none of the user's interests matched anything we know about,
        # fall back to the full list so the agent still has something to work with.
        if not matched:
            matched = all_activities

    return {
        "destination": destinations[key]["display_name"],
        "matched_activities": matched,
        "all_activities": all_activities,
    }
