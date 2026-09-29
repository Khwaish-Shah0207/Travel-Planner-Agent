

from langgraph.graph import StateGraph, END

from agent.state import AgentState
from agent.nodes import (
    planner_node,
    destination_info_node,
    activities_node,
    weather_node,
    budget_node,
    final_response_node,
)


def build_graph():
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("planner", planner_node)
    graph.add_node("destination_info", destination_info_node)
    graph.add_node("activities", activities_node)
    graph.add_node("weather", weather_node)
    graph.add_node("budget_calculator", budget_node)
    graph.add_node("final_response", final_response_node)

    # Start
    graph.set_entry_point("planner")

    # Deterministic pipeline
    graph.add_edge("planner", "destination_info")
    graph.add_edge("destination_info", "activities")
    graph.add_edge("activities", "weather")
    graph.add_edge("weather", "budget_calculator")
    graph.add_edge("budget_calculator", "final_response")
    graph.add_edge("final_response", END)

    return graph.compile()


compiled_graph = build_graph()