

from typing import Any, Dict, Optional


def calculate_budget(
    budget: float,
    days: int,
    travelers: int,
    destination_avg_costs: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    INPUT:
        budget: total trip budget in INR, e.g. 20000
        days: number of days, e.g. 3
        travelers: number of people, e.g. 2
        destination_avg_costs: optional dict from the destination tool, e.g.
            {"hotel_per_room_per_night": 2000, "food_per_person_per_day": 800,
             "local_transport_per_day": 400}
            If provided, we use REAL per-destination rates. Otherwise we fall
            back to a simple percentage split of the total budget.

    OUTPUT: dict with hotel/food/transport/activities/total/remaining and
            an "over_budget" boolean flag.
    """
    days = max(1, int(days))
    travelers = max(1, int(travelers))
    budget = float(budget)

    if destination_avg_costs:
        # Assume 2 travelers can share a hotel room.
        rooms_needed = max(1, (travelers + 1) // 2)
        hotel = destination_avg_costs.get("hotel_per_room_per_night", 2000) * rooms_needed * days
        food = destination_avg_costs.get("food_per_person_per_day", 700) * travelers * days
        transport = destination_avg_costs.get("local_transport_per_day", 400) * days
        # Whatever's left of the budget (roughly), reserved for activities -
        # but never negative, and capped so it doesn't look unrealistic.
        activities = max(0.0, round(budget * 0.25, -1))
    else:
        # No destination data available yet - simple percentage split.
        hotel = round(budget * 0.35, -1)
        food = round(budget * 0.25, -1)
        transport = round(budget * 0.15, -1)
        activities = round(budget * 0.25, -1)

    total = hotel + food + transport + activities
    remaining = round(budget - total, 2)

    return {
        "accommodation": round(hotel, 2),
        "food": round(food, 2),
        "local_transport": round(transport, 2),
        "activities": round(activities, 2),
        "total_estimated_cost": round(total, 2),
        "remaining_budget": remaining,
        "over_budget": remaining < 0,
    }
