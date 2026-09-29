"use client";

import { useState } from "react";

interface ChatBoxProps {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatBox({
  onSend,
  loading,
}: ChatBoxProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = message.trim();

    if (!trimmed || loading) return;

    onSend(trimmed);
    setMessage("");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="mb-3 text-sm font-semibold text-slate-700">
        Refine your trip
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something about this trip..."
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Make it cheaper",
          "Add one more day",
          "Add more adventure activities",
        ].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={loading}
            onClick={() => onSend(suggestion)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}