import * as React from "react";
import { AppShell, routeTitles, type RouteKey } from "./components/AppShell";
import { Button, Card, EmptyState, ToastStack, type Toast, type ToastFn } from "./components/ui";
import CampaignsPage from "./features/CampaignsPage";
import CreateCampaignFlow from "./features/CreateCampaignFlow";
import CreateImagePage from "./features/CreateImagePage";
import OverviewPage from "./features/OverviewPage";
import PlatformsPage from "./features/PlatformsPage";
import type { Campaign } from "./lib/data";

const readHash = (): RouteKey => {
  const h = window.location.hash.replace(/^#\/?/, "") as RouteKey;
  return h && h in routeTitles ? h : "overview";
};

export default function App() {
  const [route, setRoute] = React.useState<RouteKey>(readHash);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const onHash = () => setRoute(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (k: RouteKey) => {
    window.location.hash = `/${k}`;
    setRoute(k);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toast = React.useCallback<ToastFn>((message, tone = "success", action) => {
    const id = Date.now() + Math.random();
    // Keep at most three on screen; give Undo toasts a little longer to be noticed
    setToasts((t) => [...t.slice(-2), { id, message, tone, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 7000 : 4200);
  }, []);

  const editCampaign = (c: Campaign) => {
    navigate("new-campaign");
    toast(`Editing “${c.name}” in the campaign builder`, "info");
  };

  const title = routeTitles[route];

  return (
    <>
      <AppShell
        route={route}
        onNavigate={navigate}
        onNewCampaign={() => navigate("new-campaign")}
        actions={
          <div className="flex items-center gap-3 text-[12px] text-ink-400">
            <span className="hidden sm:inline">
              Synced from your ad platforms · refreshed every 15 minutes
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                All systems syncing
              </span>
              <kbd className="num hidden rounded border border-line px-1.5 py-0.5 sm:inline">⌘K</kbd>
            </span>
          </div>
        }
      >
        {route === "overview" && <OverviewPage onNavigate={navigate} toast={toast} />}

        {route === "campaigns" && (
          <CampaignsPage
            onNewCampaign={() => navigate("new-campaign")}
            onEditCampaign={editCampaign}
            onNavigate={navigate}
            toast={toast}
          />
        )}

        {route === "create" && <CreateImagePage toast={toast} onNavigate={navigate} />}

        {route === "new-campaign" && (
          <CreateCampaignFlow onDone={() => navigate("campaigns")} toast={toast} />
        )}

        {route === "platforms" && <PlatformsPage toast={toast} />}

        {!["overview", "campaigns", "create", "new-campaign", "platforms"].includes(route) && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[12px] tracking-wide text-ink-500">
                Workspace / {title.title}
              </p>
              <h1 className="text-[28px] leading-tight font-semibold text-ink sm:text-[32px]">
                {title.title}
              </h1>
              <p className="max-w-xl text-[14px] text-ink-500">{title.sub}</p>
            </div>
            <Card>
              <EmptyState
                title="This area is next in the redesign"
                description="Campaigns, Overview and the campaign builder are rebuilt on the new Clean system. The remaining screens follow the same tokens, spacing and interaction rules."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="primary" onClick={() => navigate("campaigns")}>
                      Go to campaigns
                    </Button>
                    <Button onClick={() => navigate("overview")}>Back to overview</Button>
                  </div>
                }
              />
            </Card>
          </div>
        )}
      </AppShell>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />
    </>
  );
}

