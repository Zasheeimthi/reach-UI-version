import { useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Link2, Plus, ShieldCheck, Sparkles, Unplug } from "lucide-react";
import PlatformMark from "../components/PlatformMark";
import { Button, Dialog, type ToastFn } from "../components/ui";
import type { Channel } from "../lib/data";
import "./platforms.css";

type Platform = { id: Channel | "openai"; name: string; category: string; description: string; account?: string; page?: string; customerId?: string };
const platforms: Platform[] = [
  { id: "google", name: "Google Ads", category: "Search & display", description: "Reach people searching for what you offer.", account: "ravi.antone@gmail.com", page: "ravi.antone@gmail.com", customerId: "9614128474" },
  { id: "x", name: "X (Twitter)", category: "Social", description: "Join the conversations that matter.", account: "senthazalravi", page: "senthazalravi", customerId: "18ce53xf88e" },
  { id: "reddit", name: "Reddit", category: "Communities", description: "Reach communities with promoted posts.", account: "ravi.antone@gmail.com", page: "Economy_Can_7746", customerId: "a2_j3vkj4hrofkr" },
  { id: "microsoft", name: "Bing Ads", category: "Search", description: "Connect with audiences on Microsoft Search.", account: "imthiyaz@fliptech.co.in", page: "Artwork Painting (G145TPKV)", customerId: "187303046" },
  { id: "meta", name: "Meta", category: "Social", description: "Run automated ads across Facebook and Instagram." },
  { id: "tiktok", name: "TikTok", category: "Short-form video", description: "Turn attention into action with video ads." },
  { id: "openai", name: "OpenAI Ads", category: "AI discovery", description: "Manage ChatGPT ads with an Ads Manager API key." },
];
function Mark({ platform }: { platform: Platform }) {
  return <span className={`platform-logo platform-logo-${platform.id}`}>{platform.id === "openai" ? <Sparkles size={25} /> : <PlatformMark channel={platform.id} size={30} />}</span>;
}
export default function PlatformsPage({ toast }: { toast: ToastFn }) {
  const [disconnected, setDisconnected] = useState<string[]>([]);
  const [selected, setSelected] = useState<Platform | null>(null);
  const [mode, setMode] = useState<"manage" | "connect">("manage");
  const connected = platforms.filter(p => p.account && !disconnected.includes(p.id));
  const available = platforms.filter(p => !p.account || disconnected.includes(p.id));
  const close = () => setSelected(null);
  const open = (p: Platform, action: "manage" | "connect") => { setMode(action); setSelected(p); };
  return <div className="platforms-page">
    <header className="platforms-heading">
      <div><p className="platforms-eyebrow">WORKSPACE / CONNECTIONS</p><h1>Platforms<span>.</span></h1><p>Your channels, connected. Manage every ad account in one place.</p></div>
      <div className="platforms-summary"><span className="platforms-summary-icon"><Link2 size={21} /></span><div><strong>{connected.length} <span>/ {platforms.length}</span></strong><p>platforms connected</p></div></div>
    </header>
    <div className="platforms-layout">
      <section className="platforms-connected" aria-labelledby="connected-title">
        <div className="platforms-section-heading"><div><h2 id="connected-title">Connected accounts <span>{connected.length}</span></h2><p>Your advertising accounts, ready to work together.</p></div><span className="platforms-live"><span /> Connected</span></div>
        <div className="platforms-account-list">
          {connected.map(p => <article key={p.id} className="platforms-account">
            <div className="platforms-account-top"><Mark platform={p}/><div className="platforms-identity"><h3>{p.name}</h3><span>{p.category}</span></div><span className="platforms-status"><Check size={13}/> Connected</span></div>
            <dl className="platforms-details"><div><dt>Account</dt><dd>{p.account}</dd></div><div><dt>{p.id === "microsoft" ? "Account ID" : "Customer ID"}</dt><dd className="platforms-id">{p.customerId}</dd></div><div><dt>Page</dt><dd>{p.page}</dd></div><div className="platforms-manage"><button onClick={() => open(p, "manage")} aria-label={`Manage ${p.name}`}>Manage account <ChevronRight size={15}/></button></div></dl>
          </article>)}
          {connected.length === 0 && <p className="p-8 text-ink-500">No connected accounts. Choose a platform to get started.</p>}
        </div>
        <div className="platforms-note"><ShieldCheck size={20}/><p>Connect once, create across channels.<span>Your account connections stay in one place, so you can focus on your next campaign.</span></p></div>
      </section>
      <aside className="platforms-discover" aria-labelledby="discover-title"><div className="platforms-section-heading"><div><p className="platforms-eyebrow">EXPAND YOUR REACH</p><h2 id="discover-title">Add a channel</h2><p>Meet your next audience.</p></div><Plus size={20}/></div>
        <div className="platforms-available-list">{available.map(p => <article key={p.id} className="platforms-available"><div className="platforms-available-title"><Mark platform={p}/><div><h3>{p.name}</h3><span>{p.category}</span></div></div><p>{p.description}</p><button onClick={() => open(p, "connect")}> {p.id === "openai" ? "Connect with API key" : "Connect account"}<ArrowUpRight size={17}/></button></article>)}</div>
        <p className="platforms-preview-note">Preview workspace · connections shown are sample data.</p>
      </aside>
    </div>
    <Dialog open={!!selected} onClose={close} title={mode === "manage" ? `${selected?.name} account` : `Connect ${selected?.name}`} description={mode === "connect" ? "Live connections are not configured in this preview. This platform needs a secure connection service before you can authorize an account." : "Review the account linked to this preview workspace."} footer={<><Button onClick={close}>Close</Button>{mode === "manage" && <Button onClick={() => { if (!selected) return; const p = selected; setDisconnected(v => [...v, p.id]); close(); toast(`${p.name} removed from this preview`, "info", {label: "Undo", onClick: () => setDisconnected(v => v.filter(id => id !== p.id))}); }}><Unplug size={15}/> Disconnect preview</Button>}</>}>
      {selected && mode === "manage" && <dl className="platforms-dialog-details"><dt>Account</dt><dd>{selected.account}</dd><dt>Page</dt><dd>{selected.page}</dd><dt>Account ID</dt><dd>{selected.customerId}</dd></dl>}
      {mode === "connect" && <div className="rounded-xl border border-line bg-surface-soft p-4 text-sm text-ink-700">{selected?.id === "openai" ? "API key entry will be available when a secure backend is connected. No credentials are collected in this preview." : `When enabled, you’ll sign in to ${selected?.name}, choose an ad account, and grant Reach access.`}</div>}
    </Dialog>
  </div>;
}
