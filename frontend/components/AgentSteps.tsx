interface AgentStepsProps {
  steps: string[];
  loading: boolean;
}

export default function AgentSteps({
  steps,
  loading,
}: AgentStepsProps) {
  if (steps.length === 0 && !loading) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            ✦
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              AI Agent Activity
            </h2>
            <p className="text-xs text-slate-400">
              Preparing your personalized journey
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
            Working
          </div>
        )}

        {!loading && steps.length > 0 && (
          <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
            Complete
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="p-5 sm:p-6">
        <div className="relative space-y-0">
          {steps.map((step, i) => (
            <div key={`${step}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-emerald-200" />
              )}

              {/* Number/check */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 ring-4 ring-white">
                ✓
              </div>

              <div className="pt-1">
                <p className="text-sm font-medium text-slate-700">
                  {step}
                </p>
                <p className="mt-0.5 text-xs text-emerald-600">
                  Completed
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="relative flex gap-4">
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 ring-4 ring-white">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              </div>

              <div className="pt-1">
                <p className="text-sm font-medium text-slate-600">
                  AI agent is coordinating your trip...
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}