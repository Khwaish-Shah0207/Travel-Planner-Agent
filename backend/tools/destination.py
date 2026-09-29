"""
TOOL 1: Destination Information

First checks the local destinations.json dataset.

If the destination is not available locally, falls back to
Wikivoyage for external destination information.
"""

import json
import os
from typing import Any, Dict

import requests


DATA_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "destinations.json",
)


def _load_destinations() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _get_external_destination_info(destination: str) -> Dict[str, Any]:
    """Fetch destination information from Wikivoyage."""

    try:
        response = requests.get(
            "https://en.wikivoyage.org/w/api.php",
            params={
                "action": "query",
                "prop": "extracts",
                "exintro": 1,
                "explaintext": 1,
                "exchars": 3000,
                "titles": destination,
                "format": "json",
                "origin": "*",
            },
            headers={
                "User-Agent": "AI-Travel-Planner/1.0"
            },
            timeout=6,
        )

        response.raise_for_status()
        data = response.json()

        pages = data.get("query", {}).get("pages", {})

        for page in pages.values():
            extract = page.get("extract")

            if extract:
                return {
                    "destination": destination,
                    "attractions": [],
                    "travel_info": extract,
                    "avg_daily_costs": None,
                    "source": "Wikivoyage",
                }

        return {
            "error": f"No external travel information found for '{destination}'.",
            "source": "Wikivoyage",
        }

    except requests.RequestException as e:
        return {
            "error": f"External destination lookup failed for '{destination}'.",
            "details": str(e),
            "source": "Wikivoyage",
        }


def get_destination_info(destination: str) -> Dict[str, Any]:

    destinations = _load_destinations()
    key = destination.strip().lower()

    # 1. LOCAL DATASET
    if key in destinations:

        entry = destinations[key]

        return {
            "destination": entry["display_name"],
            "attractions": entry["attractions"],
            "travel_info": entry["travel_info"],
            "avg_daily_costs": entry["avg_daily_costs"],
            "source": "local destinations.json",
        }

    # 2. EXTERNAL FALLBACK
    return _get_external_destination_info(destination)