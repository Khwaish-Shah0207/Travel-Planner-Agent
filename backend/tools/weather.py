

import json
import os
from typing import Any, Dict

import requests

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "destinations.json")

#Very small fallback table, used only if the free API call fails
_MOCK_WEATHER = {
    "goa": {"condition": "Sunny", "temperature_c": 31},
    "mumbai": {"condition": "Humid", "temperature_c": 32},
    "delhi": {"condition": "Clear", "temperature_c": 28},
    "jaipur": {"condition": "Sunny", "temperature_c": 30},
    "manali": {"condition": "Cold", "temperature_c": 12},
    "kerala": {"condition": "Humid", "temperature_c": 29},
}


def _load_destinations() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_weather(destination: str) -> Dict[str, Any]:
    """
    INPUT:  destination (str)
    OUTPUT: {"destination": ..., "condition": ..., "temperature_c": ..., "source": "live"|"mock"}
    """
    destinations = _load_destinations()
    key = destination.strip().lower()

    if key not in destinations:
        return {"error": f"No weather data available for '{destination}'."}

    entry = destinations[key]

    try:
        # Open-Meteo free "current weather" endpoint - no API key required.
        response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": entry["lat"], "longitude": entry["lon"], "current_weather": True},
            timeout=4,
        )
        response.raise_for_status()
        data = response.json()["current_weather"]
        return {
            "destination": entry["display_name"],
            "temperature_c": data["temperature"],
            "condition": _weathercode_to_text(data.get("weathercode", 0)),
            "source": "live (Open-Meteo)",
        }
    except Exception:
        # Network issue, API down, timeout, etc. Fall back to a rough local guess
        # so the agent's flow never crashes because of the weather tool.
        mock = _MOCK_WEATHER.get(key, {"condition": "Unknown", "temperature_c": 28})
        return {
            "destination": entry["display_name"],
            "temperature_c": mock["temperature_c"],
            "condition": mock["condition"],
            "source": "mock (fallback, offline estimate)",
        }


def _weathercode_to_text(code: int) -> str:
    """Open-Meteo returns a numeric weather code; translate a few common ones."""
    mapping = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Foggy",
        51: "Light drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
        71: "Light snow", 73: "Snow", 75: "Heavy snow",
        80: "Rain showers", 95: "Thunderstorm",
    }
    return mapping.get(code, "Mixed conditions")
