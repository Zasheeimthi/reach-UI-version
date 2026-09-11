/* ------------------------------------------------------------------
   Reach — workspace data.
   Currency is Swedish krona (kr). Google totals across these campaigns
   tie out with the dashboard's Platform performance strip:
   kr3,767.07 cost · 154.7k impressions · 1.3k conversions · kr0.97 CPC.
------------------------------------------------------------------- */
export type Channel = "google" | "meta" | "x" | "reddit" | "tiktok" | "microsoft";
export type Status =
  | "active"
  | "draft"
  | "in_review"
  | "paused"
  | "failed"
  | "completed"
  | "archived";

export type Campaign = {
  id: string;
  name: string;
  channel: Channel;
  objective: string;
  /** Campaign subtype shown as a chip, e.g. "Performance Max" */
  type?: string;
  status: Status;
  dailyBudget: number;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate: string | null;
  ads: number;
  owner: string;
  updated: string;
  trend: number[];
  note?: string;
};

export const channels: Record<Channel, { label: string; short: string; dot: string }> = {
  google: { label: "Google Ads", short: "Google", dot: "bg-blue-400" },
  meta: { label: "Meta Ads", short: "Meta", dot: "bg-sky-300" },
  x: { label: "X Ads", short: "X", dot: "bg-ink" },
  reddit: { label: "Reddit Ads", short: "Reddit", dot: "bg-orange-500" },
  tiktok: { label: "TikTok Ads", short: "TikTok", dot: "bg-ink-700" },
  microsoft: { label: "Microsoft Ads", short: "Microsoft Ads", dot: "bg-teal-500" },
};

export const statusMeta: Record<
  Status,
  { label: string; tone: "success" | "warning" | "danger" | "neutral" | "primary" }
> = {
  active: { label: "Active", tone: "success" },
  draft: { label: "Draft", tone: "neutral" },
  in_review: { label: "In review", tone: "primary" },
  paused: { label: "Paused", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  completed: { label: "Completed", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};

const t = (seed: number, n = 12) =>
  Array.from({ length: n }, (_, i) =>
    Math.round(40 + 34 * Math.sin((seed + i) / 1.7) + (i * 3.4 + seed * 2)),
  );
const flat = Array.from({ length: 12 }, () => 0);

const BILLING_NOTE =
  "Publishing failed — Google reported a billing issue. Add a payment method to retry.";

export const campaigns: Campaign[] = [
  {
    id: "cmp_a1f0",
    name: "Audience Retargeting – Stockholm",
    channel: "microsoft",
    objective: "Traffic",
    status: "paused",
    dailyBudget: 2000,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-09",
    endDate: null,
    ads: 2,
    owner: "Admin",
    updated: "2 h ago",
    trend: flat,
  },
  {
    id: "cmp_b2c4",
    name: "Kompensa – Autumn Offer",
    channel: "microsoft",
    objective: "Traffic",
    status: "active",
    dailyBudget: 552.05,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-09",
    endDate: null,
    ads: 3,
    owner: "Admin",
    updated: "3 h ago",
    trend: flat,
    note: "Launched today. First delivery data syncs from Microsoft within 24 h.",
  },
  {
    id: "cmp_c3d8",
    name: "Reach Ad Test",
    channel: "microsoft",
    objective: "Traffic",
    status: "paused",
    dailyBudget: 200.74,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-09",
    endDate: null,
    ads: 1,
    owner: "Admin",
    updated: "3 h ago",
    trend: flat,
  },
  {
    id: "cmp_d4e2",
    name: "Suvai",
    channel: "microsoft",
    objective: "Traffic",
    status: "active",
    dailyBudget: 1003.72,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-09",
    endDate: null,
    ads: 2,
    owner: "Admin",
    updated: "4 h ago",
    trend: flat,
    note: "Launched today. First delivery data syncs from Microsoft within 24 h.",
  },
  {
    id: "cmp_e5f6",
    name: "Artomic",
    channel: "microsoft",
    objective: "Sales",
    type: "Performance Max",
    status: "draft",
    dailyBudget: 100,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-09",
    endDate: null,
    ads: 0,
    owner: "Admin",
    updated: "5 h ago",
    trend: flat,
    note: "Missing: at least one ad version before this draft can be published.",
  },
  {
    id: "cmp_54cc86",
    name: "The South Indian Campaign · 2026-09-07 07:39:58 UTC · 54cc86",
    channel: "google",
    objective: "Traffic",
    status: "failed",
    dailyBudget: 100,
    spent: 422.71,
    impressions: 11200,
    reach: 6100,
    clicks: 426,
    conversions: 38,
    startDate: "2026-09-07",
    endDate: null,
    ads: 2,
    owner: "Admin",
    updated: "Yesterday",
    trend: t(9, 7),
    note: BILLING_NOTE,
  },
  {
    id: "cmp_317516",
    name: "The South Indian Campaign · 2026-09-05 07:10:10 UTC · 317516",
    channel: "google",
    objective: "Traffic",
    status: "active",
    dailyBudget: 10,
    spent: 268.4,
    impressions: 4020,
    reach: 2300,
    clicks: 277,
    conversions: 96,
    startDate: "2026-09-05",
    endDate: null,
    ads: 2,
    owner: "Admin",
    updated: "12 min ago",
    trend: t(3),
  },
  {
    id: "cmp_d6bad7",
    name: "The South Indian Campaign · 2026-09-04 17:20:49 UTC · d6bad7",
    channel: "google",
    objective: "Traffic",
    status: "paused",
    dailyBudget: 100,
    spent: 310.2,
    impressions: 15900,
    reach: 8400,
    clicks: 318,
    conversions: 71,
    startDate: "2026-09-04",
    endDate: null,
    ads: 2,
    owner: "Admin",
    updated: "Yesterday",
    trend: t(12),
  },
  {
    id: "cmp_4cc950",
    name: "The South Indian Campaign Live · 2026-09-04 08:50:58 UTC · 4cc950",
    channel: "google",
    objective: "Traffic",
    status: "paused",
    dailyBudget: 100,
    spent: 241.6,
    impressions: 17300,
    reach: 9200,
    clicks: 242,
    conversions: 44,
    startDate: "2026-09-04",
    endDate: null,
    ads: 3,
    owner: "Admin",
    updated: "Yesterday",
    trend: t(5),
  },
  {
    id: "cmp_9a7e",
    name: "The South Indian Campaign",
    channel: "google",
    objective: "Traffic",
    status: "paused",
    dailyBudget: 100,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-03",
    endDate: null,
    ads: 1,
    owner: "Admin",
    updated: "2 days ago",
    trend: flat,
  },
  {
    id: "cmp_8b1c",
    name: "Super Sales Campaign",
    channel: "google",
    objective: "Sales",
    status: "paused",
    dailyBudget: 100,
    spent: 402.3,
    impressions: 19600,
    reach: 10800,
    clicks: 412,
    conversions: 150,
    startDate: "2026-09-03",
    endDate: null,
    ads: 4,
    owner: "Admin",
    updated: "2 days ago",
    trend: t(8),
  },
  {
    id: "cmp_7c2d",
    name: "South Indian Sea Food Fest",
    channel: "google",
    objective: "Traffic",
    status: "paused",
    dailyBudget: 100,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-03",
    endDate: "2026-09-21",
    ads: 2,
    owner: "Admin",
    updated: "2 days ago",
    trend: flat,
  },
  {
    id: "cmp_6d3e",
    name: "Aug Sale",
    channel: "google",
    objective: "Sales",
    status: "draft",
    dailyBudget: 100,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-02",
    endDate: null,
    ads: 1,
    owner: "Admin",
    updated: "3 days ago",
    trend: flat,
  },
  {
    id: "cmp_5e4f",
    name: "Authentic Indian Restaurant",
    channel: "google",
    objective: "Traffic",
    status: "active",
    dailyBudget: 81.6,
    spent: 1204.86,
    impressions: 52300,
    reach: 27600,
    clicks: 1203,
    conversions: 512,
    startDate: "2026-07-31",
    endDate: null,
    ads: 5,
    owner: "Admin",
    updated: "25 min ago",
    trend: t(6),
  },
  {
    id: "cmp_4f5a",
    name: "Lunch Buffet – Weekdays",
    channel: "google",
    objective: "Traffic",
    status: "active",
    dailyBudget: 150,
    spent: 596,
    impressions: 21880,
    reach: 11900,
    clicks: 613,
    conversions: 231,
    startDate: "2026-08-18",
    endDate: null,
    ads: 3,
    owner: "Admin",
    updated: "40 min ago",
    trend: t(11),
  },
  {
    id: "cmp_3a6b",
    name: "Catering Enquiries",
    channel: "google",
    objective: "Leads",
    status: "paused",
    dailyBudget: 120,
    spent: 321,
    impressions: 12500,
    reach: 7000,
    clicks: 395,
    conversions: 158,
    startDate: "2026-08-25",
    endDate: null,
    ads: 2,
    owner: "Admin",
    updated: "4 days ago",
    trend: t(2),
  },
  {
    id: "cmp_2b7c",
    name: "Weekend Brunch Promo",
    channel: "google",
    objective: "Traffic",
    status: "draft",
    dailyBudget: 90,
    spent: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2026-09-01",
    endDate: null,
    ads: 1,
    owner: "Admin",
    updated: "5 days ago",
    trend: flat,
  },
];

export const dailySpend = [
  { day: "Mon", spend: 980, conversions: 132 },
  { day: "Tue", spend: 1120, conversions: 148 },
  { day: "Wed", spend: 1040, conversions: 141 },
  { day: "Thu", spend: 1310, conversions: 176 },
  { day: "Fri", spend: 1480, conversions: 205 },
  { day: "Sat", spend: 890, conversions: 112 },
  { day: "Sun", spend: 820, conversions: 98 },
];

export const objectives = [
  { key: "traffic", label: "Traffic", hint: "Send people to your website or a landing page." },
  { key: "sales", label: "Sales", hint: "Drive purchases and conversions on your site." },
  { key: "leads", label: "Leads", hint: "Collect contact details with a form or messages." },
  { key: "awareness", label: "Brand awareness", hint: "Reach more people and grow recognition." },
  { key: "installs", label: "App installs", hint: "Send people to the App Store or Google Play." },
  { key: "engagement", label: "Engagement", hint: "Get more likes, comments, shares and follows." },
];

/* Formatting — kr with up to two decimals and no trailing zeros:
   2000 → kr2,000 · 552.05 → kr552.05 · 81.6 → kr81.6                */
const kr = (n: number) =>
  `kr${Number(n.toFixed(2)).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export const fmt = {
  kr,
  money: kr,
  int: (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)}M`
      : n >= 1000
        ? `${(n / 1000).toFixed(1)}k`
        : `${n}`,
  pct: (n: number) => `${n.toFixed(2)}%`,
  /** "2026-09-09" → "Sep 9, 2026" */
  date: (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
};
