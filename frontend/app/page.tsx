"use client";

import { useState } from "react";
import TripForm from "@/components/TripForm";
import AgentSteps from "@/components/AgentSteps";
import Itinerary from "@/components/Itinerary";
import { planTrip } from "@/lib/api";
import ChatBox from "@/components/ChatBox";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(message: string) {
    setLoading(true);
    setError(null);
    setItinerary(null);
    setSteps([]);

    try {
      const result = await planTrip(message);
      setSteps(result.steps);
      setItinerary(result.itinerary);
    } catch (err: any) {
      setError(
        err.message ||
        "Something went wrong while planning your trip."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleChat(message: string) {
    setLoading(true);
    setError(null);
    setSteps([]);

    try {
      const result = await planTrip(message);
      setSteps(result.steps);
      setItinerary(result.itinerary);
    } catch (err: any) {
      setError(
        err.message ||
        "Something went wrong while updating your trip."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg text-white shadow-lg">
              ✈
            </div>

            <div>
              <div className="text-base font-bold tracking-tight text-slate-900">
                TravelAI
              </div>
              <div className="text-[11px] text-slate-500">
                Agentic Travel Planner
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Travel Agent Online
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-4xl pb-10 pt-16 text-center sm:pt-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
            <span>✦</span>
            Plan smarter. Travel better.
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
            Your next trip,
            <span className="block bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              planned by AI.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Tell us where you want to go, your budget, and what you love.
            Our AI travel agent builds a personalized itinerary for you.
          </p>
        </section>

        {/* Main planner */}
        <section className="mx-auto max-w-4xl">
          <TripForm onSubmit={handleSubmit} loading={loading} />

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  !
                </div>

                <div>
                  <p className="font-semibold text-red-800">
                    Unable to plan your trip
                  </p>
                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Agent activity */}
          <AgentSteps steps={steps} loading={loading} />

          {/* Result */}
          {itinerary && (
            <div className="mt-6 space-y-4">
              <Itinerary itinerary={itinerary} />

              <ChatBox
                onSend={handleChat}
                loading={loading}
              />
            </div>
          )}
        </section>

        {/* Feature cards */}
        {!loading && !itinerary && (
          <section className="mx-auto mt-12 max-w-4xl pb-12">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <div className="mb-3 text-2xl">🧭</div>
                <h3 className="font-bold text-slate-900">
                  Personalized
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Plans built around your destination, interests, travelers,
                  and budget.
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <div className="mb-3 text-2xl">☀️</div>
                <h3 className="font-bold text-slate-900">
                  Weather-aware
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Weather information is considered while preparing your
                  travel plan.
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <div className="mb-3 text-2xl">💰</div>
                <h3 className="font-bold text-slate-900">
                  Budget-conscious
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Get an estimated plan based on the budget you provide.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200/70 py-6 text-center">
          <p className="text-xs text-slate-400">
            Powered by an agentic AI travel planning workflow
          </p>
        </footer>
      </div>
    </main>
  );
}