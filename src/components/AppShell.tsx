import * as React from "react";
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Layers,
  Plug,
  FileText,
  CalendarDays,
  BarChart3,
  FolderOpen,
  CheckCircle2,
  Palette,
  Settings,
  CreditCard,
  Search,
  Plus,
  Bell,
  CircleHelp,
  LogOut,
  Menu as MenuIcon,
  X,
  CornerDownLeft,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Avatar, Button, Tooltip } from "./ui";
import { ThemeToggle } from "./ThemeToggle";

export type RouteKey =
  | "overview"
  | "campaigns"
  | "create"
  | "new-campaign"
  | "templates"
  | "platforms"
  | "posts"
  | "schedule"
  | "analytics"
  | "assets"
  | "approve"
  | "branding"
  | "settings"
  | "billing"
  | "billingSettings";

const nav: {
  group: string;
  items: { key: RouteKey; label: string; icon: React.ReactNode; badge?: string }[];
}[] = [
  {
    group: "",
    items: [
      { key: "overview", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
      { key: "campaigns", label: "Campaigns", icon: <Megaphone className="size-4" /> },
      { key: "create", label: "Create", icon: <Sparkles className="size-4" /> },
      { key: "approve", label: "Approve", icon: <CheckCircle2 className="size-4" />, badge: "4" },
      { key: "templates", label: "Templates", icon: <Layers className="size-4" /> },
      { key: "platforms", label: "Platforms", icon: <Plug className="size-4" /> },
      { key: "posts", label: "Posts", icon: <FileText className="size-4" /> },
      { key: "schedule", label: "Schedule", icon: <CalendarDays className="size-4" /> },
      { key: "analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
      { key: "assets", label: "Assets", icon: <FolderOpen className="size-4" /> },
      { key: "branding", label: "Branding", icon: <Palette className="size-4" /> },
    ],
  },
  {
    group: "Settings",
    items: [
      { key: "billing", label: "Billing", icon: <CreditCard className="size-4" /> },
      { key: "settings", label: "Settings", icon: <Settings className="size-4" /> },
      { key: "billingSettings", label: "Billing Settings", icon: <KeyRound className="size-4" /> },
    ],
  },
];

export const routeTitles: Record<RouteKey, { title: string; sub: string }> = {
  overview: { title: "Dashboard", sub: "How every channel performed today." },
  campaigns: { title: "Campaigns", sub: "Every campaign, every channel, one list." },
  create: { title: "Create", sub: "Describe the ad image you want. Add a reference photo to guide the AI." },
  "new-campaign": { title: "Create campaign", sub: "Five short steps from idea to live ad." },
  templates: { title: "Templates", sub: "Reusable campaign blueprints for your team." },
  platforms: { title: "Platforms", sub: "Connect ad accounts and pages." },
  posts: { title: "Posts", sub: "Organic content across every workspace." },
  schedule: { title: "Schedule", sub: "What goes out, and when." },
  analytics: { title: "Analytics", sub: "Cross-channel reporting." },
  assets: { title: "Assets", sub: "Your media library." },
  approve: { title: "Approve creatives", sub: "Review AI-generated ad images." },
  branding: { title: "Branding", sub: "Logo, palette and voice." },
  settings: { title: "Settings", sub: "Workspace preferences." },
  billing: { title: "Billing", sub: "Plan, invoices and payment methods." },
  billingSettings: { title: "Billing settings", sub: "Tax details, billing contacts and invoice preferences." },
};

function NavList({
  active,
  onNavigate,
  collapsed = false,
}: {
  active: RouteKey;
  onNavigate: (k: RouteKey) => void;
  collapsed?: boolean;
}) {
  return (
    <nav
      aria-label="Main"
      className={cn("flex flex-col py-6", collapsed ? "gap-4 px-3" : "gap-8 px-4")}
    >
      {nav.map((group) => (
        <div key={group.group || "primary"}>
          {collapsed ? (
            group.group && <div className="mx-2 mb-4 border-t border-line" role="presentation" />
          ) : (
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.1em] text-ink-400 uppercase">
              {group.group || "Menu"}
            </p>
          )}
          <ul className="space-y-0.5" aria-label={group.group || undefined}>
            {group.items.map((item) => {
              const isActive = item.key === active;
              return (
                <li key={item.key}>
                  <Tooltip label={item.label} disabled={!collapsed}>
                    <button
                      onClick={() => onNavigate(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative flex min-h-11 items-center rounded-full text-[14px] transition-colors",
                        collapsed ? "mx-auto size-11 justify-center" : "w-full gap-3 px-4",
                        isActive
                          ? "border border-line bg-surface-soft font-medium text-ink"
                          : "text-ink-700 hover:bg-primary-50 hover:text-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0",
                          isActive ? "text-primary-700" : "text-ink-400",
                        )}
                      >
                        {item.icon}
                      </span>
                      {/* Label stays in the DOM in rail mode so the button keeps its name */}
                      <span className={collapsed ? "sr-only" : "flex-1 text-left"}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={cn(
                            "num",
                            collapsed
                              ? "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-surface bg-primary-500 px-1 text-[10px] leading-none text-white"
                              : "rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------ Sidebar panel
   One panel, two densities. `collapsed` turns it into a 72px icon rail:
   labels become visually hidden (still read by screen readers) and
   tooltips take over for sighted users.                                  */
function SidebarPanel({
  route,
  onNavigate,
  collapsed,
  onToggleCollapse,
}: {
  route: RouteKey;
  onNavigate: (k: RouteKey) => void;
  collapsed: boolean;
  /** Omit to hide the collapse control (e.g. inside the mobile drawer) */
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Product identity — glowing violet mark, wordmark, plan pill */}
      <Tooltip label="Reach · Pro" disabled={!collapsed}>
        <button
          type="button"
          onClick={() => onNavigate("overview")}
          aria-label="Reach home"
          className={cn(
            "flex min-h-16 w-full items-center text-left",
            collapsed ? "justify-center" : "gap-3 px-5 pr-14 lg:pr-5",
          )}
        >
          <span className="glow-primary flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[15px] font-semibold text-white">
            R
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 text-[17px] font-semibold tracking-[-0.02em] text-ink">Reach</span>
              <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700">
                Pro
              </span>
            </>
          )}
        </button>
      </Tooltip>

      <div className="flex-1 overflow-y-auto">
        <NavList active={route} onNavigate={onNavigate} collapsed={collapsed} />
      </div>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-line",
          collapsed ? "flex flex-col items-center gap-1 px-3 py-3" : "px-4 py-3",
        )}
      >
        {!collapsed && (
          <>
            <div className="flex items-center justify-between text-[11px] text-ink-500">
              <span>Storage used</span>
              <span className="num text-ink-700">18 images</span>
            </div>
            <div
              className="mt-2 h-1 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-label="Storage used"
              aria-valuenow={42}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-fill h-full w-[42%] rounded-full bg-primary-500" />
            </div>
          </>
        )}

        <Tooltip label="Log out" disabled={!collapsed}>
          <button
            className={cn(
              "flex min-h-11 items-center rounded-full text-[13px] text-ink-500 transition-colors hover:bg-primary-50 hover:text-ink",
              collapsed ? "size-11 justify-center" : "mt-3 w-full gap-3 px-3",
            )}
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : undefined}>Log out</span>
          </button>
        </Tooltip>

        {onToggleCollapse && (
          <Tooltip label="Show labels" disabled={!collapsed}>
            <button
              onClick={onToggleCollapse}
              aria-expanded={!collapsed}
              aria-controls="app-sidebar"
              className={cn(
                "flex min-h-11 items-center rounded-full text-[13px] text-ink-500 transition-colors hover:bg-primary-50 hover:text-ink",
                collapsed ? "size-11 justify-center" : "mt-1 w-full gap-3 px-3",
              )}
            >
              {collapsed ? (
                <ChevronsRight className="size-4" aria-hidden="true" />
              ) : (
                <ChevronsLeft className="size-4" aria-hidden="true" />
              )}
              <span className={collapsed ? "sr-only" : undefined}>
                {collapsed ? "Show labels" : "Hide labels"}
              </span>
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Command palette */
function CommandPalette({
  open,
  onClose,
  onNavigate,
  commands = [],
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (k: RouteKey) => void;
  /** Extra actions surfaced alongside pages (e.g. sidebar toggles) */
  commands?: { label: string; icon: React.ReactNode; run: () => void }[];
}) {
  const [q, setQ] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  type Result = {
    key: string;
    label: string;
    icon: React.ReactNode;
    group: string;
    run: () => void;
  };

  const results = React.useMemo<Result[]>(() => {
    const pages: Result[] = nav.flatMap((g) =>
      g.items.map((i) => ({
        key: i.key,
        label: i.label,
        icon: i.icon,
        group: g.group || "Pages",
        run: () => onNavigate(i.key),
      })),
    );
    const actions: Result[] = commands.map((c) => ({
      key: `cmd:${c.label}`,
      label: c.label,
      icon: c.icon,
      group: "Actions",
      run: c.run,
    }));
    const all = [...pages, ...actions];
    if (!q.trim()) return all.slice(0, 6);
    return all.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  }, [q, commands, onNavigate]);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  const run = (i: number) => {
    const r = results[i];
    if (!r) return;
    r.run();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[8vh] sm:px-4 sm:pt-[12vh]">
      <button
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/70 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="surface relative w-full max-w-xl overflow-hidden shadow-2xl shadow-black/60"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((i) => (i + 1) % Math.max(1, results.length));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((i) => (i - 1 + results.length) % Math.max(1, results.length));
          }
          if (e.key === "Enter") run(index);
          if (e.key === "Escape") onClose();
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 sm:px-5">
          <Search className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIndex(0);
            }}
            placeholder="Jump to a page, campaign or action…"
            aria-label="Search"
            className="min-h-14 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-400 sm:text-[14px]"
          />
          <kbd className="num rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-500">
            esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-[14px] text-ink-500">
              No matches for “{q}”.
            </li>
          )}
          {results.map((r, i) => (
            <li key={r.key}>
              <button
                onMouseEnter={() => setIndex(i)}
                onClick={() => run(i)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-full px-3.5 text-left text-[14px]",
                  i === index ? "bg-primary-50 text-primary-700" : "text-ink-700",
                )}
              >
                <span className={i === index ? "text-primary-600" : "text-ink-400"}>
                  {r.icon}
                </span>
                <span className="flex-1">{r.label}</span>
                <span className="text-[12px] text-ink-400">{r.group}</span>
                {i === index && <CornerDownLeft className="size-3.5 text-ink-400" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Preferences */
const SIDEBAR_PREFS_KEY = "reach.sidebar";

function readSidebarCollapsed(): boolean {
  try {
    const raw = localStorage.getItem(SIDEBAR_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<{ collapsed: boolean }>;
      return !!parsed.collapsed;
    }
  } catch {
    /* fall through to default */
  }
  return false;
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");
const modKeyLabel = isMac ? "⌘" : "Ctrl+";

/* ------------------------------------------------------------------- Shell */
export function AppShell({
  route,
  onNavigate,
  onNewCampaign,
  actions,
  children,
}: {
  route: RouteKey;
  onNavigate: (k: RouteKey) => void;
  onNewCampaign: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Dashboard renders its own Create button in the page header; the campaign
  // builder *is* the action. Everywhere else the shell provides it.
  const hidePrimaryAction = route === "overview" || route === "new-campaign";
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  // Sidebar density (desktop only; mobile uses the drawer).
  // One flag: expanded (icons + labels) ⇄ collapsed (icon-only rail).
  // The sidebar is never removed, so navigation is always one click away.
  const [collapsed, setCollapsed] = React.useState(readSidebarCollapsed);

  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_PREFS_KEY, JSON.stringify({ collapsed }));
    } catch {
      /* private mode or storage disabled — preference simply won't persist */
    }
  }, [collapsed]);

  const toggleCollapsed = React.useCallback(() => setCollapsed((v) => !v), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.altKey || e.shiftKey) return;
      const key = e.key.toLowerCase();
      if (key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (key === "b") {
        e.preventDefault();
        if (window.matchMedia("(min-width: 1024px)").matches) toggleCollapsed();
        else setMobileOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  const go = (k: RouteKey) => {
    onNavigate(k);
    setMobileOpen(false);
  };

  const railWidth = collapsed ? "w-[72px]" : "w-64";

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-[14px] focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Desktop sidebar — width animates between the full panel and the
          icon rail. It never leaves the screen. */}
      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-line bg-canvas transition-[width] duration-200 ease-out lg:block",
          railWidth,
        )}
      >
        {/* Inner panel keeps the target width so text never wraps mid-animation */}
        <div className={cn("h-full", railWidth)}>
          <SidebarPanel
            route={route}
            onNavigate={go}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
          />
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-brand-dark/70"
          />
          <div className="relative h-full w-72 max-w-[85vw] border-r border-line bg-canvas">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-4 flex size-11 items-center justify-center text-ink-500"
            >
              <X className="size-4" />
            </button>
            <SidebarPanel route={route} onNavigate={go} collapsed={false} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "transition-[padding] duration-200 ease-out",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64",
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
          <div className="flex min-h-16 items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
            {/* Mobile: open the navigation drawer */}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="min-h-11 min-w-11 px-0 lg:hidden"
            >
              <MenuIcon className="size-4" />
            </Button>

            {/* Desktop: toggle the sidebar between labels and icon-only */}
            <Tooltip
              label={collapsed ? "Show sidebar labels" : "Hide sidebar labels"}
              shortcut={`${modKeyLabel}B`}
              side="bottom"
            >
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Show sidebar labels" : "Hide sidebar labels"}
                aria-expanded={!collapsed}
                aria-controls="app-sidebar"
                aria-keyshortcuts="Control+B Meta+B"
                className="hidden min-h-11 min-w-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-primary-50 lg:inline-flex"
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="size-4" aria-hidden="true" />
                )}
              </button>
            </Tooltip>

            {/* Workspace switcher — pill with mark, name and chevron */}
            <button
              type="button"
              aria-label="Switch workspace: Artomic"
              aria-haspopup="menu"
              className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-full border border-line bg-surface-soft py-1 pr-1.5 pl-1.5 text-left transition-colors hover:border-primary-200 sm:pr-3"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-500 text-[13px] font-semibold text-white">
                A
              </span>
              <span className="hidden text-[14px] font-medium text-ink sm:block">Artomic</span>
              <ChevronDown className="hidden size-3.5 text-ink-400 sm:block" aria-hidden="true" />
            </button>

            {/* Search: a pill field from `sm` up, an icon button on phones */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden min-h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-surface-soft px-4 text-left text-[14px] text-ink-400 transition-colors hover:border-primary-200 sm:flex sm:max-w-xs"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">Search campaigns, audiences</span>
              <kbd className="num hidden rounded-full border border-line px-2 py-0.5 text-[11px] md:block">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="flex size-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-primary-50 sm:hidden"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <ThemeToggle />
              <button
                type="button"
                aria-label="Notifications, 2 unread"
                className="relative flex size-11 items-center justify-center rounded-full border border-line bg-surface-soft text-ink-700 transition-colors hover:border-primary-200 hover:text-ink"
              >
                <Bell className="size-4" aria-hidden="true" />
                <span
                  className="num absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-canvas bg-primary-500 text-[9px] font-semibold leading-none text-white"
                  aria-hidden="true"
                >
                  2
                </span>
              </button>
              <button
                type="button"
                aria-label="Help"
                className="hidden size-11 items-center justify-center rounded-full border border-line bg-surface-soft text-ink-700 transition-colors hover:border-primary-200 hover:text-ink sm:flex"
              >
                <CircleHelp className="size-4" aria-hidden="true" />
              </button>
              {/* One Create button per screen: the page owns it, the shell only
                  offers it where the page hasn't. */}
              {!hidePrimaryAction && (
                <Button
                  variant="primary"
                  icon={<Plus className="size-4" />}
                  onClick={onNewCampaign}
                  aria-label="Create Campaign"
                  className="min-w-11 px-3 sm:min-w-0 sm:px-4"
                >
                  <span className="hidden sm:inline">Create Campaign</span>
                  <span className="hidden min-[420px]:inline sm:hidden">Create</span>
                </Button>
              )}
              <button
                type="button"
                aria-label="Account menu for Admin"
                aria-haspopup="menu"
                className="hidden rounded-full sm:block"
              >
                <Avatar name="Admin" className="size-10 border-line bg-surface-soft text-[12px] text-ink" />
              </button>
            </div>
          </div>
          {actions && (
            <div className="border-t border-line-soft px-4 py-2 sm:px-6 lg:px-8">{actions}</div>
          )}
        </header>

        <main id="main" className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={go}
        commands={[
          {
            label: "New campaign",
            icon: <Plus className="size-4" />,
            run: onNewCampaign,
          },
          {
            label: collapsed ? "Show sidebar labels" : "Hide sidebar labels",
            icon: collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            ),
            run: toggleCollapsed,
          },
        ]}
      />
    </div>
  );
}
