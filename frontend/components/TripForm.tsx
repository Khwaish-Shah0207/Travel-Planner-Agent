// ANTIGRAVITY WRITE TEST
"use client";

import { useState } from "react";

interface TripFormProps {
  onSubmit: (message: string) => void;
  loading: boolean;
}

export default function TripForm({
  onSubmit,
  loading,
}: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");

  const [freeText, setFreeText] = useState("");

  function buildMessageFromFields(): string | null {
    if (
      !destination &&
      !days &&
      !travelers &&
      !budget &&
      !interests
    ) {
      return null;
    }

    const parts: string[] = [];

    parts.push(
      `Plan a ${days || "3"} day trip to ${
        destination || "a destination of your choice"
      }`
    );

    parts.push(`for ${travelers || "1"} people`);

    if (budget) {
      parts.push(`under ₹${budget}`);
    }

    if (interests) {
      parts.push(`. I like ${interests}.`);
    }

    return parts.join(" ");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fromFields = buildMessageFromFields();
    const message = fromFields || freeText;

    if (!message.trim()) return;

    onSubmit(message.trim());
  }

  function useExample() {
    setDestination("Goa");
    setDays("3");
    setTravelers("2");
    setBudget("20000");
    setInterests("beaches, cafes, adventure");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur"
    >
      {/* Form header */}
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Build your trip
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Where are you going?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Give the agent a few details or simply describe your dream trip.
            </p>
          </div>

          <button
            type="button"
            onClick={useExample}
            className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 sm:block"
          >
            Use example
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        {/* Structured fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Destination */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Destination
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                📍
              </span>

              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa, Paris, Tokyo..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* Days */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Trip duration
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                📅
              </span>

              <input
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="3"
                type="number"
                min={1}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                days
              </span>
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Travelers
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                👥
              </span>

              <input
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                placeholder="2"
                type="number"
                min={1}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                people
              </span>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Budget
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                ₹
              </span>

              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="20000"
                type="number"
                min={0}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Interests
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                ✨
              </span>

              <input
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="beaches, food, museums..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            or describe it naturally
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Free text */}
        <div>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={4}
            placeholder="Plan a 3 day trip to Goa for 2 people under ₹20,000. I like beaches, cafes and adventure activities."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />

          <p className="mt-2 text-xs text-slate-400">
            You can mention destinations, dates, budget, interests, travel
            style, or anything else you care about.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-900/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Building your itinerary...
            </>
          ) : (
            <>
              <span>✦</span>
              Plan My Trip
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}