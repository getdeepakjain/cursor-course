import { CardIcon, InfoIcon } from "./icons";

type Props = {
  usageDisplay: number;
  planLimit: number;
  usagePct: number;
};

/** Marketing-style plan card + aggregate usage bar (demo cap). */
export function PlanUsageBanner({ usageDisplay, planLimit, usagePct }: Props) {
  return (
    <div className="mt-8 px-8">
      <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] p-6 text-white shadow-lg shadow-violet-200/50">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Current plan</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">Developer</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <CardIcon />
            Manage plan
          </button>
        </div>
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span>API limit</span>
            <InfoIcon />
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${usagePct}%` }} />
          </div>
          <p className="mt-2 text-sm text-white/85">
            {usageDisplay.toLocaleString()} / {planLimit.toLocaleString()} requests
          </p>
        </div>
      </div>
    </div>
  );
}
