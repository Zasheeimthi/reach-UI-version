import * as React from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Coins,
  Eye,
  Layers,
  MoreVertical,
  MousePointerClick,
  Plus,
  RefreshCw,
  Search,
  Target,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Badge, Button, Card, CardHeader, Menu, Select } from "../components/ui";
import { Columns, Sparkline } from "../components/charts";
import PlatformMark from "../components/PlatformMark";
import { dailySpend, type Channel } from "../lib/data";

/* ------------------------------------------------------------------- Data */
type Platform = "All" | "Google" | "Meta" | "X" | "Reddit" | "TikTok" | "Microsoft Ads";
type Status = "Draft" | "Failed" | "Active" | "Paused";

const platformChannel: Record<Exclude<Platform, "All">, Channel> = {
  Google: "google",
  Meta: "meta",
  X: "x",
  Reddit: "reddit",
  TikTok: "tiktok",
  "Microsoft Ads": "microsoft",
};

const platforms: { value: Platform; label: string; icon: React.ReactNode }[] = [
  { value: "All", label: "All", icon: <Layers className="size-3.5 text-ink-400" aria-hidden="true" /> },
  ...(Object.keys(platformChannel) as Exclude<Platform, "All">[]).map((p) => ({
    value: p,
    label: p,
    icon: <PlatformMark channel={platformChannel[p]} size={14} />,
  })),
];

const ranges = ["7 days", "30 days", "90 days", "12 months", "Custom"] as const;
type Range = (typeof ranges)[number];
const rangeDays: Record<Range, number> = {
  "7 days": 7,
  "30 days": 30,
  "90 days": 90,
  "12 months": 365,
  Custom: 30,
};
const rangeOptions = ranges.map((r) => ({ value: r, label: r }));

/* Astra metric cards: icon badge · label · white figure · delta pill · trend.
   Trend series are illustrative until the platform sync provides history. */
const trend = (seed: number) =>
  Array.from({ length: 14 }, (_, i) => 50 + 26 * Math.sin((i + seed) / 2.1) + i * 1.6);
const metrics: {
  label: string;
  value: string;
  delta: number;
  icon: React.ReactNode;
  series: number[];
  invert?: boolean;
}[] = [
  { label: "Cost", value: "kr3,767.07", delta: 12.4, icon: <Coins className="size-4" />, series: trend(1) },
  { label: "Impressions", value: "154.7k", delta: 8.1, icon: <Eye className="size-4" />, series: trend(4) },
  { label: "Conversions", value: "1.3k", delta: 3.2, icon: <Target className="size-4" />, series: trend(7) },
  // Lower CPC is good, so the sign is inverted for colouring
  { label: "Avg. CPC", value: "kr0.97", delta: -0.6, icon: <MousePointerClick className="size-4" />, series: trend(10).reverse(), invert: true },
];

const kr = (n: number) => `kr${Math.round(n).toLocaleString("en-US")}`;
const krCompact = (n: number) =>
  n >= 1000 ? `kr${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `kr${n}`;
const iso = (d: Date) => d.toISOString().slice(0, 10);

const weekSpend = dailySpend.map((d) => ({ label: d.day, value: d.spend }));
const weekTotal = weekSpend.reduce((sum, d) => sum + d.value, 0);
const weekPeak = weekSpend.reduce((best, d) => (d.value > best.value ? d : best), weekSpend[0]);

const attentionItems: {
  level: "danger" | "warning";
  tag: string;
  channel: string;
  name: string;
  reason: string;
  action: string;
}[] = [
  {
    level: "danger",
    tag: "Blocked",
    channel: "Google Ads",
    name: "The South Indian Campaign",
    reason: "Publishing failed — Google reported a billing issue. Add a payment method to retry.",
    action: "Fix billing",
  },
  {
    level: "warning",
    tag: "Watch",
    channel: "Reddit",
    name: "r/food AMA Boost",
    reason: "In Reddit ad policy review for 1 day. No action needed yet.",
    action: "View status",
  },
  {
    level: "warning",
    tag: "Watch",
    channel: "Google Ads",
    name: "The South Indian Campaign",
    reason: "Paused 1 day ago. Resume to keep pacing on the daily budget.",
    action: "Resume",
  },
];

const recentCampaigns: {
  name: string;
  status: Status;
  platform: Exclude<Platform, "All">;
  start: string;
  budget: string;
  ctr: string;
  ctrValue: number;
}[] = [
  { name: "Artomic", status: "Draft", platform: "Microsoft Ads", start: "Sep 09, 2026", budget: "kr100/day", ctr: "-", ctrValue: 0 },
  { name: "The South Indian Campaign · 2026-09-07 07:39:58 UTC · 54cc86", status: "Failed", platform: "Google", start: "Sep 07, 2026", budget: "kr100/day", ctr: "3.8%", ctrValue: 55 },
  { name: "The South Indian Campaign · 2026-09-05 07:10:10 UTC · 317516", status: "Active", platform: "Google", start: "Sep 05, 2026", budget: "kr10/day", ctr: "6.9%", ctrValue: 96 },
  { name: "The South Indian Campaign · 2026-09-04 17:20:49 UTC · d6bad7", status: "Paused", platform: "Google", start: "Sep 04, 2026", budget: "kr100/day", ctr: "2.0%", ctrValue: 30 },
  { name: "The South Indian Campaign Live · 2026-09-04 08:50:58 UTC · 4cc950", status: "Paused", platform: "Google", start: "Sep 04, 2026", budget: "kr100/day", ctr: "1.4%", ctrValue: 20 },
  { name: "The South Indian Campaign", status: "Paused", platform: "Google", start: "Sep 03, 2026", budget: "kr100/day", ctr: "-", ctrValue: 0 },
  { name: "Super Sales Campaign", status: "Paused", platform: "Google", start: "Sep 03, 2026", budget: "kr100/day", ctr: "2.1%", ctrValue: 32 },
  { name: "South Indian Sea Food Fest", status: "Paused", platform: "Google", start: "Sep 03, 2026", budget: "kr100/day", ctr: "-", ctrValue: 0 },
  { name: "Aug Sale", status: "Draft", platform: "Google", start: "Sep 02, 2026", budget: "kr100/day", ctr: "-", ctrValue: 0 },
  { name: "Authentic Indian Restaurant", status: "Active", platform: "Google", start: "Jul 31, 2026", budget: "kr81.6/day", ctr: "2.3%", ctrValue: 35 },
];

const statusTone: Record<Status, "neutral" | "danger" | "success" | "warning"> = {
  Draft: "neutral",
  Failed: "danger",
  Active: "success",
  Paused: "warning",
};
const platformLabel = (p: Platform) => (p === "Google" ? "Google Ads" : p);

/* ------------------------------------------------------------- Chip group
   Compact segmented chips (36px visual). `hit-44` extends the pointer /
   touch target to 44px so density never costs accessibility.            */
function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  tone = "neutral",
}: {
  label: string;
  options: readonly { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  tone?: "neutral" | "primary";
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap gap-0.5 rounded-full border border-line bg-canvas p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "hit-44 inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-[12px] whitespace-nowrap transition-colors",
              active
                ? tone === "primary"
                  ? "bg-primary-50 text-primary-700"
                  : "bg-primary-100 text-primary-700"
                : "text-ink-500 hover:text-ink",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------- Page */
export default function OverviewPage({
  onNavigate,
  toast,
}: {
  onNavigate: (r: "campaigns" | "new-campaign" | "analytics") => void;
  toast: (m: string, t?: "success" | "danger" | "info") => void;
}) {
  const [performancePlatform, setPerformancePlatform] = React.useState<Platform>("All");
  const [campaignPlatform, setCampaignPlatform] = React.useState<Platform>("All");
  const [range, setRange] = React.useState<Range>("30 days");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"All" | Status>("All");
  const [refreshing, setRefreshing] = React.useState(false);

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      toast("Platform data is up to date");
    }, 700);
  };

  const rangeEnd = new Date("2026-09-11T00:00:00Z");
  const rangeStart = new Date(rangeEnd);
  rangeStart.setUTCDate(rangeEnd.getUTCDate() - rangeDays[range]);

  const isFiltered = campaignPlatform !== "All" || status !== "All" || query.trim() !== "";
  const filtered = recentCampaigns.filter((c) => {
    const platformMatch = campaignPlatform === "All" || c.platform === campaignPlatform;
    const statusMatch = status === "All" || c.status === status;
    return platformMatch && statusMatch && c.name.toLowerCase().includes(query.toLowerCase());
  });

  const refreshIcon = <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="overview-welcome flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">Good afternoon, Admin</h1>
          <p className="mt-1 max-w-xl text-[14px] text-ink-500">Here’s how your campaigns are performing across spend, reach and results this month.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Date range lives with the data it scopes, not in the global header */}
          <Menu
            align="right"
            items={ranges.map((r) => ({ label: r, onSelect: () => setRange(r) }))}
            trigger={({ open, toggle }) => (
              <Button
                variant="outline"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Date range: last ${range}`}
                className="w-full sm:w-auto"
              >
                <CalendarDays className="size-4" aria-hidden="true" />
                Last {range}
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </Button>
            )}
          />
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => onNavigate("new-campaign")} className="w-full sm:w-auto">
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Platform performance — one padded block, no internal dividers */}
      <Card className="px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-ink">Platform performance</h2>
            <p className="mt-0.5 text-[12px] text-ink-500">
              Choose All for a consolidated view, or pick a platform and time range. Use Modify
              metrics to customize which metrics appear.
            </p>
          </div>
          <Button size="sm" variant="secondary" icon={refreshIcon} onClick={refresh}>
            Refresh from platform
          </Button>
        </div>

        <div className="mt-4">
          <ChipGroup
            label="Platform"
            options={platforms}
            value={performancePlatform}
            onChange={setPerformancePlatform}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <ChipGroup
              label="Time range"
              options={rangeOptions}
              value={range}
              onChange={setRange}
              tone="primary"
            />
            <p className="num mt-3 text-[12px] text-ink-700">
              {iso(rangeStart)} – {iso(rangeEnd)} ({range})
            </p>
            <p className="text-[12px] text-ink-500">
              Showing synced campaign data ·{" "}
              {performancePlatform === "All" ? "all platforms" : platformLabel(performancePlatform)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<BarChart3 className="size-3.5" />}
              onClick={() => toast("Metric controls opened", "info")}
            >
              Modify metrics
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("analytics")}>
              View more
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Metric cards */}
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => {
            const good = m.invert ? m.delta <= 0 : m.delta >= 0;
            return (
              <div
                key={m.label}
                className="metric-card overflow-hidden rounded-xl border border-line bg-surface-soft"
              >
                <div className="px-5 pt-5">
                  <dt className="flex items-center gap-3 text-[14px] text-ink-700">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      {m.icon}
                    </span>
                    {m.label}
                  </dt>
                  <dd className="num mt-3 text-[28px] leading-none font-semibold text-ink">{m.value}</dd>
                  <dd className="mt-3 flex items-center justify-between gap-3 text-[12px]">
                    <span
                      className={cn(
                        "num inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                        good ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                      )}
                    >
                      {m.delta >= 0 ? (
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      ) : (
                        <ArrowDownRight className="size-3" aria-hidden="true" />
                      )}
                      {Math.abs(m.delta).toFixed(1)}%
                    </span>
                    <span className="text-ink-500">vs last {range === "7 days" ? "week" : "month"}</span>
                  </dd>
                </div>
                <Sparkline data={m.series} height={44} className="mt-3 h-11" />
              </div>
            );
          })}
        </dl>

        {/* Spend by platform — nested, not a separate card */}
        <div className="mt-4 rounded-2xl border border-line bg-surface-soft px-4 py-3">
          <h3 className="text-[14px] font-medium text-ink">Spend by platform</h3>
          <p className="text-[12px] text-ink-500">Consolidated results across your connected channels</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
            <PlatformMark channel="google" size={16} />
            <span className="text-ink">Google Ads</span>
            <span className="num ml-auto text-ink-700">kr3,767.07</span>
            <span className="num text-ink-500">3,886 clicks</span>
          </div>
          <div
            role="progressbar"
            aria-label="Google Ads share of spend"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft"
          >
            <div className="progress-fill h-full w-full rounded-full bg-gradient-to-r from-primary-500 to-brand-glow" />
          </div>
        </div>
      </Card>

      {/* Spend this week + Needs attention */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader
            className="py-3"
            title="Spend this week"
            description="Daily delivery across every connected channel."
            action={
              <Button size="sm" variant="ghost" onClick={() => onNavigate("analytics")}>
                Analytics
                <ArrowRight className="size-3.5" />
              </Button>
            }
          />
          <dl className="grid grid-cols-1 border-b border-line sm:grid-cols-3">
            {[
              ["Total this week", kr(weekTotal)],
              ["Daily average", kr(weekTotal / weekSpend.length)],
              ["Peak day", `${weekPeak.label} · ${kr(weekPeak.value)}`],
            ].map(([term, value], i) => (
              <div key={term} className={cn("px-4 py-3 sm:px-6", i > 0 && "border-t border-line sm:border-t-0 sm:border-l")}>
                <dt className="text-[12px] text-ink-500">{term}</dt>
                <dd className="num mt-0.5 truncate text-[16px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {/* The one focal chart sits on the landing page's dark hero panel */}
          <div className="flex flex-1 flex-col p-4">
            <div className="panel-dark flex flex-1 flex-col rounded-xl px-5 pt-6 pb-4">
              <Columns
                data={weekSpend}
                label="Spend per day this week"
                format={kr}
                formatTick={krCompact}
                dark
              />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="py-3" title="Needs attention" description="Ranked by impact on delivery." />
          <ul className="divide-y divide-line-soft px-6">
            {attentionItems.map((item, i) => (
              <li key={`${item.name}-${i}`} className="py-3">
                <div className="flex items-center gap-3">
                  <Badge tone={item.level}>{item.tag}</Badge>
                  <span className="truncate text-[12px] text-ink-500">{item.channel}</span>
                </div>
                <p className="mt-2 truncate text-[14px] text-ink">{item.name}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{item.reason}</p>
                <Button
                  size="sm"
                  variant={item.level === "danger" ? "outline" : "ghost"}
                  className="-ml-3 mt-1"
                  onClick={() =>
                    toast(
                      item.action === "Resume"
                        ? `${item.name} resumed`
                        : `${item.action} opened for ${item.name}`,
                      item.action === "Resume" ? "success" : "info",
                    )
                  }
                >
                  {item.action}
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-line px-6 py-2">
            <Button size="sm" variant="ghost" className="-ml-3" onClick={() => onNavigate("campaigns")}>
              View all alerts
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent campaigns */}
      <Card>
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-ink">Recent Campaigns</h2>
            <div className="mt-3">
              <ChipGroup
                label="Campaign platform"
                options={platforms}
                value={campaignPlatform}
                onChange={setCampaignPlatform}
              />
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as "All" | Status)}
                aria-label="Filter by status"
                className="sm:w-44"
              >
                <option value="All">All statuses</option>
                {(["Draft", "Failed", "Active", "Paused"] as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <label className="relative block sm:w-64">
                <span className="sr-only">Filter campaigns</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter campaigns…"
                  className="min-h-11 w-full rounded-full border border-line bg-surface-soft pr-4 pl-10 text-[16px] text-ink outline-none placeholder:text-ink-400 hover:border-ink-400 focus:border-primary-500 sm:text-[14px]"
                />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" icon={refreshIcon} onClick={refresh}>
              Refresh from platform
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("campaigns")}>
              Campaigns
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-line">
          <table className="w-full border-collapse text-left lg:min-w-[900px]">
            <thead className="text-[12px] tracking-[0.06em] text-ink-500 uppercase">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-normal sm:px-6">Status</th>
                <th className="px-4 py-3 font-normal">Campaign name</th>
                <th className="hidden px-4 py-3 font-normal md:table-cell">Start date</th>
                <th className="hidden px-4 py-3 font-normal md:table-cell">Budget</th>
                <th className="hidden px-4 py-3 font-normal lg:table-cell">CTR</th>
                <th className="px-4 py-3 text-right font-normal sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={`${c.name}-${c.start}`}
                  className="border-b border-line-soft transition-colors last:border-0 hover:bg-line-soft/60"
                >
                  <td className="px-4 py-3 sm:px-6">
                    <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="w-full max-w-0 px-4 py-3">
                    <button
                      onClick={() => toast(`${c.name} opened`, "info")}
                      className="block w-full max-w-[520px] text-left text-[14px] text-ink hover:text-primary-600"
                    >
                      <span className="block truncate">{c.name}</span>
                      <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[12px] text-ink-500">
                        <PlatformMark channel={platformChannel[c.platform]} size={12} />
                        {platformLabel(c.platform)}
                      </span>
                    </button>
                  </td>
                  <td className="num hidden px-4 py-3 text-[12px] text-ink-500 md:table-cell">{c.start}</td>
                  <td className="num hidden px-4 py-3 text-[12px] text-ink md:table-cell">{c.budget}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="num w-9 text-[12px] text-ink">{c.ctr}</span>
                      {c.ctrValue > 0 && (
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
                          <span
                            className="progress-fill block h-full rounded-full bg-primary-500"
                            style={{ width: `${c.ctrValue}%` }}
                          />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-6">
                    <button
                      onClick={() => toast(`Actions opened for ${c.name}`, "info")}
                      className="inline-flex size-11 items-center justify-center rounded-full text-ink-500 hover:bg-primary-50 hover:text-ink"
                      aria-label={`Actions for ${c.name}`}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-[14px] text-ink">No campaigns found</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setQuery("");
                  setStatus("All");
                  setCampaignPlatform("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-line px-4 py-3 text-[12px] text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            {isFiltered
              ? `${filtered.length} of ${recentCampaigns.length} on this page match`
              : `Showing 1 to ${recentCampaigns.length} of 17 results`}
          </span>
          <nav aria-label="Pagination" className="flex items-center gap-1">
            <button
              className="hit-44 flex size-9 items-center justify-center rounded-full bg-primary-500 text-white"
              aria-current="page"
            >
              1
            </button>
            <button
              className="hit-44 flex size-9 items-center justify-center rounded-full hover:bg-primary-50"
              onClick={() => toast("Page 2 is loading", "info")}
            >
              2
            </button>
            <button
              className="hit-44 flex size-9 items-center justify-center rounded-full hover:bg-primary-50"
              aria-label="Next page"
              onClick={() => toast("Page 2 is loading", "info")}
            >
              <ArrowRight className="size-3.5" />
            </button>
          </nav>
        </div>
      </Card>
    </div>
  );
}
