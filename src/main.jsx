import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AppWindow,
  Bell,
  Box,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  Command,
  Cpu,
  Folder,
  Globe2,
  Home,
  Layers3,
  LockKeyhole,
  Menu,
  MonitorCog,
  Search,
  Settings,
  Shield,
  Terminal,
  Trash2,
  UserRound,
  UsersRound,
  Volume2,
  WalletCards,
  Wifi
} from "lucide-react";
import "./styles.css";

const apps = [
  { id: "workspace", name: "Lyriq Workspace", icon: Layers3, desc: "Projects, files, automations and teams." },
  { id: "voxa", name: "VOXA Chat", icon: UsersRound, desc: "Lyriq social network for posts and communities." },
  { id: "pay", name: "Agent Pay", icon: WalletCards, desc: "Payments, balances and agent transactions." },
  { id: "models", name: "Model Hub", icon: Cpu, desc: "Providers, models, API keys and routing." },
  { id: "files", name: "Files", icon: Folder, desc: "Local files, cloud sync and app documents." },
  { id: "terminal", name: "Terminal", icon: Terminal, desc: "Linux shell and developer commands." },
  { id: "settings", name: "Settings", icon: Settings, desc: "System, network, accounts and permissions." },
  { id: "agents", name: "Agent Center", icon: Box, desc: "Runtime status, permissions and logs." }
];

const desktopIcons = [
  ["Home", Home],
  ["Lyriq Workspace", Layers3],
  ["VOXA Chat", UsersRound],
  ["Model Hub", Cpu],
  ["Agent Center", Box],
  ["Trash", Trash2]
];

function AgentLogo() {
  return (
    <div className="agent-logo" aria-label="AgentOS">
      <span />
      <Box size={25} strokeWidth={1.8} />
    </div>
  );
}

function Boot({ onNext }) {
  return (
    <section className="screen boot" onClick={onNext}>
      <div className="boot-mark"><AgentLogo /></div>
      <div className="boot-title">AgentOS</div>
      <div className="boot-loader"><span /></div>
    </section>
  );
}

function Setup({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = ["Local Account", "Lyriq Account", "Apps", "AI Providers", "Finish"];
  const next = () => (step === steps.length - 1 ? onDone() : setStep(step + 1));

  return (
    <section className="screen setup">
      <div className="setup-panel">
        <aside className="setup-rail">
          <AgentLogo />
          <div>
            <h1>Welcome to AgentOS</h1>
            <p>Set up your system, apps and AI providers.</p>
          </div>
          <nav>
            {steps.map((item, i) => (
              <button key={item} className={i === step ? "active" : i < step ? "done" : ""} onClick={() => setStep(i)}>
                <span>{i + 1}</span>{item}
              </button>
            ))}
          </nav>
        </aside>
        <main className="setup-main">
          {step === 0 && <AccountStep />}
          {step === 1 && <LyriqStep />}
          {step === 2 && <AppsStep />}
          {step === 3 && <ProviderStep />}
          {step === 4 && <FinishStep />}
          <div className="setup-actions">
            <button className="ghost" onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
            <button className="primary" onClick={next}>{step === 4 ? "Enter AgentOS" : "Continue"}</button>
          </div>
        </main>
      </div>
      <div className="setup-footer"><Globe2 size={15} /> English US <Wifi size={15} /> Online <Shield size={15} /> Secure setup</div>
    </section>
  );
}

function Field({ label, placeholder, type = "text" }) {
  return <label className="field"><span>{label}</span><input type={type} placeholder={placeholder} /></label>;
}

function AccountStep() {
  return <div className="step"><h2>Create local account</h2><p>This account unlocks your local desktop and protects files, agents and settings.</p><Field label="Name" placeholder="Augusto Weymar" /><Field label="Username" placeholder="augusto" /><Field label="Password" placeholder="Create a strong password" type="password" /></div>;
}

function LyriqStep() {
  return <div className="step"><h2>Connect Lyriq Account</h2><p>Sync your apps, agents, licenses and workspace settings.</p><Field label="Email" placeholder="you@lyriq.com" /><Field label="Password" placeholder="Your Lyriq password" type="password" /><button className="inline-action">Create Lyriq Account</button></div>;
}

function AppsStep() {
  return (
    <div className="step">
      <h2>Choose apps to install</h2>
      <p>Select the Lyriq apps you want ready on first login.</p>
      <div className="app-grid setup-apps">
        {apps.slice(0, 6).map(({ name, icon: Icon, desc }, i) => (
          <label className="app-card selected" key={name}>
            <input type="checkbox" defaultChecked={i < 4} />
            <span className="app-icon"><Icon size={23} /></span>
            <strong>{name}</strong>
            <small>{desc}</small>
          </label>
        ))}
      </div>
    </div>
  );
}

function ProviderStep() {
  return (
    <div className="step">
      <h2>AI Providers</h2>
      <p>Choose your provider, select a compatible model and validate the API key.</p>
      <div className="provider-form">
        <label><span>Provider</span><select defaultValue="OpenAI"><option>OpenAI</option><option>Anthropic</option><option>Google Gemini</option><option>Groq</option></select></label>
        <label><span>Model</span><select defaultValue="GPT-5"><option>GPT-5</option><option>GPT-4.1</option><option>Claude Sonnet</option><option>Gemini 2.5 Pro</option></select></label>
        <label className="api-key"><span>API Key</span><input placeholder="sk-..." type="password" /><button>Validate</button></label>
      </div>
      <div className="validation-card"><LockKeyhole size={18} /> API keys stay encrypted in the local AgentOS vault.</div>
    </div>
  );
}

function FinishStep() {
  return <div className="step finish-step"><AgentLogo /><h2>AgentOS is ready</h2><p>Your desktop, apps, model routing and agent runtime are configured.</p><div className="ready-list"><span>Local account created</span><span>Lyriq apps selected</span><span>GPT-5 provider online</span><span>Agent runtime protected</span></div></div>;
}

function Desktop() {
  const [launcher, setLauncher] = useState(false);
  const [agentCenter, setAgentCenter] = useState(true);
  return (
    <section className="screen desktop">
      <div className="desktop-icons">
        {desktopIcons.map(([name, Icon]) => <button key={name}><span><Icon size={26} /></span>{name}</button>)}
      </div>
      {launcher && <Launcher onClose={() => setLauncher(false)} />}
      {agentCenter && <AgentCenter onClose={() => setAgentCenter(false)} />}
      <Taskbar onLauncher={() => setLauncher(!launcher)} onAgentCenter={() => setAgentCenter(!agentCenter)} />
    </section>
  );
}

function Launcher() {
  return (
    <div className="launcher">
      <div className="launcher-head">
        <div><h2>AgentOS Launcher</h2><p>Apps, files, agents and commands</p></div>
        <Command size={22} />
      </div>
      <div className="launcher-search"><Search size={18} /><input placeholder="Search AgentOS" /></div>
      <div className="app-grid">
        {apps.map(({ name, icon: Icon, desc }) => (
          <button className="app-card" key={name}>
            <span className="app-icon"><Icon size={24} /></span>
            <strong>{name}</strong>
            <small>{desc}</small>
          </button>
        ))}
      </div>
      <div className="launcher-bottom"><span>3 agents active</span><span>GPT-5 Online</span><span>Secure vault enabled</span></div>
    </div>
  );
}

function AgentCenter({ onClose }) {
  const agents = [
    ["System Agent", "Monitors OS health, files and runtime.", "Running"],
    ["Workspace Agent", "Connects projects, tasks and automations.", "Ready"],
    ["Model Router", "Chooses the best model by provider and cost.", "Active"]
  ];
  return (
    <div className="window">
      <header><span>Agent Center</span><button onClick={onClose}>×</button></header>
      <div className="window-body">
        <aside className="window-nav">
          {["Overview", "Active Agents", "Permissions", "Automations", "Memory", "Model Routing", "Logs", "Settings"].map((item, i) => <button className={i === 0 ? "active" : ""} key={item}>{item}</button>)}
        </aside>
        <main className="overview">
          <h3>Overview</h3>
          <div className="metrics">
            <Metric label="Agents Active" value="3" />
            <Metric label="System Runtime" value="Online" />
            <Metric label="Default Model" value="GPT-5" />
            <Metric label="Permissions" value="Protected" />
            <Metric label="API Status" value="Validated" />
          </div>
          <h3>Active Agents</h3>
          <div className="agent-list">
            {agents.map(([name, desc, status], i) => <div className={i === 0 ? "agent-row focus" : "agent-row"} key={name}><Box size={28} /><div><strong>{name}</strong><p>{desc}</p></div><span>{status}</span><button>{i === 2 ? "Configure" : i === 1 ? "Start" : "Pause"}</button><button>Logs</button></div>)}
          </div>
          <div className="logs"><span>16:44:10 [INFO] Runtime initialized</span><span>16:44:12 [INFO] API key validated</span><span>16:44:14 [INFO] Model router online</span></div>
        </main>
        <aside className="details">
          <h3>Selected Agent</h3>
          <div className="detail-card"><Box size={35} /><strong>System Agent</strong><span>Running</span></div>
          <dl><dt>Current Task</dt><dd>Monitoring system runtime</dd><dt>Permissions</dt><dd>Files, Network, Notifications</dd><dt>Model Used</dt><dd>GPT-5</dd><dt>Cost Today</dt><dd>$0.00</dd></dl>
          <div className="switches"><label>Allow file access <input type="checkbox" defaultChecked /></label><label>Allow network access <input type="checkbox" defaultChecked /></label><label>Allow app control <input type="checkbox" /></label></div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="metric"><small>{label}</small><strong>{value}</strong></div>;
}

function Taskbar({ onLauncher, onAgentCenter }) {
  return (
    <footer className="taskbar">
      <button className="logo-button" onClick={onLauncher}><AgentLogo /></button>
      <button className="search-button"><Search size={16} /> Search AgentOS</button>
      <div className="pinned">
        {apps.slice(0, 7).map(({ name, icon: Icon }) => <button key={name} title={name} onClick={name === "Agent Center" ? onAgentCenter : undefined}><Icon size={21} /><span>{name}</span></button>)}
      </div>
      <div className="tray"><ChevronUp size={16} /><Wifi size={16} /><Volume2 size={16} /><MonitorCog size={16} /><Bell size={16} /><Settings size={16} /><span className="agent-status">Agents Active</span><span className="model-status">GPT-5 Online</span><time><strong>16:46</strong><small>Fri, Aug 14</small></time></div>
    </footer>
  );
}

function App() {
  const [phase, setPhase] = useState("boot");
  if (phase === "boot") return <Boot onNext={() => setPhase("setup")} />;
  if (phase === "setup") return <Setup onDone={() => setPhase("desktop")} />;
  return <Desktop />;
}

createRoot(document.getElementById("root")).render(<App />);
