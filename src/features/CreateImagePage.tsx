import * as React from "react";
import {
  Check,
  Download,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Badge, Button, Dialog, type ToastFn } from "../components/ui";

/* ------------------------------------------------------------------ Types */
type NavigateFn = (r: "campaigns" | "new-campaign" | "approve" | "assets") => void;

type Reference = {
  id: string;
  name: string;
  src?: string;
  css?: string;
};

type Generated = {
  id: string;
  prompt: string;
  aspect: Aspect;
  style: Style;
  seed: number;
  hue: number;
  css: string;
  createdAt: number;
};

type Aspect = "1:1" | "4:5" | "16:9" | "9:16";
type Style = "Photoreal" | "Studio" | "UGC" | "Illustration";

const ASPECTS: { value: Aspect; label: string; hint: string }[] = [
  { value: "1:1", label: "1:1", hint: "Feed" },
  { value: "4:5", label: "4:5", hint: "Portrait" },
  { value: "16:9", label: "16:9", hint: "Landscape" },
  { value: "9:16", label: "9:16", hint: "Story" },
];

const STYLES: Style[] = ["Photoreal", "Studio", "UGC", "Illustration"];

const SUGGESTIONS = [
  "Crispy masala dosa on a banana leaf, steam rising, warm restaurant light",
  "South Indian thali flat-lay on dark slate, vibrant chutneys, top-down",
  "Cozy restaurant interior at dusk, brass lamps, thali on wooden table",
];

const LIBRARY: { name: string; css: string }[] = [
  { name: "Thali hero", css: "linear-gradient(135deg,#3b1f6e 0%,#7c3aed 55%,#f472b6 100%)" },
  { name: "Dosa close-up", css: "linear-gradient(135deg,#0f2a3a 0%,#1d6f8f 60%,#4ade80 100%)" },
  { name: "Chef portrait", css: "linear-gradient(135deg,#3a1f0f 0%,#b45309 55%,#fbbf24 100%)" },
  { name: "Spice market", css: "linear-gradient(135deg,#4c0519 0%,#be123c 55%,#fb923c 100%)" },
  { name: "Filter coffee", css: "linear-gradient(135deg,#1e1b4b 0%,#4c1d95 55%,#a78bfa 100%)" },
  { name: "Banana leaf", css: "linear-gradient(135deg,#052e16 0%,#15803d 55%,#86efac 100%)" },
];

const STAGES = ["Understanding your prompt", "Sketching composition", "Rendering details"];

const HISTORY_KEY = "reach.create.history.v1";
const MAX_REFS = 3;
const MAX_PROMPT = 500;

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function artFor(hue: number): string {
  const h2 = (hue + 50) % 360;
  const h3 = (hue + 110) % 360;
  return [
    `radial-gradient(90% 90% at 20% 10%, hsla(${hue},80%,62%,0.95) 0%, transparent 55%)`,
    `radial-gradient(80% 80% at 85% 20%, hsla(${h2},75%,55%,0.85) 0%, transparent 55%)`,
    `radial-gradient(90% 90% at 50% 100%, hsla(${h3},70%,45%,0.9) 0%, transparent 60%)`,
    `linear-gradient(135deg, hsl(${hue},45%,16%) 0%, hsl(${(hue + 30) % 360},50%,10%) 100%)`,
  ].join(", ");
}

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function downloadArtwork(g: Generated) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, `hsl(${g.hue},60%,32%)`);
    grad.addColorStop(0.55, `hsl(${(g.hue + 50) % 360},65%,42%)`);
    grad.addColorStop(1, `hsl(${(g.hue + 110) % 360},60%,26%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);
    // soft glow blobs
    for (let i = 0; i < 5; i++) {
      const x = (g.seed * (37 + i * 61)) % 1024;
      const y = (g.seed * (53 + i * 47)) % 1024;
      const r = 180 + ((g.seed * (i + 3)) % 220);
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `hsla(${(g.hue + i * 24) % 360},80%,68%,0.55)`);
      rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "600 40px 'Century Gothic', Questrial, sans-serif";
    ctx.fillText("Reach · AI creative", 64, 120);
    ctx.font = "400 30px 'Century Gothic', Questrial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    const words = g.prompt.split(" ").slice(0, 9).join(" ");
    ctx.fillText(words.length > 42 ? `${words.slice(0, 42)}…` : words || "Untitled", 64, 920);
    const a = document.createElement("a");
    a.download = `reach-${g.id}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ Page */
export default function CreateImagePage({
  toast,
  onNavigate,
}: {
  toast: ToastFn;
  onNavigate?: NavigateFn;
}) {
  const [prompt, setPrompt] = React.useState("");
  const [refs, setRefs] = React.useState<Reference[]>([]);
  const [aspect, setAspect] = React.useState<Aspect>("1:1");
  const [style, setStyle] = React.useState<Style>("Photoreal");
  const [generating, setGenerating] = React.useState(false);
  const [stage, setStage] = React.useState(0);
  const [results, setResults] = React.useState<Generated[]>([]);
  const [history, setHistory] = React.useState<Generated[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(raw) ? raw.slice(0, 8) : [];
    } catch {
      return [];
    }
  });
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [lightbox, setLightbox] = React.useState<Generated | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const fileRef = React.useRef<HTMLInputElement>(null);
  const textRef = React.useRef<HTMLTextAreaElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const canGenerate = prompt.trim().length >= 4 && !generating;

  React.useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
    } catch {
      /* private mode — history simply won't persist */
    }
  }, [history]);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files);
    if (refs.length + list.length > MAX_REFS) {
      toast(`You can attach up to ${MAX_REFS} reference images`, "danger");
      return;
    }
    list.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast(`“${file.name}” isn't an image`, "danger");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast(`“${file.name}” is over 8 MB`, "danger");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        setRefs((r) => [...r, { id: `${Date.now()}-${Math.random()}`, name: file.name, src: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addFromLibrary = (item: { name: string; css: string }) => {
    if (refs.length >= MAX_REFS) {
      toast(`You can attach up to ${MAX_REFS} reference images`, "danger");
      return;
    }
    setRefs((r) => [...r, { id: `${Date.now()}-${Math.random()}`, name: item.name, css: item.css }]);
    setLibraryOpen(false);
    toast(`“${item.name}” added as a reference`);
  };

  const generate = () => {
    const value = prompt.trim();
    if (value.length < 4) {
      toast("Describe the image in a few more words first", "danger");
      textRef.current?.focus();
      return;
    }
    if (generating) return;
    setGenerating(true);
    setStage(0);
    setResults([]);
    const t1 = window.setTimeout(() => setStage(1), 900);
    const t2 = window.setTimeout(() => setStage(2), 1800);
    window.setTimeout(() => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      const base = hashString(value + style + aspect + Date.now());
      const batch: Generated[] = Array.from({ length: 4 }).map((_, i) => {
        const seed = base + i * 7919;
        const hue = (seed % 300) + 10;
        return {
          id: `gen-${Date.now()}-${i}`,
          prompt: value,
          aspect,
          style,
          seed,
          hue,
          css: artFor(hue),
          createdAt: Date.now(),
        };
      });
      setResults(batch);
      setHistory((h) => [...batch, ...h].slice(0, 8));
      setSelected(new Set());
      setGenerating(false);
      toast("4 images generated — pick your favourites");
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }, 2600);
  };

  const makeVariation = (g: Generated) => {
    const seed = g.seed + Math.floor(Math.random() * 9000) + 101;
    const hue = (seed % 300) + 10;
    const v: Generated = { ...g, id: `gen-${Date.now()}-v`, seed, hue, css: artFor(hue), createdAt: Date.now() };
    setResults((r) => [v, ...r]);
    setHistory((h) => [v, ...h].slice(0, 8));
    toast("Variation generated");
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const useSelectedInCampaign = () => {
    if (selected.size === 0) return;
    toast(
      selected.size === 1 ? "Image attached to a new campaign draft" : `${selected.size} images attached to a new campaign draft`,
    );
    onNavigate?.("new-campaign");
  };

  const sendSelectedToApprove = () => {
    if (selected.size === 0) return;
    toast(
      selected.size === 1 ? "Image sent to Approve" : `${selected.size} images sent to Approve`,
    );
    onNavigate?.("approve");
  };

  return (
    <div className="mx-auto w-full max-w-[760px] pb-16">
      {/* Header — content from the existing product */}
      <div className="flex flex-col items-center pt-4 text-center sm:pt-8">
        <Badge tone="primary" className="px-3.5 py-1.5 text-[13px]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Create
        </Badge>
        <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink sm:text-[32px]">
          Create
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-500">
          Describe the ad image you want. Add a reference photo to guide the AI.
        </p>
      </div>

      {/* Composer — the card from the screenshot */}
      <div className="surface mt-8 overflow-hidden p-0">
        <label htmlFor="create-prompt" className="sr-only">
          Describe the ad image you want to create
        </label>
        <textarea
          id="create-prompt"
          ref={textRef}
          value={prompt}
          maxLength={MAX_PROMPT}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              generate();
            }
          }}
          placeholder="Describe the ad image you want to create..."
          rows={4}
          className="block min-h-[132px] w-full resize-y bg-transparent px-4 pt-4 pb-3 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-400 sm:px-5 sm:pt-5 sm:text-[15px]"
        />

        {refs.length > 0 && (
          <ul aria-label="Reference images" className="flex flex-wrap gap-2 px-5 pb-3">
            {refs.map((r) => (
              <li
                key={r.id}
                className="group relative size-14 overflow-hidden rounded-xl border border-line"
                title={r.name}
              >
                {r.src ? (
                  <img src={r.src} alt={r.name} className="size-full object-cover" />
                ) : (
                  <span className="block size-full" style={{ background: r.css }} aria-hidden="true" />
                )}
                <button
                  type="button"
                  onClick={() => setRefs((list) => list.filter((x) => x.id !== r.id))}
                  aria-label={`Remove ${r.name}`}
                  className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-opacity sm:size-6 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
            <li className="flex min-h-14 items-center pl-1 text-[12px] text-ink-500">
              {refs.length}/{MAX_REFS} guiding the style
            </li>
          </ul>
        )}

        <div className="flex flex-col gap-2 border-t border-line-soft px-3 py-3 sm:flex-row sm:items-center sm:px-4">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-label="Add reference image files"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="size-3.5" />}
              onClick={() => fileRef.current?.click()}
              disabled={refs.length >= MAX_REFS}
              className="w-full sm:w-auto"
            >
              Add reference image
            </Button>
            <Button variant="ghost" size="sm" icon={<ImagePlus className="size-4" />} onClick={() => setLibraryOpen(true)} className="w-full sm:w-auto">
              Upload or pick from library
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="num hidden text-[11px] text-ink-400 md:block" aria-hidden="true">
              ⌘↵ to generate
            </span>
            <Button
              variant="primary"
              icon={generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              onClick={generate}
              disabled={!canGenerate}
              className="w-full sm:w-auto"
            >
              {generating ? STAGES[stage] : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -my-1 flex items-center gap-1.5 overflow-x-auto py-1" role="group" aria-label="Aspect ratio">
          <span className="mr-1 shrink-0 text-[12px] text-ink-500">Size</span>
          {ASPECTS.map((a) => (
            <button
              key={a.value}
              type="button"
              aria-pressed={aspect === a.value}
              title={a.hint}
              onClick={() => setAspect(a.value)}
              className={cn(
                "hit-44 inline-flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-[12px] transition-colors",
                aspect === a.value
                  ? "border-primary-500 bg-primary-50 font-medium text-primary-700"
                  : "border-line bg-surface-soft text-ink-700 hover:border-primary-200",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="no-scrollbar -my-1 flex items-center gap-1.5 overflow-x-auto py-1" role="group" aria-label="Style">
          <span className="mr-1 shrink-0 text-[12px] text-ink-500">Style</span>
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={style === s}
              onClick={() => setStyle(s)}
              className={cn(
                "hit-44 inline-flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-[12px] transition-colors",
                style === s
                  ? "border-primary-500 bg-primary-50 font-medium text-primary-700"
                  : "border-line bg-surface-soft text-ink-700 hover:border-primary-200",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Idle suggestions */}
      {!generating && results.length === 0 && (
        <div className="mt-8">
          <p className="text-center text-[12px] tracking-[0.08em] text-ink-400 uppercase">
            Try one to start
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setPrompt(s);
                  textRef.current?.focus();
                }}
                className="rounded-2xl border border-line bg-surface-soft p-4 text-left text-[13px] leading-relaxed text-ink-700 transition-colors hover:border-primary-200 hover:text-ink"
              >
                <Wand2 className="mb-2 size-4 text-primary-600" aria-hidden="true" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div className="mt-8" role="status" aria-live="polite" aria-label="Generating images">
          <ol className="mx-auto flex w-fit max-w-full flex-col gap-3 text-[12px] sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-2">
            {STAGES.map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border text-[11px]",
                    i < stage && "border-primary-500 bg-primary-500 text-white",
                    i === stage && "glow-primary border-primary-500 bg-primary-500 text-white",
                    i > stage && "border-line text-ink-400",
                  )}
                >
                  {i < stage ? <Check className="size-3" aria-hidden="true" /> : i + 1}
                </span>
                <span className={i <= stage ? "text-ink" : "text-ink-400"}>{label}</span>
                {i < STAGES.length - 1 && <span className="mx-1 hidden h-px w-6 bg-line sm:block sm:w-10" aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <div className="mt-5 grid grid-cols-2 gap-3" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl border border-line bg-surface-soft"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !generating && (
        <div ref={resultsRef} className="mt-8 scroll-mt-28">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[16px] font-semibold text-ink">
              Results{" "}
              <span className="num text-[13px] font-normal text-ink-500">
                {aspect} · {style} · {refs.length > 0 ? `${refs.length} reference${refs.length > 1 ? "s" : ""}` : "no reference"}
              </span>
            </h2>
            {selected.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" onClick={useSelectedInCampaign}>
                  Use {selected.size === 1 ? "in campaign" : `${selected.size} in campaign`}
                </Button>
                <Button size="sm" onClick={sendSelectedToApprove}>
                  Send to Approve
                </Button>
              </div>
            )}
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.map((g) => {
              const isSelected = selected.has(g.id);
              return (
                <li
                  key={g.id}
                  className={cn(
                    "group overflow-hidden rounded-2xl border bg-surface transition-colors",
                    isSelected ? "border-primary-500" : "border-line hover:border-primary-200",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(g)}
                    aria-label={`Enlarge image for ${g.prompt.slice(0, 60)}`}
                    className="relative block aspect-square w-full overflow-hidden text-left"
                  >
                    <span className="absolute inset-0" style={{ background: g.css }} aria-hidden="true" />
                    <span
                      className="absolute inset-0 opacity-60"
                      style={{
                        background: `radial-gradient(45% 38% at 50% 62%, rgba(255,255,255,0.28), transparent 70%)`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="absolute top-3 left-3 flex gap-1.5">
                      <span className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                        {g.style}
                      </span>
                      <span className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                        {g.aspect}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border backdrop-blur transition-colors",
                        isSelected
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-white/25 bg-black/45 text-white/80",
                      )}
                      aria-hidden="true"
                    >
                      <Check className="size-4" />
                    </span>
                  </button>
                  <div className="flex items-center gap-1 border-t border-line-soft p-2">
                    <button
                      type="button"
                      onClick={() => toggleSelect(g.id)}
                      aria-pressed={isSelected}
                      className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[12px] font-medium text-ink-700 transition-colors hover:bg-primary-50 hover:text-ink"
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                    <button
                      type="button"
                      onClick={() => makeVariation(g)}
                      aria-label="Make a variation"
                      title="Variation"
                      className="flex size-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-primary-50 hover:text-ink"
                    >
                      <RefreshCw className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ok = downloadArtwork(g);
                        toast(ok ? "Image downloaded as PNG" : "Download failed in this browser", ok ? "success" : "danger");
                      }}
                      aria-label="Download as PNG"
                      title="Download"
                      className="flex size-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-primary-50 hover:text-ink"
                    >
                      <Download className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResults((r) => r.filter((x) => x.id !== g.id));
                        setSelected((s) => {
                          const n = new Set(s);
                          n.delete(g.id);
                          return n;
                        });
                      }}
                      aria-label="Discard image"
                      title="Discard"
                      className="flex size-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 max-w-md flex-1 truncate text-[12px] text-ink-500" title={results[0]?.prompt}>
              “{results[0]?.prompt}”
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="size-3.5" />}
              onClick={generate}
              disabled={generating}
              className="shrink-0"
            >
              Regenerate
            </Button>
          </div>
        </div>
      )}

      {/* Recent */}
      {history.length > 0 && !generating && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink">Recent generations</h2>
            <span className="num text-[12px] text-ink-500">{history.length} saved on this device</span>
          </div>
          <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {history.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(h.prompt);
                    setAspect(h.aspect);
                    setStyle(h.style);
                    textRef.current?.focus();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title={`${h.prompt.slice(0, 80)} · ${timeAgo(h.createdAt)}`}
                  aria-label={`Reuse prompt from ${timeAgo(h.createdAt)}`}
                  className="block aspect-square w-full overflow-hidden rounded-xl border border-line transition-colors hover:border-primary-200"
                >
                  <span className="block size-full" style={{ background: h.css }} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-[12px] text-ink-400">
            Images are AI-generated drafts. Send the keepers to Approve before they go near a campaign.
          </p>
        </div>
      )}

      {/* Library picker */}
      <Dialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="Reference library"
        description="Pick a photo to guide composition, colour and mood. It stays attached to your next generation."
        footer={
          <>
            <Button onClick={() => setLibraryOpen(false)}>Cancel</Button>
            <Button
              variant="secondary"
              icon={<Plus className="size-4" />}
              onClick={() => {
                setLibraryOpen(false);
                fileRef.current?.click();
              }}
            >
              Upload new
            </Button>
          </>
        }
      >
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LIBRARY.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => addFromLibrary(item)}
                className="group block w-full overflow-hidden rounded-xl border border-line text-left transition-colors hover:border-primary-500"
              >
                <span className="block aspect-[4/3] w-full" style={{ background: item.css }} aria-hidden="true" />
                <span className="flex items-center justify-between px-2.5 py-2 text-[12px] text-ink">
                  {item.name}
                  <Plus className="size-3.5 text-ink-400 group-hover:text-primary-600" aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Dialog>

      {/* Lightbox */}
      <Dialog
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        title={lightbox ? `${lightbox.style} · ${lightbox.aspect}` : ""}
        description={lightbox?.prompt}
        footer={
          lightbox && (
            <>
              <Button
                variant="secondary"
                icon={<Download className="size-4" />}
                onClick={() => {
                  const ok = downloadArtwork(lightbox);
                  toast(ok ? "Image downloaded as PNG" : "Download failed in this browser", ok ? "success" : "danger");
                }}
              >
                Download
              </Button>
              <Button
                variant="primary"
                icon={<Send className="size-4" />}
                onClick={() => {
                  setLightbox(null);
                  toast("Image attached to a new campaign draft");
                  onNavigate?.("new-campaign");
                }}
              >
                Use in campaign
              </Button>
            </>
          )
        }
      >
        {lightbox && (
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="aspect-square w-full" style={{ background: lightbox.css }} role="img" aria-label={lightbox.prompt} />
          </div>
        )}
      </Dialog>
    </div>
  );
}
