import { AlertTriangle } from "lucide-react";
import { Badge, Button, Progress } from "../components/ui";
import { Sparkline } from "../components/charts";
import PlatformMark from "../components/PlatformMark";
import type { Campaign, Status } from "../lib/data";
import { channels, fmt, statusMeta } from "../lib/data";

export default function CampaignDrawer({
  campaign,
  onEdit,
  onToast,
  onSetStatus,
  onDelete,
  onRetry,
  onFixBilling,
}: {
  campaign: Campaign;
  onEdit: (c: Campaign) => void;
  onToast: (m: string, t?: "success" | "danger" | "info") => void;
  onSetStatus?: (next: Status) => void;
  onDelete?: () => void;
  onRetry?: () => void;
  onFixBilling?: () => void;
}) {
  const status = statusMeta[campaign.status];
  const ctr = campaign.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const cpa = campaign.conversions ? campaign.spent / campaign.conversions : 0;
  const monthCap = campaign.dailyBudget * 30;
  const pacing = (campaign.spent / monthCap) * 100;
  const hasDelivery = campaign.impressions > 0;
  const failed = campaign.status === "failed";

  return (
    <div className="space-y-8">
      {/* A failed campaign opens on the problem and the ways out of it */}
      {failed && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-ink">This campaign can't deliver</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-700">
                {campaign.note ?? `Publishing failed on ${channels[campaign.channel].label}.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {onFixBilling && (
                  <Button size="sm" variant="primary" onClick={onFixBilling}>
                    Fix billing
                  </Button>
                )}
                {onRetry && (
                  <Button size="sm" variant="secondary" onClick={onRetry}>
                    Retry publish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={status.tone}>{status.label}</Badge>
        <span className="inline-flex items-center gap-2 text-[12px] text-ink-700">
          <PlatformMark channel={campaign.channel} size={16} />
          {channels[campaign.channel].label}
        </span>
        <span className="text-[12px] text-ink-500">{campaign.objective}</span>
        {campaign.type && (
          <span className="rounded border border-primary-200 bg-primary-50 px-1.5 py-px text-[12px] text-primary-700">
            {campaign.type}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        {[
          { l: "Spend", v: fmt.money(campaign.spent) },
          { l: "Impressions", v: fmt.int(campaign.impressions) },
          { l: "Clicks", v: fmt.int(campaign.clicks) },
          { l: "Conversions", v: fmt.int(campaign.conversions) },
        ].map((m) => (
          <div key={m.l}>
            <dt className="text-[12px] text-ink-500">{m.l}</dt>
            <dd className="num mt-1 text-[20px] font-medium text-ink">{m.v}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="text-[12px] font-medium text-ink-700">Performance, last 30 days</p>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { l: "CTR", v: hasDelivery ? fmt.pct(ctr) : "—" },
            { l: "Cost per result", v: cpa ? fmt.kr(cpa) : "—" },
            { l: "Reach", v: hasDelivery ? fmt.int(campaign.reach) : "—" },
          ].map((s) => (
            <div key={s.l}>
              <p className="num text-[14px] text-ink sm:text-[16px]">{s.v}</p>
              <p className="text-[12px] text-ink-500">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          {hasDelivery ? (
            <Sparkline data={campaign.trend} height={56} tone="primary" />
          ) : (
            <p className="rounded-xl border border-dashed border-line px-4 py-4 text-center text-[12px] text-ink-500">
              No delivery yet — the trend appears once {channels[campaign.channel].label} reports
              impressions.
            </p>
          )}
        </div>
      </div>

      <hr className="border-line-soft" />

      <section>
        <h3 className="text-[14px] font-semibold text-ink">Budget &amp; schedule</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-ink-500">Daily budget</span>
            <span className="num text-ink">{fmt.kr(campaign.dailyBudget)}</span>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-[12px]">
              <span className="text-ink-500">Month to date</span>
              <span className="num text-ink-700">
                {fmt.money(campaign.spent)} of {fmt.money(monthCap)}
              </span>
            </div>
            <Progress
              value={pacing}
              tone={pacing > 90 ? "warning" : "primary"}
              label="Budget pacing"
            />
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-ink-500">Flight</span>
            <span className="num text-ink">
              {fmt.date(campaign.startDate)} →{" "}
              {campaign.endDate ? fmt.date(campaign.endDate) : "Ongoing"}
            </span>
          </div>
        </div>
      </section>

      <hr className="border-line-soft" />

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-ink">Ad versions</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(campaign)}>
            Manage
          </Button>
        </div>
        <ul className="mt-4 space-y-3">
          {Array.from({ length: Math.min(3, campaign.ads) }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 rounded-xl border border-line p-3">
              <span
                className="ad-version-preview size-12 shrink-0 rounded-md"
                data-alternate={i % 2 !== 0}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-ink">
                  Version {i + 1} — {campaign.channel === "x" ? "static" : "carousel"}
                </p>
                <p className="truncate text-[12px] text-ink-500">
                  Primary text and headline set
                </p>
              </div>
              <Badge tone={i === 0 ? "success" : "neutral"}>
                {i === 0 ? "Top performer" : "Running"}
              </Badge>
            </li>
          ))}
          {campaign.ads === 0 && (
            <li className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[14px] text-ink-500">
              No ad versions yet. Add a creative to publish.
            </li>
          )}
        </ul>
      </section>

      {campaign.note && !failed && (
        <div
          role="status"
          className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-[14px] text-ink-700"
        >
          {campaign.note}
        </div>
      )}

      <hr className="border-line-soft" />

      <section>
        <h3 className="text-[14px] font-semibold text-ink">Activity</h3>
        <ol className="mt-4 space-y-4">
          {[
            { t: "Details updated", d: campaign.updated, by: campaign.owner },
            { t: `Set to ${status.label.toLowerCase()}`, d: campaign.updated, by: "Automation" },
            { t: "Campaign created", d: fmt.date(campaign.startDate), by: campaign.owner },
          ].map((a, i) => (
            <li key={i} className="flex gap-4">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-400"
                aria-hidden="true"
              />
              <div>
                <p className="text-[14px] text-ink">{a.t}</p>
                <p className="text-[12px] text-ink-500">
                  {a.d} · {a.by}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="primary" onClick={() => onEdit(campaign)}>
          Edit campaign
        </Button>
        {campaign.status === "paused" && (
          <Button onClick={() => (onSetStatus ? onSetStatus("active") : onToast(`${campaign.name} resumed`))}>
            Resume
          </Button>
        )}
        {campaign.status === "active" && (
          <Button onClick={() => (onSetStatus ? onSetStatus("paused") : onToast(`${campaign.name} paused`, "info"))}>
            Pause
          </Button>
        )}
        {campaign.status === "draft" && (
          <Button
            disabled={campaign.ads === 0}
            title={campaign.ads === 0 ? "Add an ad version before publishing" : undefined}
            onClick={() => (onSetStatus ? onSetStatus("active") : onToast(`${campaign.name} published`))}
          >
            Publish
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>

      <p className="text-[12px] text-ink-400">
        Press <kbd className="num rounded border border-line px-1">esc</kbd> to close this panel.
      </p>
    </div>
  );
}
