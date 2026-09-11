import { useId } from "react";
import { cn } from "../utils/cn";

type Tone = "primary" | "secondary" | "success" | "warning" | "danger";

const strokes: Record<Tone, string> = {
  primary: "#a78bfa",
  secondary: "#f472b6",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#fb7185",
};

/* Sparkline — a quiet trend line, no gridlines, no decoration */
export function Sparkline({
  data,
  tone = "primary",
  className,
  height = 40,
}: {
  data: number[];
  tone?: Tone;
  className?: string;
  height?: number;
}) {
  const id = useId();
  const w = 120;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - 4 - ((v - min) / span) * (height - 8);
    return [x, y] as const;
  });
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${height} L0,${height} Z`;
  const stroke = strokes[tone];

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-10 w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Columns — a column chart that fills the height it is given.

   The root is `flex-1`, so when it sits inside a card that has been
   stretched by a taller sibling the plot grows to meet the card's
   bottom edge instead of leaving dead space. Bars are absolutely
   positioned with percentage heights, so they always resolve against
   the plot area regardless of how the card's height was determined.
------------------------------------------------------------------- */
export function Columns({
  data,
  label,
  format = (n) => `${n}`,
  formatTick = format,
  className,
  dark = false,
}: {
  data: { label: string; value: number }[];
  label: string;
  /** Formats the value revealed on hover/focus */
  format?: (n: number) => string;
  /** Formats the axis ticks (defaults to `format`) */
  formatTick?: (n: number) => string;
  className?: string;
  /** On the dark hero panel: white bars, yellow peak — the landing page's chart idiom */
  dark?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0]);
  const c = dark
    ? {
        tick: "text-ink-500",
        guide: "border-white/[0.06]",
        base: "border-white/20",
        value: "text-white",
        bar: "bg-gradient-to-t from-primary-500/70 to-brand-glow/80 group-hover:from-primary-500 group-hover:to-brand-glow group-focus-visible:from-primary-500 group-focus-visible:to-brand-glow",
        peakBar: "bg-gradient-to-t from-primary-500 to-brand-glow shadow-[0_0_24px_rgba(167,139,250,0.45)]",
        xLabel: "text-ink-500",
      }
    : {
        tick: "text-ink-400",
        guide: "border-line-soft",
        base: "border-line",
        value: "text-ink",
        bar: "bg-primary-500/55 group-hover:bg-primary-500 group-focus-visible:bg-primary-500",
        peakBar: "bg-primary-500",
        xLabel: "text-ink-500",
      };
  // Round the axis ceiling up to a "nice" half-magnitude (1,480 → 1,500)
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const unit = magnitude / 2;
  const ceiling = Math.max(unit, Math.ceil(max / unit) * unit);
  const ticks = [ceiling, ceiling / 2, 0];
  const pct = (v: number) => (v / ceiling) * 100;

  return (
    <div
      role="list"
      aria-label={label}
      className={cn("flex min-h-[200px] flex-1 flex-col", className)}
    >
      {/* Plot */}
      <div className="flex flex-1 gap-2 sm:gap-3">
        {/* Y axis */}
        <div className="relative w-10 shrink-0 sm:w-12" aria-hidden="true">
          {ticks.map((t) => (
            <span
              key={t}
              className={cn("num absolute right-0 -translate-y-1/2 text-[10px] sm:text-[11px]", c.tick)}
              style={{ top: `${100 - pct(t)}%` }}
            >
              {t === 0 ? "0" : formatTick(t)}
            </span>
          ))}
        </div>

        <div className="relative flex flex-1 gap-1.5 sm:gap-3">
          {/* Guides */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {ticks.map((t) => (
              <div
                key={t}
                className={cn("absolute inset-x-0 border-t", t === 0 ? c.base : c.guide)}
                style={{ top: `${100 - pct(t)}%` }}
              />
            ))}
          </div>

          {data.map((d) => {
            const h = pct(d.value);
            return (
              <div
                key={d.label}
                role="listitem"
                tabIndex={0}
                aria-label={`${d.label}: ${format(d.value)}`}
                className="group relative min-w-0 flex-1 rounded-t-md"
              >
                <span
                  className={cn(
                    "num pointer-events-none absolute inset-x-0 mb-2 truncate text-center text-[11px] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                    c.value,
                    // The peak is labelled permanently on the dark panel, like the landing page's marker
                    dark && d === peak ? "opacity-100" : "opacity-0",
                  )}
                  style={{ bottom: `${h}%` }}
                  aria-hidden="true"
                >
                  {format(d.value)}
                </span>
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 rounded-t-lg transition-colors",
                    d === peak ? c.peakBar : c.bar,
                  )}
                  style={{ height: `${h}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X labels — same column structure as the plot so they stay aligned */}
      <div className="mt-3 flex gap-2 sm:gap-3" aria-hidden="true">
        <div className="w-10 shrink-0 sm:w-12" />
        <div className="flex flex-1 gap-1.5 sm:gap-3">
          {data.map((d) => (
            <span
              key={d.label}
              className={cn("min-w-0 flex-1 truncate text-center text-[12px]", c.xLabel)}
            >
              <span className="hidden sm:inline">{d.label}</span>
              <span className="sm:hidden">{d.label.charAt(0)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Channel share — whitespace-first bar list instead of a pie chart */
export function BarList({
  items,
  total,
  format = (n) => `${n}`,
}: {
  items: { label: string; value: number; delta: number; dot: string }[];
  total: number;
  format?: (n: number) => string;
}) {
  return (
    <ul className="divide-y divide-line-soft">
      {items.map((i) => {
        const pct = (i.value / total) * 100;
        return (
          <li key={i.label} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <span className={cn("size-2 shrink-0 rounded-full", i.dot)} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[14px] text-ink-700">{i.label}</span>
            <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-line-soft sm:block">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="num w-20 text-right text-[14px] text-ink">{format(i.value)}</span>
            <span
              className={cn(
                "num w-14 text-right text-[12px]",
                i.delta >= 0 ? "text-success" : "text-danger",
              )}
            >
              {i.delta >= 0 ? "+" : ""}
              {i.delta.toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
