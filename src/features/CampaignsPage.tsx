import * as React from "react";
import {
  AlertTriangle,
  CircleCheck,
  Eye,
  FilePen,
  ImagePlus,
  List as ListIcon,
  Pause,
  Play,
  Plus,
  Search as SearchIcon,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import {
  Badge,
  Button,
  Dialog,
  Drawer,
  EmptyState,
  Select,
  Skeleton,
  type ToastFn,
} from "../components/ui";
import CampaignDrawer from "./CampaignDrawerBody";
import {
  campaigns as seed,
  channels,
  fmt,
  statusMeta,
  type Campaign,
  type Channel,
  type Status,
} from "../lib/data";

/* ------------------------------------------------------------------ Model */
type Tab = "needs" | "running" | "drafts" | "all";
type PlatformFilter = Channel | "all";

const tabs: { key: Tab; label: string; icon: React.ReactNode; statuses: Status[]; hint: string }[] = [
  {
    key: "needs",
    label: "Needs you",
    icon: <AlertTriangle className="size-4" />,
    statuses: ["failed", "in_review", "paused"],
    hint: "Failed, in review, or paused — decide in one tap.",
  },
  {
    key: "running",
    label: "Running",
    icon: <CircleCheck className="size-4" />,
    statuses: ["active"],
    hint: "Live and spending. Pause anything that's drifting.",
  },
  {
    key: "drafts",
    label: "Drafts",
    icon: <FilePen className="size-4" />,
    statuses: ["draft"],
    hint: "Not published yet — publish when the ads are ready.",
  },
  {
    key: "all",
    label: "Everything",
    icon: <ListIcon className="size-4" />,
    statuses: ["failed", "in_review", "active", "paused", "draft", "completed"],
    hint: "Every campaign on every platform.",
  },
];

/* Broken first, then the rest in order of urgency */
const statusRank: Record<Status, number> = {
  failed: 0,
  in_review: 1,
  active: 2,
  paused: 3,
  draft: 4,
  completed: 5,
  archived: 6,
};

/* Left stripe — status as colour, echoing the badge */
const stripe: Record<Status, string> = {
  failed: "bg-danger-accent",
  in_review: "bg-review-accent",
  active: "bg-success-accent",
  paused: "bg-warning-accent",
  draft: "bg-neutral-accent",
  completed: "bg-neutral-accent",
  archived: "bg-neutral-accent",
};

const platformOrder: Channel[] = ["google", "meta", "x", "reddit", "tiktok", "microsoft"];

/** "Name · 2026-09-07 07:39:58 UTC · 54cc86" → "Name · 54cc86" */
const displayName = (name: string) => {
  const parts = name.split(" · ");
  return parts.length === 3 ? `${parts[0]} · ${parts[2]}` : name;
};
const quote = (name: string) => `“${displayName(name)}”`;

type Action = {
  label: string;
  icon: React.ReactNode;
  variant: "primary" | "secondary" | "ghost";
  run: () => void;
};

/* -------------------------------------------------------------------- Card
   `@container` lets the card decide its own layout: content and action sit
   side by side once the card itself is ≥ 448px, otherwise the action drops
   below — regardless of how many columns the grid currently has.         */
function CampaignCard({ c, action, onOpen }: { c: Campaign; action: Action; onOpen: () => void }) {
  const s = statusMeta[c.status];
  const name = displayName(c.name);
  const monthCap = c.dailyBudget * 30;
  const pacing = monthCap ? Math.min(100, (c.spent / monthCap) * 100) : 0;

  return (
    <article
      aria-labelledby={`${c.id}-title`}
      className="surface relative h-full overflow-hidden transition-colors hover:border-primary-200"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", stripe[c.status])} aria-hidden="true" />

      <div className="flex flex-col gap-4 p-5 pl-6 @md:flex-row @md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 id={`${c.id}-title`} className="min-w-0 text-[16px] font-semibold text-ink">
              {/* Vertical padding brings the tap target to 44px without moving the layout */}
              <button
                type="button"
                onClick={onOpen}
                title={c.name}
                className="-my-2.5 block max-w-full truncate py-2.5 text-left transition-colors hover:text-primary-600"
              >
                {name}
              </button>
            </h3>
            <Badge tone={s.tone} className="shrink-0">
              {s.label}
            </Badge>
          </div>

          <p className="mt-1 truncate text-[13px] text-ink-500">
            {channels[c.channel].label} · {c.objective}
            {c.type && <span className="text-primary-700"> · {c.type}</span>}
          </p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="num shrink-0 text-[14px] text-ink">
                {fmt.kr(c.dailyBudget)} <span className="text-ink-500">/ day</span>
              </span>
              <span className="num shrink-0 text-[12px] text-ink-500">
                {c.spent > 0 ? `${fmt.kr(c.spent)} spent` : "No spend yet"}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={Math.round(pacing)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${fmt.kr(c.spent)} of ${fmt.kr(monthCap)} monthly budget spent`}
              className="h-1 w-full overflow-hidden rounded-full bg-line-soft"
            >
              <div
                className="progress-fill h-full rounded-full bg-gradient-to-r from-primary-500 to-brand-glow"
                style={{ width: `${pacing}%` }}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 @md:pl-2">
          <Button
            variant={action.variant}
            icon={action.icon}
            onClick={action.run}
            className="w-full @md:w-auto"
          >
            {action.label}
          </Button>
        </div>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="surface p-5 pl-6" aria-hidden="true">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-3 w-36" />
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-1 flex-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Page */
export default function CampaignsPage({
  onNewCampaign,
  onEditCampaign,
  onNavigate,
  toast,
}: {
  onNewCampaign: () => void;
  onEditCampaign: (c: Campaign) => void;
  onNavigate?: (r: "billing" | "platforms") => void;
  toast: ToastFn;
}) {
  const [list, setList] = React.useState<Campaign[]>(seed);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<Tab>(() =>
    seed.some((c) => tabs[0].statuses.includes(c.status)) ? "needs" : "all",
  );
  const [platform, setPlatform] = React.useState<PlatformFilter>("all");
  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Campaign | null>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  /* "/" focuses search when not already typing */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        !!el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------------------------------------------------ Derived */
  const q = query.trim().toLowerCase();
  const matches = (c: Campaign) =>
    (platform === "all" || c.channel === platform) &&
    (!q ||
      [c.name, c.objective, c.type ?? "", channels[c.channel].label].some((s) =>
        s.toLowerCase().includes(q),
      ));

  const platformsInUse = platformOrder.filter((p) => list.some((c) => c.channel === p));
  const filtered = list.filter(matches);
  const countFor = (t: Tab) =>
    filtered.filter((c) => tabs.find((x) => x.key === t)!.statuses.includes(c.status)).length;

  const current = tabs.find((t) => t.key === tab)!;
  const visible = filtered
    .filter((c) => current.statuses.includes(c.status))
    .sort((a, b) => {
      if (tab === "drafts") {
        const ready = (c: Campaign) => (c.ads > 0 ? 0 : 1);
        if (ready(a) !== ready(b)) return ready(a) - ready(b);
      }
      return (
        statusRank[a.status] - statusRank[b.status] ||
        b.spent - a.spent ||
        b.dailyBudget - a.dailyBudget
      );
    });

  const needsTotal = list.filter((c) => tabs[0].statuses.includes(c.status)).length;
  const filtersActive = platform !== "all" || q !== "";

  /* ------------------------------------------------------------ Actions */
  const changeStatus = (c: Campaign, next: Status) => {
    const prev = c.status;
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, status: next, updated: "Just now" } : x)));
    const verb = next === "paused" ? "Paused" : prev === "draft" ? "Published" : "Resumed";
    toast(`${verb} ${quote(c.name)}`, next === "paused" ? "info" : "success", {
      label: "Undo",
      onClick: () =>
        setList((l) => l.map((x) => (x.id === c.id ? { ...x, status: prev, updated: "Just now" } : x))),
    });
  };

  const retry = (c: Campaign) => {
    const label = channels[c.channel].label;
    toast(`Retrying ${quote(c.name)} on ${label}…`, "info");
    window.setTimeout(
      () =>
        toast(
          `Still failing — ${label} reports a billing issue on this account.`,
          "danger",
          onNavigate ? { label: "Fix billing", onClick: () => onNavigate("billing") } : undefined,
        ),
      1400,
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setList((l) => l.filter((c) => c.id !== pendingDelete.id));
    if (openId === pendingDelete.id) setOpenId(null);
    toast(`Deleted ${quote(pendingDelete.name)}`, "info");
    setPendingDelete(null);
  };

  const actionFor = (c: Campaign): Action => {
    switch (c.status) {
      case "failed":
        return { label: "Fix this", icon: <AlertTriangle className="size-4" />, variant: "primary", run: () => setOpenId(c.id) };
      case "paused":
        return { label: "Resume", icon: <Play className="size-4" />, variant: "primary", run: () => changeStatus(c, "active") };
      case "active":
        return { label: "Pause", icon: <Pause className="size-4" />, variant: "secondary", run: () => changeStatus(c, "paused") };
      case "draft":
        return c.ads > 0
          ? { label: "Publish", icon: <Send className="size-4" />, variant: "primary", run: () => changeStatus(c, "active") }
          : { label: "Add ad", icon: <ImagePlus className="size-4" />, variant: "primary", run: () => onEditCampaign(c) };
      default:
        return { label: "View", icon: <Eye className="size-4" />, variant: "ghost", run: () => setOpenId(c.id) };
    }
  };

  /* Tabs: arrow keys move selection, Home/End jump */
  const onTabKey = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.key === tab);
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    else return;
    e.preventDefault();
    setTab(tabs[n].key);
    document.getElementById(`tab-${tabs[n].key}`)?.focus();
  };

  const clearFilters = () => {
    setPlatform("all");
    setQuery("");
  };

  const open = list.find((c) => c.id === openId) ?? null;

  /* Empty-state copy per tab */
  const empty = filtersActive
    ? {
        title: q ? `No campaigns match “${query.trim()}”` : `No ${current.label.toLowerCase()} campaigns on ${platform === "all" ? "any platform" : channels[platform as Channel].label}`,
        desc: "Try a different search or platform.",
        action: <Button onClick={clearFilters}>Clear filters</Button>,
      }
    : tab === "needs"
      ? {
          title: "Nothing needs a decision",
          desc: "Every campaign is running as planned. Come back when something changes.",
          action: <Button onClick={() => setTab("running")}>See running campaigns</Button>,
        }
      : tab === "running"
        ? {
            title: "Nothing is running",
            desc: "Resume a paused campaign or publish a draft to start delivering.",
            action: <Button variant="primary" icon={<Plus className="size-4" />} onClick={onNewCampaign}>Create Campaign</Button>,
          }
        : tab === "drafts"
          ? {
              title: "No drafts",
              desc: "Start a campaign and it stays here until you publish it.",
              action: <Button variant="primary" icon={<Plus className="size-4" />} onClick={onNewCampaign}>Create Campaign</Button>,
            }
          : {
              title: "No campaigns yet",
              desc: "Create your first campaign and it will show up here.",
              action: <Button variant="primary" icon={<Plus className="size-4" />} onClick={onNewCampaign}>Create Campaign</Button>,
            };

  /* ------------------------------------------------------------- Render */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">Campaigns</h1>
        <p className="mt-1 text-[14px] text-ink-500">
          {loading ? (
            "Syncing with your ad platforms…"
          ) : needsTotal > 0 ? (
            <>
              <span className="num text-ink">{needsTotal}</span> campaign{needsTotal === 1 ? "" : "s"} waiting on a
              decision. Start there — everything else can wait.
            </>
          ) : (
            "Nothing is waiting on you. Every campaign is running as planned."
          )}
        </p>
      </div>

      {/* Triage tabs */}
      <div>
        <div role="tablist" aria-label="Campaign groups" className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const selected = t.key === tab;
            return (
              <button
                key={t.key}
                id={`tab-${t.key}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="campaign-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.key)}
                onKeyDown={onTabKey}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors",
                  selected
                    ? "glow-primary border-transparent bg-primary-500 text-white"
                    : "border-line bg-surface-soft text-ink-700 hover:border-primary-200 hover:text-ink",
                )}
              >
                <span className={selected ? "text-white" : "text-ink-400"} aria-hidden="true">
                  {t.icon}
                </span>
                {t.label}
                <span
                  className={cn(
                    "num rounded-full px-2 py-0.5 text-[12px]",
                    selected ? "bg-white/20 text-white" : "bg-primary-100 text-primary-700",
                  )}
                >
                  {loading ? "…" : countFor(t.key)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-ink-500">{current.hint}</p>
      </div>

      {/* Search + platform */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search campaigns</span>
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.stopPropagation();
                setQuery("");
              }
            }}
            placeholder="Search by name, goal or account"
            className="min-h-11 w-full rounded-full border border-line bg-surface-soft pr-11 pl-11 text-[16px] text-ink outline-none placeholder:text-ink-400 hover:border-primary-200 focus:border-primary-500 sm:text-[14px]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 hover:bg-primary-50 hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="num absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-full border border-line px-2 text-[11px] text-ink-400 md:block">
              /
            </kbd>
          )}
        </label>
        <Select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformFilter)}
          aria-label="Filter by platform"
          className="sm:w-52"
        >
          <option value="all">All platforms</option>
          {platformsInUse.map((p) => (
            <option key={p} value={p}>
              {channels[p].label}
            </option>
          ))}
        </Select>
      </div>

      {/* Cards — two across */}
      <div id="campaign-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={-1}>
        {loading ? (
          <div role="status" aria-label="Loading campaigns" className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={<span className="text-ink-400">{current.icon}</span>}
              title={empty.title}
              description={empty.desc}
              action={empty.action}
            />
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {visible.map((c) => (
              <li key={c.id} className="@container min-w-0">
                <CampaignCard c={c} action={actionFor(c)} onOpen={() => setOpenId(c.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Details */}
      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name ?? ""}
        description={open ? `${channels[open.channel].label} · ${open.objective}` : undefined}
      >
        {open && (
          <CampaignDrawer
            campaign={open}
            onEdit={onEditCampaign}
            onToast={toast}
            onSetStatus={(next) => changeStatus(open, next)}
            onDelete={() => setPendingDelete(open)}
            onRetry={() => retry(open)}
            onFixBilling={onNavigate ? () => onNavigate("billing") : undefined}
          />
        )}
      </Drawer>

      {/* Delete is the one irreversible action, so it is the one that asks */}
      <Dialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete this campaign?"
        description={
          pendingDelete && (
            <>
              <span className="text-ink">{quote(pendingDelete.name)}</span> will be removed from Reach and
              from {channels[pendingDelete.channel].label}. Delivery stops immediately and reporting
              history is lost. This can't be undone.
            </>
          )
        }
        footer={
          <>
            <Button data-autofocus onClick={() => setPendingDelete(null)}>
              Keep
            </Button>
            <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
