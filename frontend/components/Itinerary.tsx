"use client";

import CircularCarousel from "./CircularCarousel";

interface ItineraryProps {
  itinerary: string;
}

interface DayPlan {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  cost: string;
}

interface ParsedItinerary {
  destination: string;
  duration: string;
  travelers: string;
  budget: string;
  days: DayPlan[];
  accommodation: string;
  food: string;
  transport: string;
  activities: string;
  total: string;
  remaining: string;
  notes: string[];
}


function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\r/g, "")
    .trim();
}

function cleanValue(value: string): string {
  return cleanText(value)
    .replace(/^[-•]\s*/, "")
    .trim();
}


function formatINR(value: string): string {
  if (!value) return "—";

  const cleaned = cleanValue(value)
    .replace(/^(INR|Rs\.?|Rupees)\s*/i, "")
    .replace(/^[$₹]\s*/, "")
    .replace(/,/g, "")
    .trim();

  const numberMatch = cleaned.match(/-?\d+(?:\.\d+)?/);

  if (!numberMatch) {
    return value;
  }

  const number = Number(numberMatch[0]);

  if (!Number.isFinite(number)) {
    return value;
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}


function parseItinerary(text: string): ParsedItinerary {
  const result: ParsedItinerary = {
    destination: "",
    duration: "",
    travelers: "",
    budget: "",
    days: [],
    accommodation: "",
    food: "",
    transport: "",
    activities: "",
    total: "",
    remaining: "",
    notes: [],
  };

  const lines = text
    .split(/\r?\n/)
    .map((line) => cleanText(line))
    .filter((line) => line.length > 0);

  let section:
    | "none"
    | "overview"
    | "day"
    | "budget"
    | "notes" = "none";

  let currentDay: DayPlan | null = null;

  for (const line of lines) {


    const heading = line.match(/^#{1,6}\s+(.+?)\s*$/);

    if (heading) {
      const headingText = heading[1]
        .replace(/\*/g, "")
        .trim()
        .toLowerCase();

      if (headingText === "trip overview") {
        section = "overview";
        currentDay = null;
        continue;
      }

      const dayMatch = headingText.match(/^day\s+(\d+)$/i);

      if (dayMatch) {
        const dayNumber = Number(dayMatch[1]);

        currentDay = {
          day: dayNumber,
          morning: "",
          afternoon: "",
          evening: "",
          cost: "",
        };

        result.days.push(currentDay);
        section = "day";
        continue;
      }

      if (headingText === "budget summary") {
        section = "budget";
        currentDay = null;
        continue;
      }

      if (headingText === "notes") {
        section = "notes";
        currentDay = null;
        continue;
      }
    }


    if (section === "overview") {
      const match = line.match(
        /^(Destination|Duration|Travelers|Budget)\s*:\s*(.+)$/i
      );

      if (match) {
        const key = match[1].toLowerCase();
        const value = cleanValue(match[2]);

        switch (key) {
          case "destination":
            result.destination = value;
            break;

          case "duration":
            result.duration = value;
            break;

          case "travelers":
            result.travelers = value;
            break;

          case "budget":
            result.budget = value;
            break;
        }
      }

      continue;
    }


    if (section === "day" && currentDay) {
  const match = line.match(
    /^(Morning|Afternoon|Evening|Estimated\s+cost)\s*:\s*(.+)$/i
  );

  if (match) {
    const key = match[1]
      .toLowerCase()
      .replace(/\s+/g, " ");

    const value = cleanValue(match[2]);

    switch (key) {
      case "morning":
        currentDay.morning = value;
        break;

      case "afternoon":
        currentDay.afternoon = value;
        break;

      case "evening":
        currentDay.evening = value;
        break;

      case "estimated cost":
        currentDay.cost = value;
        break;
    }
  }

  continue;
}


    if (section === "budget") {
  const match = line.match(
    /^(?:[-•*]\s*)?(Accommodation|Food|Transport|Local\s+transport|Activities|Total|Total\s+estimated\s+cost|Remaining|Remaining\s+budget)\s*:\s*(.+)$/i
  );

  if (match) {
    const key = match[1]
      .toLowerCase()
      .replace(/\s+/g, " ");

    const value = cleanValue(match[2]);

    switch (key) {
      case "accommodation":
        result.accommodation = value;
        break;

      case "food":
        result.food = value;
        break;

      case "transport":
      case "local transport":
        result.transport = value;
        break;

      case "activities":
        result.activities = value;
        break;

      case "total":
      case "total estimated cost":
        result.total = value;
        break;

      case "remaining":
      case "remaining budget":
        result.remaining = value;
        break;
    }
  }

  continue;
}


    if (section === "notes") {
      const note = line
        .replace(/^[-*•]\s*/, "")
        .trim();

      if (note) {
        result.notes.push(note);
      }

      continue;
    }
  }

  return result;
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Itinerary({
  itinerary,
}: ItineraryProps) {
  const parsed = parseItinerary(itinerary);

  return (
    <div className="space-y-6">

      {/* ========================================================
          TRIP OVERVIEW
      ======================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold text-indigo-600">
            Your personalized trip
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Trip Overview
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Destination"
            value={parsed.destination}
          />

          <StatCard
            label="Duration"
            value={parsed.duration}
          />

          <StatCard
            label="Travelers"
            value={parsed.travelers}
          />

          <StatCard
            label="Budget"
            value={formatINR(parsed.budget)}
          />
        </div>
      </section>

      {/* ========================================================
          DESTINATION CAROUSEL
      ======================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 pt-6">
          <p className="text-sm font-semibold text-indigo-600">
            Explore
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {parsed.destination || "Your destination"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A visual preview of your destination
          </p>
        </div>

        <div className="mt-2">
          <CircularCarousel
            items={[
              {
                src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
                alt: "Beach destination",
                title: parsed.destination || "Destination",
                subtitle: "Beaches & relaxation",
              },
              {
                src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
                alt: "Travel landscape",
                title: "Explore",
                subtitle: "Scenic experiences",
              },
              {
                src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
                alt: "Mountain landscape",
                title: "Adventure",
                subtitle: "Nature & exploration",
              },
              {
                src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
                alt: "Scenic landscape",
                title: "Discover",
                subtitle: "Local experiences",
              },
              {
                src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
                alt: "City travel",
                title: "City life",
                subtitle: "Food & culture",
              },
              {
                src: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=900&q=80",
                alt: "Travel experience",
                title: "Experience",
                subtitle: "Memorable moments",
              },
            ]}
            preset="cylinder"
            cardWidth={240}
            aspectRatio={1}
            gap={25}
            autoplay="drift"
            speed={10}
            draggable={true}
            pauseOnHover={true}
            focusOnClick={true}
            captions={true}
            className="min-h-[520px]"
          />
        </div>
      </section>

      {/* ========================================================
          DAILY ITINERARY — REAL HTML TABLE
      ======================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold text-indigo-600">
            Your plan
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Daily Itinerary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your complete day-by-day travel plan
          </p>
        </div>

        {parsed.days.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-sm font-bold text-slate-700">
                    Day
                  </th>

                  <th className="px-5 py-4 text-sm font-bold text-slate-700">
                    Morning
                  </th>

                  <th className="px-5 py-4 text-sm font-bold text-slate-700">
                    Afternoon
                  </th>

                  <th className="px-5 py-4 text-sm font-bold text-slate-700">
                    Evening
                  </th>

                  <th className="px-5 py-4 text-sm font-bold text-slate-700">
                    Estimated Cost
                  </th>
                </tr>
              </thead>

              <tbody>
                {parsed.days.map((day) => (
                  <tr
                    key={day.day}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-5 py-5 align-top">
                      <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                        Day {day.day}
                      </span>
                    </td>

                    <td className="px-5 py-5 align-top text-sm leading-6 text-slate-600">
                      {day.morning || "—"}
                    </td>

                    <td className="px-5 py-5 align-top text-sm leading-6 text-slate-600">
                      {day.afternoon || "—"}
                    </td>

                    <td className="px-5 py-5 align-top text-sm leading-6 text-slate-600">
                      {day.evening || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-5 align-top text-sm font-semibold text-slate-800">
                      {formatINR(day.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-800">
              No daily itinerary could be parsed from the response.
            </p>

            <p className="mt-1 text-sm text-amber-700">
              The planner returned a format that could not be displayed.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================
          BUDGET SUMMARY
      ======================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold text-indigo-600">
            Cost breakdown
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Budget Summary
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  Accommodation
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                  {formatINR(parsed.accommodation)}
                </td>
              </tr>

              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  Food
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                  {formatINR(parsed.food)}
                </td>
              </tr>

              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  Transport
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                  {formatINR(parsed.transport)}
                </td>
              </tr>

              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  Activities
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                  {formatINR(parsed.activities)}
                </td>
              </tr>

              <tr className="border-b border-slate-100 bg-slate-50">
                <td className="px-5 py-4 text-sm font-bold text-slate-800">
                  Total
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                  {formatINR(parsed.total)}
                </td>
              </tr>

              <tr>
                <td className="px-5 py-4 text-sm font-bold text-emerald-700">
                  Remaining
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-emerald-700">
                  {formatINR(parsed.remaining)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================
          NOTES
      ======================================================== */}

      {parsed.notes.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-indigo-600">
            Helpful tips
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Notes
          </h2>

          <div className="mt-4 space-y-3">
            {parsed.notes.map((note, index) => (
              <div
                key={index}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
              >
                {note}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}