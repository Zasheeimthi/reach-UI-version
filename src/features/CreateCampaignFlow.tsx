import * as React from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Rocket,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Button, Field, Input, Select, Skeleton, Textarea, type ToastFn } from "../components/ui";
import PlatformMark from "../components/PlatformMark";
import { channels, fmt, objectives, type Channel } from "../lib/data";
import "./campaign-builder.css";

/* ------------------------------------------------------------------ Model */
type Values = {
  name: string;
  objective: string;
  channel: Channel[];
  location: string;
  interests: string[];
  dailyBudget: number;
  duration: string;
  startDate: string;
  headline: string;
  primaryText: string;
  cta: string;
  creative: number | null;
  upload: { name: string; src: string } | null;
  specialCategory: boolean;
};

const empty: Values = {
  name: "",
  objective: "",
  channel: ["google"],
  location: "Stockholm, Sweden",
  interests: ["Indian cuisine", "Restaurants"],
  dailyBudget: 100,
  duration: "30",
  startDate: new Date().toISOString().slice(0, 10),
  headline: "",
  primaryText: "",
  cta: "Learn more",
  creative: null,
  upload: null,
  specialCategory: false,
};

const steps = [
  { key: "goal", title: "Campaign & goal", hint: "Name and objective", description: "Give your campaign a name and a clear purpose." },
  { key: "audience", title: "Audience", hint: "Platforms and people", description: "Choose where your campaign runs and who sees it." },
  { key: "budget", title: "Budget & schedule", hint: "Spend and timing", description: "Set a budget and a schedule that work for you." },
  { key: "creative", title: "Creative", hint: "Copy and media", description: "Bring your message to life. Watch the preview update." },
  { key: "review", title: "Review & launch", hint: "Check and publish", description: "Review every detail before you launch." },
] as const;

const ctaByObjective: Record<string, string> = {
  traffic: "Learn more",
  sales: "Shop now",
  leads: "Get quote",
  awareness: "Learn more",
  installs: "Install now",
  engagement: "See more",
};

const suggestedInterests = ["Food & dining", "Takeaway", "Family dining", "Weekend brunch", "Catering"];

/* Creative library — gradients stand in for real assets */
const library = [
  { id: 0, name: "Thali-hero.jpg", css: "linear-gradient(135deg,#3b1f6e 0%,#7c3aed 55%,#f472b6 100%)" },
  { id: 1, name: "Dosa-closeup.jpg", css: "linear-gradient(135deg,#0f2a3a 0%,#1d6f8f 60%,#4ade80 100%)" },
  { id: 2, name: "Chef-portrait.jpg", css: "linear-gradient(135deg,#3a1f0f 0%,#b45309 55%,#fbbf24 100%)" },
];

const connected: Channel[] = ["google", "microsoft"];
const durationLabel = (d: string) => (d ? `${d} days` : "Continuous");
const DRAFT_KEY = "reach.campaign-builder.draft.v1";

function readDraft(): Values {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!raw || typeof raw !== "object") return { ...empty };
    const text = (key: "name" | "location" | "headline" | "primaryText" | "cta"): string =>
      typeof raw[key] === "string" ? raw[key] : empty[key];
    return {
      ...empty,
      name: text("name"),
      objective: objectives.some((goal) => goal.key === raw.objective) ? raw.objective : "",
      channel: Array.isArray(raw.channel) ? raw.channel.filter((c: Channel) => connected.includes(c)) : [...empty.channel],
      location: text("location"),
      interests: Array.isArray(raw.interests) ? raw.interests.filter((value: unknown) => typeof value === "string") : [...empty.interests],
      dailyBudget: typeof raw.dailyBudget === "number" && Number.isFinite(raw.dailyBudget) ? raw.dailyBudget : empty.dailyBudget,
      duration: ["", "7", "14", "30", "60"].includes(raw.duration) ? raw.duration : empty.duration,
      startDate: typeof raw.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.startDate) ? raw.startDate : empty.startDate,
      headline: text("headline"),
      primaryText: text("primaryText"),
      cta: text("cta"),
      creative: library.some((item) => item.id === raw.creative) ? raw.creative : null,
      upload: raw.upload && typeof raw.upload.name === "string" && typeof raw.upload.src === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(raw.upload.src)
        ? { name: raw.upload.name, src: raw.upload.src }
        : null,
      specialCategory: raw.specialCategory === true,
    };
  } catch {
    return { ...empty };
  }
}

function validateStep(values: Values, stage: number) {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (stage === 0) {
    if (!values.name.trim()) errors.name = "Give the campaign a name so your team can find it.";
    if (!values.objective) errors.objective = "Choose a campaign goal.";
  }
  if (stage === 1) {
    if (values.channel.length === 0) errors.channel = "Choose at least one connected platform.";
    if (!values.location.trim()) errors.location = "Add where your audience is located.";
  }
  if (stage === 2) {
    if (!Number.isFinite(values.dailyBudget) || values.dailyBudget < 10 || values.dailyBudget > 2000) {
      errors.dailyBudget = "Choose a daily budget between kr10 and kr2,000.";
    }
    if (!values.startDate || Number.isNaN(Date.parse(values.startDate))) errors.startDate = "Choose a valid start date.";
  }
  if (stage === 3) {
    if (values.headline.trim().length < 4 || values.headline.length > 40) errors.headline = "Use between 4 and 40 characters for your headline.";
    if (values.primaryText.trim().length < 12) errors.primaryText = "Primary text needs at least 12 characters.";
    if (values.creative === null && !values.upload) errors.creative = "Choose an image for your ad.";
  }
  return errors;
}

/* ------------------------------------------------------------ Ad preview
   A real mock of what people will see: platform chrome, media, copy and
   CTA. It starts as a placeholder and fills in as the form does.         */
function AdPreview({ values, brand }: { values: Values; brand: string }) {
  const platform = values.channel[0] ?? "google";
  const creative = values.creative !== null ? library[values.creative] : null;
  const headline = values.headline.trim();
  const body = values.primaryText.trim();
  const filled = [headline, body, values.upload || creative].filter(Boolean).length;

  return (
    <div className="builder-ad">
      {/* Platform chrome */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[12px] font-semibold text-white">
          {brand.charAt(0)}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[14px] font-semibold leading-4 text-ink">{brand}</p>
          <p className="flex items-center gap-1 text-[12px] leading-4 text-ink-500">
            Sponsored <span aria-hidden="true">·</span> <Globe className="size-3" aria-hidden="true" />
          </p>
        </div>
        <PlatformMark channel={platform} size={18} />
      </div>

      {/* Primary text */}
      <p className={cn("break-words px-4 py-2 text-[12px] leading-5", body ? "text-ink-700" : "text-ink-500")}>
        {body || "Your ad copy will appear here as you build your creative."}
      </p>

      {/* Media */}
      <div className="builder-ad-media">
        {values.upload ? (
          <img src={values.upload.src} alt={values.upload.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : creative ? (
          <div className="absolute inset-0 transition-opacity" style={{ background: creative.css }} aria-hidden="true" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-soft text-ink-400">
            <ImagePlus className="size-6" aria-hidden="true" />
            <span className="text-[12px]">Your campaign creative</span>
          </div>
        )}
        {creative && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur">
            {creative.name}
          </span>
        )}
      </div>

      {/* Headline + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-soft px-4 py-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] tracking-wide text-ink-500 uppercase">
            {values.location.split(",")[0] || "yourwebsite.com"}
          </p>
          <p className={cn("mt-1 break-words text-[14px] font-semibold", headline ? "text-ink" : "text-ink-500")}>
            {headline || "Your campaign headline"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink">
          {values.cta}
        </span>
      </div>

      {/* Engagement row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-[12px] text-ink-500" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5"><Heart className="size-3.5" aria-hidden="true" /> Like</span>
        <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-3.5" aria-hidden="true" /> Comment</span>
        <span className="inline-flex items-center gap-1.5"><Share2 className="size-3.5" aria-hidden="true" /> Share</span>
      </div>

      <div className="sr-only" aria-live="polite">
        Preview {filled} of 3 elements complete
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Page */
export default function CreateCampaignFlow({
  onDone,
  toast,
}: {
  onDone: () => void;
  toast: ToastFn;
}) {
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [values, setValues] = React.useState<Values>(readDraft);
  const [touched, setTouched] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [saved, setSaved] = React.useState("Saving draft...");
  const [launching, setLaunching] = React.useState(false);
  const [published, setPublished] = React.useState(false);
  const [interestDraft, setInterestDraft] = React.useState("");
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const uploadRef = React.useRef<HTMLInputElement>(null);

  const brand = "Artomic";

  const saveDraft = React.useCallback((notify = false) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      setSaved("Saved on this device");
      if (notify) toast("Draft saved on this device");
    } catch {
      setSaved("Unable to save locally");
      if (notify) toast("This browser couldn't save the draft. Please allow local storage.", "danger");
    }
  }, [values, toast]);

  React.useEffect(() => {
    if (published) return;
    setSaved("Saving draft...");
    const timer = window.setTimeout(() => saveDraft(), 400);
    return () => window.clearTimeout(timer);
  }, [saveDraft, published]);

  const set = <K extends keyof Values>(k: K, v: Values[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  };

  const validations = React.useMemo(() => [0, 1, 2, 3].map((stage) => validateStep(values, stage)), [values]);
  const errors: Partial<Record<keyof Values, string>> = step === 4
    ? Object.assign({}, ...validations)
    : validations[step];

  const stepValid = Object.keys(errors).length === 0;
  const totalBudget = values.dailyBudget * Number(values.duration || 0);
  const reach = values.channel.length === 0 ? 0 : Math.round(Math.max(0, values.dailyBudget) * 152 * Math.max(1, values.channel.length * 0.85));
  const objectiveLabel = objectives.find((o) => o.key === values.objective)?.label;

  const goTo = (i: number) => {
    setStep(i);
    setFurthestStep((previous) => Math.max(previous, i));
    setTouched(false);
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  const next = () => {
    if (launching || generating || published) return;
    setTouched(true);
    if (!stepValid) {
      if (step === 4) {
        const firstInvalid = validations.findIndex((item) => Object.keys(item).length > 0);
        if (firstInvalid !== -1) setStep(firstInvalid);
      }
      toast("Fix the highlighted field before continuing", "danger");
      return;
    }
    if (step === steps.length - 1) {
      setLaunching(true);
      window.setTimeout(() => {
        setLaunching(false);
        setPublished(true);
        toast(`“${values.name}” submitted to ${values.channel.map((c) => channels[c].label).join(" and ")}`);
      }, 1600);
      return;
    }
    goTo(step + 1);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !e.repeat) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const writeWithAI = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setValues((v) => ({
        ...v,
        headline: v.headline || "Authentic South Indian, made fresh daily",
        primaryText:
          v.primaryText ||
          "Dosas, thalis and filter coffee the way they're meant to be. Book a table this week and your first chai is on us.",
        creative: v.creative ?? 0,
      }));
      setGenerating(false);
      toast("Ad copy written in your brand voice", "success");
    }, 1100);
  };

  const addInterest = (raw: string) => {
    const v = raw.trim();
    if (!v || values.interests.some((i) => i.toLowerCase() === v.toLowerCase())) return;
    set("interests", [...values.interests, v]);
    setInterestDraft("");
  };

  const uploadImage = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      toast("Choose a JPG, PNG or WebP image smaller than 2 MB.", "danger");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const src = reader.result;
      setValues((current) => ({ ...current, creative: null, upload: { name: file.name, src } }));
      toast("Image added to your ad preview");
    };
    reader.onerror = () => toast("This image couldn't be read. Try a different file.", "danger");
    reader.readAsDataURL(file);
  };

  /* ------------------------------------------------------------- Success */
  if (published) {
    return (
      <div className="mx-auto max-w-2xl py-6">
        <div className="surface relative overflow-hidden p-6 text-center sm:p-12">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70"
            style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(124,58,237,0.35), transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative">
            <div className="glow-primary mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary-500 text-white">
              <Check className="size-7" aria-hidden="true" />
            </div>
            <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              {values.name} is in review
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-500">
              Submitted to {values.channel.map((c) => channels[c].label).join(" and ")}. Most reviews finish within
              24 hours — we'll notify you the moment it's live.
            </p>

            <dl className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-4 text-left sm:grid-cols-4">
              {[
                ["Goal", objectiveLabel ?? "—"],
                ["Daily", fmt.kr(values.dailyBudget)],
                ["Duration", durationLabel(values.duration)],
                ["Total", values.duration ? fmt.kr(totalBudget) : "Ongoing"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl border border-line bg-surface-soft p-3">
                  <dt className="text-[11px] text-ink-500">{l}</dt>
                  <dd className="num mt-1 truncate text-[14px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="primary" onClick={onDone}>
                Go to campaigns
              </Button>
              <Button
                onClick={() => {
                  setValues(empty);
                  setStep(0);
                  setFurthestStep(0);
                  setPublished(false);
                }}
              >
                Create another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- Flow */
  const error = (k: keyof Values) => (touched ? errors[k] : undefined);

  return (
    <div className="campaign-builder">
      <div className="builder-workspace">
      <nav aria-label="Campaign steps" className="builder-panel builder-steps">
        <header className="builder-panel-header">
          <div>
            <h2>Campaign setup</h2>
            <p className="num">Step {step + 1} of {steps.length}</p>
          </div>
        </header>
        <ol className="builder-step-list">
          {steps.map((s, i) => {
            const complete = i < furthestStep && i < 4 && Object.keys(validations[i]).length === 0;
            const state = i === step ? "current" : complete ? "done" : "todo";
            return (
              <li key={s.key} className="min-w-0">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  disabled={i > furthestStep || launching}
                  aria-current={state === "current" ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  className="builder-step"
                  data-state={state}
                >
                  <span className="builder-step-number num" aria-hidden="true">
                    {state === "done" ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="builder-step-copy min-w-0">
                    <strong>{s.title}</strong>
                    <small>{s.hint}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="builder-steps-footer">
          <div className="h-1 overflow-hidden rounded-full bg-line-soft" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label="Setup progress">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brand-glow transition-[width]" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
          <p className="text-[12px] leading-5 text-ink-500">Nothing goes live until you launch.</p>
        </div>
      </nav>

      <form className="builder-panel builder-editor" noValidate onSubmit={(event) => { event.preventDefault(); next(); }} aria-labelledby="builder-step-title">
        <header className="builder-panel-header">
          <div className="min-w-0">
            <h1 id="builder-step-title" ref={headingRef} tabIndex={-1} className="scroll-mt-32 outline-none">
              {steps[step].title}
            </h1>
            <p>{steps[step].description}</p>
          </div>
        </header>

        <div className="builder-fields">
          {/* ---- Step 1 */}
          {step === 0 && (
            <div className="builder-step-content">
              <Field label="Campaign name" htmlFor="c-name" error={error("name")} hint="Only your team sees this name. It won't appear in your ad.">
                <Input
                  id="c-name"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Weekend Brunch, Stockholm"
                  invalid={!!error("name")}
                  aria-describedby="c-name-message"
                  className="builder-control"
                />
              </Field>

              <fieldset className="min-w-0" aria-describedby={error("objective") ? "objective-error" : "objective-hint"}>
                <legend className="text-[14px] font-semibold text-ink">What do you want to achieve?</legend>
                <p id="objective-hint" className="builder-section-copy">Choose one goal to guide your campaign's delivery.</p>
                <div className="builder-choice-grid">
                  {objectives.map((o) => {
                    const active = values.objective === o.key;
                    return (
                      <label key={o.key} className="builder-choice" data-selected={active}>
                        <input
                          type="radio"
                          name="campaign-objective"
                          value={o.key}
                          checked={active}
                          onChange={() => {
                            set("objective", o.key);
                            set("cta", ctaByObjective[o.key] ?? "Learn more");
                          }}
                          className="size-4 shrink-0 accent-primary-500"
                        />
                        <span className="min-w-0">
                          <strong>{o.label}</strong>
                          <small>{o.hint}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {error("objective") && <p id="objective-error" className="mt-4 text-[12px] text-danger">{error("objective")}</p>}
              </fieldset>
            </div>
          )}

          {/* ---- Step 2 */}
          {step === 1 && (
            <div className="builder-step-content">
              <div>
                <h2 className="text-[14px] font-semibold text-ink">Where should your ad run?</h2>
                <p className="builder-section-copy">Choose one or both of your connected platforms.</p>
                <div className="builder-platform-grid" role="group" aria-label="Campaign platforms">
                  {(Object.keys(channels) as Channel[]).map((c) => {
                    const active = values.channel.includes(c);
                    const isConnected = connected.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set("channel", active ? values.channel.filter((x) => x !== c) : [...values.channel, c])}
                        aria-pressed={active}
                        disabled={!isConnected}
                        className="builder-platform"
                      >
                        <PlatformMark channel={c} size={20} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-medium text-ink">{channels[c].label}</span>
                          <span className="mt-1 block text-[12px] text-ink-500">{isConnected ? "Connected" : "Not connected"}</span>
                        </span>
                        {active && <Check className="size-4 shrink-0 text-primary-700" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
                {error("channel") && <p className="mt-4 text-[12px] text-danger">{error("channel")}</p>}
              </div>

              <Field label="Audience location" htmlFor="c-loc" error={error("location")} hint="City, region or country. People outside this area won't see the ad.">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                  <Input id="c-loc" value={values.location} onChange={(e) => set("location", e.target.value)} invalid={!!error("location")} aria-describedby="c-loc-message" className="builder-control pl-11" />
                </div>
              </Field>

              <div>
                <label htmlFor="c-interest" className="block text-[12px] font-medium text-ink-700">Interests</label>
                <p className="builder-section-copy">Type an interest and press Enter, or pick a suggestion.</p>
                <ul className="flex flex-wrap gap-2" aria-label="Selected interests">
                  {values.interests.map((i) => (
                    <li key={i} className="min-w-0 max-w-full">
                      <span className="inline-flex min-h-12 max-w-full items-center gap-2 rounded-full border border-primary-200 bg-primary-50 pr-1 pl-4 text-[12px] text-ink">
                        <span className="min-w-0 truncate">{i}</span>
                        <button
                          type="button"
                          onClick={() => set("interests", values.interests.filter((x) => x !== i))}
                          aria-label={`Remove ${i}`}
                          className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-primary-100 hover:text-ink"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      </span>
                    </li>
                  ))}
                  <li className="min-w-0 basis-40 flex-1">
                    <input
                      id="c-interest"
                      value={interestDraft}
                      onChange={(e) => setInterestDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInterest(interestDraft);
                        }
                        if (e.key === "Backspace" && !interestDraft && values.interests.length) {
                          set("interests", values.interests.slice(0, -1));
                        }
                      }}
                      placeholder="Add an interest…"
                      className="builder-control w-full border border-line bg-surface-soft px-4 text-ink placeholder:text-ink-400"
                    />
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] text-ink-500">Suggested:</span>
                  {suggestedInterests
                    .filter((s) => !values.interests.includes(s))
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addInterest(s)}
                        className="min-h-11 rounded-full border border-line px-4 text-[12px] text-ink-700 transition-colors hover:border-primary-200 hover:text-ink"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 3 */}
          {step === 2 && (
            <div className="builder-step-content">
              <Field label="Daily budget" htmlFor="c-budget" error={error("dailyBudget")} hint="We'll pace spend evenly across the day and stop at the cap.">
                <div className="builder-budget-control">
                  <input
                    type="range"
                    min={10}
                    max={2000}
                    step={10}
                    value={values.dailyBudget}
                    onChange={(e) => set("dailyBudget", Number(e.target.value))}
                    aria-label="Daily budget in Swedish kronor"
                    className="h-12 min-w-0 w-full"
                  />
                  <div className="relative min-w-0">
                    <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[14px] text-ink-500">kr</span>
                    <Input
                      id="c-budget"
                      type="number"
                      min={10}
                      max={2000}
                      value={values.dailyBudget}
                      onChange={(e) => set("dailyBudget", Number(e.target.value))}
                      className="builder-control num pl-10"
                      invalid={!!error("dailyBudget")}
                      aria-describedby="c-budget-message"
                    />
                  </div>
                </div>
              </Field>

              <div className="builder-field-grid">
                <Field label="Duration" htmlFor="c-dur">
                  <Select id="c-dur" value={values.duration} onChange={(e) => set("duration", e.target.value)} className="builder-control">
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="">Run continuously</option>
                  </Select>
                </Field>
                <Field label="Start date" htmlFor="c-start" error={error("startDate")} hint="Starts at 00:00 in your timezone.">
                  <Input id="c-start" type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} invalid={!!error("startDate")} aria-describedby="c-start-message" className="builder-control" />
                </Field>
              </div>

              <dl className="builder-summary-grid">
                {[
                  ["Daily total", fmt.kr(values.dailyBudget)],
                  ["Campaign total", values.duration ? fmt.kr(totalBudget) : "Ongoing"],
                  ["Est. daily results", `${Math.max(1, Math.round(values.dailyBudget / 6.5))}`],
                ].map(([l, v]) => (
                  <div key={l} className="min-w-0">
                    <dt>{l}</dt>
                    <dd className="num">{v}</dd>
                  </div>
                ))}
              </dl>

              <label className="flex min-h-12 items-start gap-4 rounded-xl border border-line bg-surface-soft p-4 text-[14px] text-ink-700">
                <input
                  type="checkbox"
                  checked={values.specialCategory}
                  onChange={(e) => set("specialCategory", e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-primary-500"
                />
                <span>
                  <span className="block text-ink">This ad belongs to a special ad category</span>
                  <span className="block text-[12px] text-ink-500">Required for credit, employment, housing, social issues or politics.</span>
                </span>
              </label>
            </div>
          )}

          {/* ---- Step 4 */}
          {step === 3 && (
            <div className="builder-step-content">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium text-ink">Ad version 1</p>
                  <p className="text-[12px] text-ink-500">Everything you write here updates the preview instantly.</p>
                </div>
                <Button variant="outline" icon={<Sparkles className="size-4" />} loading={generating} onClick={writeWithAI}>
                  Write with AI
                </Button>
              </div>

              {generating ? (
                <div className="space-y-3" role="status" aria-label="Writing ad copy">
                  <Skeleton className="h-11 w-full rounded-full" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ) : (
                <>
                  <Field label="Headline" htmlFor="c-head" error={error("headline")} hint={`${values.headline.length}/40 characters`}>
                    <Input
                      id="c-head"
                      value={values.headline}
                      maxLength={40}
                      onChange={(e) => set("headline", e.target.value)}
                      placeholder="Short headline for your ad"
                      invalid={!!error("headline")}
                      aria-describedby="c-head-message"
                      className="builder-control"
                    />
                  </Field>

                  <Field label="Primary text" htmlFor="c-text" error={error("primaryText")} hint={`${values.primaryText.length}/125 characters recommended`}>
                    <Textarea
                      id="c-text"
                      value={values.primaryText}
                      maxLength={220}
                      onChange={(e) => set("primaryText", e.target.value)}
                      placeholder="What people read before they tap the button"
                      invalid={!!error("primaryText")}
                      aria-describedby="c-text-message"
                      className="builder-control"
                    />
                  </Field>

                  <Field label="Call to action" htmlFor="c-cta">
                    <Select id="c-cta" value={values.cta} onChange={(e) => set("cta", e.target.value)} className="builder-control">
                      {["Learn more", "Shop now", "Book now", "Get quote", "Sign up", "Install now", "See more"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>

                  <fieldset className="min-w-0">
                    <legend className="text-[12px] font-medium text-ink-700">Media</legend>
                    <p className="builder-section-copy">Pick from your library or upload something new.</p>
                    <div className="builder-media-grid">
                      {library.map((m) => {
                        const active = values.creative === m.id && !values.upload;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setValues((current) => ({ ...current, creative: m.id, upload: null }))}
                            aria-pressed={active}
                            aria-label={`Use ${m.name}`}
                            className={cn(
                              "group relative aspect-[16/10] overflow-hidden rounded-xl border transition-colors",
                              active ? "border-primary-500" : "border-transparent hover:border-primary-200",
                            )}
                          >
                            <span className="absolute inset-0" style={{ background: m.css }} aria-hidden="true" />
                            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 pt-6 pb-1.5 text-left text-[10px] text-white">
                              {m.name}
                            </span>
                            {active && (
                              <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary-500 text-white">
                                <Check className="size-3.5" aria-hidden="true" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <input
                        ref={uploadRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        aria-label="Upload a campaign image"
                        onChange={(event) => {
                          uploadImage(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => uploadRef.current?.click()}
                        aria-label={values.upload ? `Replace ${values.upload.name}` : "Upload a campaign image"}
                        className={cn(
                          "relative flex aspect-[16/10] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border text-[12px] text-ink-500 transition-colors hover:border-primary-500 hover:text-ink",
                          values.upload ? "border-primary-500" : "border-dashed border-line",
                        )}
                      >
                        {values.upload ? (
                          <>
                            <img src={values.upload.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                            <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 p-2 text-[12px] text-white">{values.upload.name}</span>
                            <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary-500 text-white"><Check className="size-4" /></span>
                          </>
                        ) : (
                          <><ImagePlus className="size-5" aria-hidden="true" />Upload</>
                        )}
                      </button>
                    </div>
                    {error("creative") && <p className="mt-4 text-[12px] text-danger">{error("creative")}</p>}
                  </fieldset>
                </>
              )}
            </div>
          )}

          {/* ---- Step 5 */}
          {step === 4 && (
            <div className="builder-step-content">
              <p className="text-[14px] text-ink-500">Check the details below. Everything can still be edited after launch.</p>
              <dl className="divide-y divide-line-soft">
                {[
                  { l: "Campaign", v: values.name || "Untitled campaign", step: 0 },
                  { l: "Goal", v: objectiveLabel ?? "—", step: 0 },
                  { l: "Platforms", v: values.channel.map((c) => channels[c].label).join(", ") || "—", step: 1 },
                  { l: "Audience", v: `${values.location} · ${values.interests.length} interest${values.interests.length === 1 ? "" : "s"}`, step: 1 },
                  { l: "Budget", v: `${fmt.kr(values.dailyBudget)} daily · ${durationLabel(values.duration).toLowerCase()}`, step: 2 },
                  { l: "Starts", v: values.startDate ? fmt.date(values.startDate) : "Not set", step: 2 },
                  { l: "Creative", v: values.headline || "No headline yet", step: 3 },
                ].map((r) => (
                  <div key={r.l} className="builder-review-row">
                    <dt>{r.l}</dt>
                    <dd>{r.v}</dd>
                    <Button size="sm" variant="ghost" onClick={() => goTo(r.step)}>Edit</Button>
                  </div>
                ))}
              </dl>
              <div className="rounded-xl border border-line bg-surface-soft p-4 text-[12px] leading-relaxed text-ink-500">
                Payment is handled by each ad platform. Make sure a payment method is on file before launching — Reach never charges your card.
              </div>
            </div>
          )}
          {touched && !stepValid && (
            <p role="alert" className="mt-6 text-[12px] text-danger">Fix the highlighted fields before continuing.</p>
          )}
        </div>

        <footer className="builder-actions">
          <div className="builder-actions-row">
          <Button variant="ghost" icon={<ChevronLeft className="size-4" />} disabled={step === 0 || launching} onClick={() => goTo(Math.max(0, step - 1))}>
            Back
          </Button>
          <span className="builder-save-state text-[12px] text-ink-500" role="status">{saved}</span>
          <div className="builder-actions-right">
            <Button variant="secondary" onClick={() => saveDraft(true)} disabled={launching}>
              Save draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={launching}
              icon={step === steps.length - 1 ? <Rocket className="size-4" /> : <ChevronRight className="size-4" />}
              disabled={generating}
            >
              {step === steps.length - 1 ? (launching ? "Launching…" : "Launch campaign") : "Continue"}
            </Button>
          </div>
          </div>
        </footer>
      </form>

      <aside className="builder-panel builder-preview" aria-label="Live preview">
        <header className="builder-panel-header">
          <div>
            <h2>Live preview</h2>
            <p className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" />Updates as you type</p>
          </div>
        </header>

        <div className="builder-preview-body">
        <AdPreview values={values} brand={brand} />

        <dl className="builder-preview-meta">
          {[
            ["Est. reach / day", reach.toLocaleString("en-US")],
            ["Daily spend", fmt.kr(values.dailyBudget)],
            ["Platforms", values.channel.length ? values.channel.map((c) => channels[c].short).join(", ") : "None selected"],
            ["Runs for", durationLabel(values.duration)],
          ].map(([l, v]) => (
            <div key={l} className="min-w-0">
              <dt>{l}</dt>
              <dd className="num">{v}</dd>
            </div>
          ))}
        </dl>
        </div>
        <footer className="builder-preview-footer">
          {step < 3 ? (
            <button type="button" onClick={() => goTo(3)} className="inline-flex min-h-11 items-center gap-2 text-left text-[12px] text-primary-700 hover:text-ink">
              <Send className="size-4 shrink-0" aria-hidden="true" />Edit ad creative
            </button>
          ) : (
            <p className="text-[12px] leading-5 text-ink-500">Preview only. Layouts and delivery may vary by platform.</p>
          )}
        </footer>
      </aside>
      </div>
    </div>
  );
}
