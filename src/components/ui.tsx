import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

/* ----------------------------------------------------------------- Tooltip
   Used for icon-only controls (collapsed sidebar, top-bar toggles).
   The trigger must carry its own accessible name (aria-label or sr-only
   text) — this tooltip is a visual aid for sighted keyboard and pointer
   users, so it is aria-hidden to avoid double announcements.
   Rendered through a portal so scroll containers can never clip it, and
   dismissable with Escape (WCAG 1.4.13).                                  */
export function Tooltip({
  label,
  shortcut,
  side = "right",
  disabled,
  children,
}: {
  label: string;
  shortcut?: string;
  side?: "right" | "bottom";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  const show = () => {
    if (disabled) return;
    const el = ref.current?.firstElementChild as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(
      side === "right"
        ? { top: r.top + r.height / 2, left: r.right + 8 }
        : { top: r.bottom + 8, left: r.left + r.width / 2 },
    );
  };
  const hide = () => setPos(null);

  React.useEffect(() => {
    if (!pos) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPos(null);
    const onScroll = () => setPos(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [pos]);

  return (
    <span
      ref={ref}
      style={{ display: "contents" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={hide}
    >
      {children}
      {pos &&
        !disabled &&
        createPortal(
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none fixed z-[90] flex items-center gap-2 rounded-md border border-line bg-surface-soft px-3 py-1.5 text-[12px] whitespace-nowrap text-ink shadow-xl shadow-black/60",
              side === "right" ? "-translate-y-1/2" : "-translate-x-1/2",
            )}
            style={{ top: pos.top, left: pos.left }}
          >
            {label}
            {shortcut && (
              <kbd className="num rounded border border-white/20 px-1 text-[10px] text-white/70">
                {shortcut}
              </kbd>
            )}
          </span>,
          document.body,
        )}
    </span>
  );
}

/* ------------------------------------------------------------------ Button */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "hit-44 inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-medium transition-[background-color,border-color,color,box-shadow]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "min-h-9 px-3 text-[12px]",
        size === "md" && "px-4 text-[14px]",
        size === "lg" && "px-6 text-[16px]",
        variant === "primary" &&
          "glow-primary bg-primary-500 text-white hover:brightness-110 active:brightness-95",
        variant === "secondary" &&
          "border border-line bg-surface-soft text-ink hover:border-primary-200 hover:bg-primary-50",
        variant === "outline" &&
          "border border-primary-200 bg-transparent text-primary-700 hover:bg-primary-50",
        variant === "ghost" && "text-ink-700 hover:bg-primary-50 hover:text-ink",
        variant === "danger" &&
          "border border-danger/30 bg-transparent text-danger hover:bg-danger-soft",
        className,
      )}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------- Badge */
const tones = {
  neutral: "border-line bg-line-soft text-ink-700",
  primary: "border-primary-200 bg-primary-50 text-primary-700",
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
  secondary: "border-secondary-200 bg-secondary-50 text-secondary-600",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: keyof typeof tones;
  dot?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------- Card */
export function Card({
  className,
  children,
  as: Tag = "section",
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("surface", className)}>{children}</Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-line px-4 py-4 sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-[12px] text-ink-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------- Input */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[12px] font-medium tracking-wide text-ink-700"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-message` : undefined} className="flex items-center gap-2 text-[12px] text-danger">
          {error}
        </p>
      ) : (
        hint && <p id={htmlFor ? `${htmlFor}-message` : undefined} className="text-[12px] text-ink-500">{hint}</p>
      )}
    </div>
  );
}

const controlBase =
  "w-full min-h-11 rounded-full border bg-surface-soft px-4 text-[16px] text-ink placeholder:text-ink-400 transition-colors hover:border-primary-200 focus:border-primary-500 sm:text-[14px]";

export function Input({
  invalid,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        invalid ? "border-danger" : "border-line",
        className,
      )}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        "min-h-24 rounded-2xl py-3 leading-relaxed",
        invalid ? "border-danger" : "border-line",
        className,
      )}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={cn(controlBase, "appearance-none border-line pr-9", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23948fa8' stroke-width='2' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <input
        type="checkbox"
        {...rest}
        className="size-4 shrink-0 cursor-pointer rounded border-ink-400 accent-primary-500"
      />
      {label && <span className="text-[14px] text-ink-700">{label}</span>}
    </span>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-11 items-center gap-3 text-left"
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-primary-500 bg-primary-500" : "border-line bg-line-soft",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-surface shadow-sm transition-all",
            checked ? "left-5" : "left-0.5",
          )}
        />
      </span>
      <span className="text-[14px] text-ink-700">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------- Tabs */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-1 overflow-x-auto border-b border-line"
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            aria-pressed={active}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative -mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-[14px] transition-colors",
              active
                ? "border-primary-500 font-medium text-ink"
                : "border-transparent text-ink-500 hover:text-ink",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={cn(
                  "num rounded-full px-1.5 py-px text-[11px]",
                  active ? "bg-primary-50 text-primary-700" : "bg-line-soft text-ink-500",
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- Skeletons */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn("block animate-pulse rounded bg-line-soft", className)}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------- Empty/Error */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-line bg-surface-soft text-ink-400">
        {icon ?? "◌"}
      </div>
      <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-[14px] text-ink-500">{description}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 border border-danger/20 bg-danger-soft px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div>
        <p className="text-[14px] font-medium text-danger">{title}</p>
        <p className="mt-1 text-[12px] text-ink-700">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Progress */
export function Progress({
  value,
  tone = "primary",
  label,
}: {
  value: number;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger";
  label?: string;
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-line-soft"
    >
      <div
        className={cn("h-full rounded-full transition-[width]", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- Dropdown */
export function Menu({
  trigger,
  items,
  align = "right",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  items: { label: string; onSelect: () => void; danger?: boolean; disabled?: boolean }[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          role="menu"
          className={cn(
            "surface absolute z-40 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl p-1.5 shadow-xl shadow-black/50",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((i) => (
            <button
              key={i.label}
              role="menuitem"
              disabled={i.disabled}
              onClick={() => {
                i.onSelect();
                setOpen(false);
              }}
              className={cn(
                "flex min-h-10 w-full items-center rounded-full px-3.5 text-left text-[14px] transition-colors disabled:opacity-40",
                i.danger
                  ? "text-danger hover:bg-danger-soft"
                  : "text-ink-700 hover:bg-line-soft",
              )}
            >
              {i.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Drawer */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panel = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/70 backdrop-blur-[1px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-[560px] flex-col border-l border-line bg-surface shadow-2xl shadow-black/10"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-8 sm:py-6">
          <div>
            <h2 className="text-[20px] font-semibold break-words text-ink">{title}</h2>
            {description && (
              <p className="mt-1 text-[12px] text-ink-500">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close panel"
            className="min-h-11 min-w-11 px-0"
          >
            ✕
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-canvas px-5 py-4 sm:gap-3 sm:px-8">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Dialog
   Small modal for confirmations. Focus moves in on open, cycles with Tab,
   and returns to the opener on close. Escape and backdrop click dismiss. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panel = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]");
      (first ?? panel.current)?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panel.current) return;
    const focusable = Array.from(
      panel.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/70 backdrop-blur-[1px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={trapTab}
        className="surface relative max-h-[90dvh] w-full max-w-md overflow-y-auto p-5 shadow-2xl shadow-black/60 outline-none sm:p-6"
      >
        <h2 id={titleId} className="text-[16px] font-semibold text-ink">
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-2 text-[14px] leading-relaxed text-ink-500">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------- Toast */
export type Toast = {
  id: number;
  message: string;
  tone: "success" | "danger" | "info";
  /** Optional inline action — used for Undo on reversible changes */
  action?: { label: string; onClick: () => void };
};
export type ToastFn = (message: string, tone?: Toast["tone"], action?: Toast["action"]) => void;

/* Bottom-right on desktop. On mobile they sit above the bulk-action bar
   (which docks to the bottom edge) so the two never overlap.            */
export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:px-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "surface pointer-events-auto flex items-center gap-2 py-2 pr-1 pl-4 shadow-xl shadow-black/50",
            t.tone === "success" && "border-success/30",
            t.tone === "danger" && "border-danger/30",
          )}
        >
          <span className="flex-1 text-[14px] text-ink">{t.message}</span>
          {t.action && (
            <button
              onClick={() => {
                t.action?.onClick();
                onDismiss(t.id);
              }}
              className="hit-44 min-h-9 shrink-0 rounded-full px-3 text-[14px] font-medium text-primary-600 hover:bg-primary-50"
            >
              {t.action.label}
            </button>
          )}
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-500 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Avatar */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={cn(
        "num inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-[11px] font-medium text-ink-700",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
