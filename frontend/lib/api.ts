/**
 * lib/api.ts
 *
 * WHAT THIS FILE DOES
 * --------------------
 * The single place where the frontend talks to the FastAPI backend
 * (http://localhost:8000). This is how "frontend communicates with backend":
 * a plain fetch() POST request, JSON in, JSON out. No extra libraries needed.
 *
 * HOW THE conversation_id WORKS (see backend/memory.py for the other half)
 * ---------------------------------------------------------------------
 * We generate a random id once per browser and store it in localStorage.
 * Every request we send includes this id, so the backend can recognise
 * "this is the same conversation as last time" and support follow-ups like
 * "make it cheaper".
 */

const BACKEND_URL = "http://localhost:8000";
const STORAGE_KEY = "travel-planner-conversation-id";

export function getConversationId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export interface TripDetails {
  destination: string | null;
  days: number | null;
  travelers: number | null;
  budget: number | null;
  interests: string[] | null;
}

export interface PlanTripResponse {
  itinerary: string;
  steps: string[];
  conversation_id: string;
  trip_details: TripDetails;
}

export async function planTrip(message: string): Promise<PlanTripResponse> {
  const conversationId = getConversationId();

  const res = await fetch(`${BACKEND_URL}/plan-trip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request: message, conversation_id: conversationId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Something went wrong." }));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }

  const data: PlanTripResponse = await res.json();

  // The backend may generate a fresh id if we didn't have one yet - keep it in sync.
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, data.conversation_id);
  }

  return data;
}
