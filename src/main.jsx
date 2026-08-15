import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  EyeOff,
  Folder,
  Home,
  Layers3,
  Lock,
  MonitorCog,
  Power,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
  Trash2,
  UsersRound,
  Volume2,
  WalletCards,
  Wifi,
  X
} from "lucide-react";
import "./styles.css";

const ref = (name) => `${import.meta.env.BASE_URL}assets/reference/${name}.png`;
const brand = (name) => `${import.meta.env.BASE_URL}assets/brand/${name}`;

const onboarding = [
  { id: "boot", title: "Boot", image: ref("boot1") },
  { id: "local", title: "Local Account", image: ref("enter1") },
  { id: "lyriq", title: "Lyriq Account", image: ref("enter2") },
  { id: "apps", title: "Apps", image: ref("enter3") },
  { id: "providers", title: "AI Providers", image: ref("enter4") },
  { id: "finish", title: "Finish", image: ref("enter5") }
];

const appCatalog = [
  ["workspace", "Lyriq Workspace", "Projetos, arquivos, equipes, agentes e automacoes.", Layers3],
  ["voxa", "VOXA Chat", "Rede social da Lyriq para posts, perfis, criadores e comunidades.", UsersRound],
  ["pay", "Agent Pay", "Carteira, assinaturas, creditos, limites e pagamentos.", WalletCards],
  ["modelhub", "Model Hub", "Modelos, provedores, custos, roteamento e fallback.", Cpu],
  ["agentcenter", "Agent Center", "Permissoes, agentes ativos, memoria e runtime.", Box],
  ["files", "Files", "Arquivos locais, Drive, knowledge bases e sincronizacao.", Folder],
  ["terminal", "Terminal", "Shell, comandos Lyra, logs e ferramentas de dev.", Terminal],
  ["settings", "Settings", "Sistema, rede, seguranca, usuarios e acessibilidade.", Settings]
];

const providers = {
  OpenAI: ["gpt-5", "gpt-5-mini", "gpt-4.1"],
  Anthropic: ["claude-opus-4.1", "claude-sonnet-4", "claude-haiku-3.5"],
  Google: ["gemini-2.5-pro", "gemini-2.5-flash"],
  Groq: ["llama-3.3-70b", "qwen-qwq-32b"],
  OpenRouter: ["auto-router", "deepseek-r1", "mistral-large"]
};

const dockApps = appCatalog.filter(([id]) =>
  ["workspace", "voxa", "pay", "modelhub", "files", "terminal", "settings"].includes(id)
);

const desktopIcons = [
  ["home", "Home", Home],
  ["workspace", "Lyriq Workspace", Layers3],
  ["voxa", "VOXA Chat", UsersRound],
  ["modelhub", "Model Hub", Cpu],
  ["agentcenter", "Agent Center", Box],
  ["trash", "Trash", Trash2]
];

function App() {
  const params = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState(params.get("screen") || "setup");
  const [step, setStep] = useState(Number(params.get("step") || 0));
  const [launcher, setLauncher] = useState(params.get("launcher") === "1");
  const [openApp, setOpenApp] = useState(params.get("app"));
  const [session, setSession] = useState({
    name: "Augusto",
    username: "augusto",
    lyriqEmail: "augusto@lyriq.com",
    selectedApps: ["workspace", "voxa", "pay", "modelhub", "agentcenter"],
    provider: "OpenAI",
    model: "gpt-5",
    apiKey: "",
    keyValid: false
  });

  const next = () => {
    if (mode === "setup" && step < onboarding.length - 1) setStep(step + 1);
    if (mode === "setup" && step === onboarding.length - 1) setMode("lock");
  };

  if (mode === "setup") {
    return (
      <Stage label={onboarding[step].title}>
        <SetupWizard
          step={step}
          setStep={setStep}
          session={session}
          setSession={setSession}
          onNext={next}
          onBack={() => setStep(Math.max(0, step - 1))}
        />
      </Stage>
    );
  }

  if (mode === "lock") {
    return <LockScreen session={session} onUnlock={() => setMode("desktop")} />;
  }

  return (
    <Stage label="AgentOS Desktop" desktop>
      <DesktopIcons open={setOpenApp} />
      <Taskbar
        launcher={launcher}
        selectedApps={session.selectedApps}
        provider={session.provider}
        model={session.model}
        onLauncher={() => setLauncher(!launcher)}
        open={setOpenApp}
      />
      <AgentCenterWidget open={() => setOpenApp("agentcenter")} />
      {launcher && (
        <Launcher
          selectedApps={session.selectedApps}
          onClose={() => setLauncher(false)}
          open={(id) => {
            setLauncher(false);
            setOpenApp(id);
          }}
        />
      )}
      {openApp && (
        <AppWindow
          appId={openApp}
          session={session}
          setSession={setSession}
          onClose={() => setOpenApp(null)}
        />
      )}
    </Stage>
  );
}

function Stage({ label, desktop = false, children }) {
  const kind = desktop ? "desktop-stage" : "setup-stage";
  return (
    <main className={`stage ${kind}`} aria-label={label}>
      <div className="vignette" />
      <div className="interactive-layer">{children}</div>
    </main>
  );
}

function AgentCenterWidget({ open }) {
  return (
    <aside className="agent-widget">
      <header><strong>Agent Center</strong><span>⌃</span></header>
      {[
        ["System Agent", "Online", Box, "green"],
        ["Workspace Agent", "Syncing", Layers3, "blue"],
        ["Model Router", "GPT-5 Connected", Cpu, "violet"]
      ].map(([name, status, Icon, color]) => (
        <button key={name} onClick={open}>
          <span className="mini-icon"><Icon size={20} /></span>
          <strong>{name}</strong>
          <small className={color}>{status}</small>
        </button>
      ))}
      <footer><button onClick={open}>Open Agent Center</button></footer>
    </aside>
  );
}

function LogoMark({ size = 42 }) {
  return <img className="logo-mark" src={brand("agentos-logo.jpg")} alt="AgentOS" style={{ width: size, height: size }} />;
}

function SetupWizard({ step, setStep, session, setSession, onNext, onBack }) {
  const title = onboarding[step].title;
  const subtitles = [
    "Set up your local account, Lyriq apps and AI providers",
    "Create the local owner account for this computer",
    "Sync your apps, agents, licenses and workspace settings",
    "Choose the apps installed on first boot",
    "Connect the first provider and model router",
    "AgentOS is ready to restart"
  ];

  return (
    <section className="setup-panel">
      <header className="setup-header">
        <div className="brand-row"><LogoMark size={58} /><strong>Agent<span>OS</span></strong></div>
        <h1>{step === 0 ? "Welcome to AgentOS" : title}</h1>
        <p>{subtitles[step]}</p>
      </header>
      <div className="setup-body">
        <aside className="setup-sidebar">
        <nav>
          {onboarding.slice(1).map((screen, index) => (
            <button key={screen.id} className={index + 1 === step ? "active" : index + 1 < step ? "done" : ""} onClick={() => setStep(index + 1)}>
              <span>{index + 1 < step ? <Check size={16} /> : index + 1}</span>
              {screen.title}
            </button>
          ))}
        </nav>
      </aside>
        <main className="setup-content">
          {step === 0 && <WelcomePanel />}
          {step === 1 && <LocalAccount session={session} setSession={setSession} />}
          {step === 2 && <LyriqAccount session={session} setSession={setSession} />}
          {step === 3 && <AppPicker session={session} setSession={setSession} />}
          {step === 4 && <ProviderSetup session={session} setSession={setSession} />}
          {step === 5 && <FinishPanel session={session} />}
        </main>
      </div>
      <footer className="setup-footer">
        <div className="system-mini"><span>US</span><Wifi size={16} /><MonitorCog size={16} /><span>10:42 AM</span></div>
        <div className="setup-actions">
        {step > 0 && <button className="secondary" onClick={onBack}>Back</button>}
        <button className="primary" onClick={onNext}>{step === 5 ? "Restart into AgentOS" : step === 0 ? "Start setup" : "Continue"}</button>
      </div>
      </footer>
    </section>
  );
}

function WelcomePanel() {
  return (
    <div className="welcome-panel">
      <LogoMark size={82} />
      <strong>Lyriq AgentOS</strong>
      <p>Linux-based operating system built for apps, agents and model routing.</p>
    </div>
  );
}

function LocalAccount({ session, setSession }) {
  return (
    <div className="form-panel account-card">
      <label>Name<input value={session.name} onChange={(e) => setSession({ ...session, name: e.target.value })} /></label>
      <label>Username<input value={session.username} onChange={(e) => setSession({ ...session, username: e.target.value })} /></label>
      <label>Password<input type="password" defaultValue="agentos" /></label>
    </div>
  );
}

function LyriqAccount({ session, setSession }) {
  return (
    <div className="form-panel account-card">
      <label>Email<input value={session.lyriqEmail} onChange={(e) => setSession({ ...session, lyriqEmail: e.target.value })} /></label>
      <label>Password<input type="password" defaultValue="lyriq" /></label>
      <button className="text-action">Create Lyriq Account</button>
    </div>
  );
}

function AppPicker({ session, setSession }) {
  const toggle = (id) => {
    const selectedApps = session.selectedApps.includes(id)
      ? session.selectedApps.filter((app) => app !== id)
      : [...session.selectedApps, id];
    setSession({ ...session, selectedApps });
  };

  return (
    <div className="form-panel apps-card">
      <div className="app-grid">
        {appCatalog.map(([id, name, description, Icon]) => (
          <button key={id} className={session.selectedApps.includes(id) ? "app-tile selected" : "app-tile"} onClick={() => toggle(id)}>
            <span className="logo-slot"><Icon size={22} /></span>
            <strong>{name}</strong>
            <small>{description}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProviderSetup({ session, setSession }) {
  const models = providers[session.provider];
  const validate = () => setSession({ ...session, keyValid: session.apiKey.trim().length > 7 });

  return (
    <div className="form-panel provider-card">
      <div className="select-row">
        <label>Provider<Select value={session.provider} onChange={(provider) => setSession({ ...session, provider, model: providers[provider][0], keyValid: false })} options={Object.keys(providers)} /></label>
        <label>Model<Select value={session.model} onChange={(model) => setSession({ ...session, model })} options={models} /></label>
      </div>
      <label>API Key
        <div className="key-row">
          <input value={session.apiKey} onChange={(e) => setSession({ ...session, apiKey: e.target.value, keyValid: false })} placeholder="sk-..." />
          <button onClick={validate}>Validate</button>
        </div>
      </label>
      <p className={session.keyValid ? "status good" : "status"}>{session.keyValid ? "API validada. Modelo compativel detectado." : "Cole a chave e valide para liberar roteamento automatico."}</p>
    </div>
  );
}

function Select({ value, options, onChange }) {
  return (
    <span className="select-wrap">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown size={16} />
    </span>
  );
}

function FinishPanel({ session }) {
  return (
    <div className="form-panel finish-card">
      <ShieldCheck size={34} />
      <h2>AgentOS is ready</h2>
      <p>{session.selectedApps.length} apps selected. {session.provider} connected to {session.model}.</p>
      <div className="summary-pills">
        <span>Local user: @{session.username}</span>
        <span>Runtime active</span>
        <span>Model router ready</span>
      </div>
    </div>
  );
}

function LockScreen({ session, onUnlock }) {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <main className="lock-screen">
      <div className="lock-clock"><strong>20:46</strong><span>Fri, Aug 14</span></div>
      <section className="lock-panel">
        <LogoMark size={40} />
        <div className="avatar">{session.name.slice(0, 1).toUpperCase()}</div>
        <h1>{session.name}</h1>
        <p>@{session.username}</p>
        <div className="password-box">
          <Lock size={18} />
          <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" onKeyDown={(e) => e.key === "Enter" && onUnlock()} autoFocus />
          <button onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <button className="primary unlock" onClick={onUnlock}>Unlock</button>
        <button className="forgot">Forgot password?</button>
      </section>
      <div className="lock-tray"><span>US</span><Wifi size={17} /><MonitorCog size={17} /><Power size={17} /></div>
    </main>
  );
}

function DesktopIcons({ open }) {
  return (
    <div className="desktop-icons-live">
      {desktopIcons.map(([id, name, Icon]) => (
        <button key={id} onClick={() => id !== "trash" && open(id)}>
          <span><Icon size={25} /></span>
          {name}
        </button>
      ))}
    </div>
  );
}

function Taskbar({ launcher, selectedApps, provider, model, onLauncher, open }) {
  const visibleDock = dockApps.filter(([id]) => selectedApps.includes(id));

  return (
    <div className="taskbar-live">
      <button className={launcher ? "launcher-button active" : "launcher-button"} onClick={onLauncher} title="Launcher"><Box size={27} /></button>
      <button className="search-live" onClick={() => open("search")}><Search size={16} /> Search AgentOS</button>
      <nav className="dock-live">
        {visibleDock.map(([id, name, , Icon]) => (
          <button key={id} onClick={() => open(id)} title={name}>
            <Icon size={21} />
            <span>{name}</span>
          </button>
        ))}
      </nav>
      <div className="tray-live">
        <ChevronUp size={16} />
        <Wifi size={16} />
        <Volume2 size={16} />
        <MonitorCog size={16} />
        <Bell size={16} />
        <button onClick={() => open("settings")}><Settings size={16} /></button>
        <button className="agent-status" onClick={() => open("agentcenter")}>Agents Active</button>
        <span>{model || provider} Online</span>
        <time><strong>20:46</strong><small>Fri, Aug 14</small></time>
      </div>
    </div>
  );
}

function Launcher({ selectedApps, onClose, open }) {
  const installed = appCatalog.filter(([id]) => selectedApps.includes(id));

  return (
    <div className="reference-window launcher-reference">
      <img src={ref("launchermenu")} alt="Launcher menu" draggable="false" />
      <div className="launcher-live">
        <div className="launcher-top">
          <div><strong>AgentOS</strong><span>Apps, files, agents and commands</span></div>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="launcher-search"><Search size={16} /> Search AgentOS</div>
        <div className="launcher-apps">
          {installed.map(([id, name, description, Icon]) => (
            <button key={id} onClick={() => open(id)}>
              <span><Icon size={23} /></span>
              <strong>{name}</strong>
              <small>{description}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppWindow({ appId, session, setSession, onClose }) {
  if (appId === "agentcenter") {
    return (
      <div className="app-window agent-center-window">
        <WindowChrome title="Agent Center" onClose={onClose} />
        <div className="agent-center-grid">
          <aside>
            <LogoMark size={44} />
            <strong>Agent Runtime</strong>
            <button className="active">Active Agents</button>
            <button>Permissions</button>
            <button>Memory</button>
            <button>Logs</button>
            <button>Model Router</button>
          </aside>
          <section>
            <div className="agent-title">
              <div><h2>Active Agents</h2><p>System services running inside AgentOS.</p></div>
              <span>3 running</span>
            </div>
            <div className="agent-table">
              {[
                ["System Agent", "Core OS automation", "Online", "File access"],
                ["Workspace Agent", "Projects and apps sync", "Syncing", "Network access"],
                ["Model Router", session.model, "Connected", session.provider]
              ].map(([name, role, status, access]) => (
                <article key={name}>
                  <span className="mini-icon"><Box size={20} /></span>
                  <div><strong>{name}</strong><small>{role}</small></div>
                  <em>{status}</em>
                  <button>{access}</button>
                </article>
              ))}
            </div>
            <div className="permission-grid">
              <label><input type="checkbox" defaultChecked /> File access</label>
              <label><input type="checkbox" defaultChecked /> Network access</label>
              <label><input type="checkbox" /> App control</label>
              <label><input type="checkbox" defaultChecked /> Model routing</label>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const app = appCatalog.find(([id]) => id === appId) || ["search", "Search", "Find apps, files, settings and agents.", Search];
  const [, name, description, Icon] = app;

  return (
    <div className="app-window">
      <WindowChrome title={name} onClose={onClose} />
      <div className="app-window-body">
        <span className="window-logo"><Icon size={30} /></span>
        <h2>{name}</h2>
        <p>{description}</p>
        {appId === "modelhub" && <ProviderSetup session={session} setSession={setSession} />}
        {appId === "voxa" && <SocialMock />}
        {appId !== "modelhub" && appId !== "voxa" && <GenericMock appId={appId} />}
      </div>
    </div>
  );
}

function WindowChrome({ title, onClose }) {
  return (
    <div className="window-chrome">
      <span>{title}</span>
      <button onClick={onClose}><X size={16} /></button>
    </div>
  );
}

function SocialMock() {
  return (
    <div className="social-mock">
      <div><strong>Augusto Weymar</strong><p>Construindo o AgentOS por cima do Linux. Primeiro boot ficando vivo.</p></div>
      <div><strong>Lyriq Tech</strong><p>Nova rede social VOXA Chat instalada como app nativo do ecossistema.</p></div>
    </div>
  );
}

function GenericMock({ appId }) {
  const lines = useMemo(() => ({
    workspace: ["Projetos ativos", "Arquivos sincronizados", "Agentes por workspace"],
    pay: ["Saldo de creditos", "Gastos por modelo", "Assinaturas"],
    files: ["Home", "Drive", "Knowledge bases"],
    terminal: ["lyra init agent", "agentos model status", "agentos apps list"],
    settings: ["Network", "Sound", "Accounts", "Security"],
    search: ["Apps", "Files", "Settings", "Agent commands"],
    home: ["Desktop", "Documents", "Downloads"]
  })[appId] || ["Ready", "Configured", "Installed"], [appId]);

  return <div className="generic-list">{lines.map((line) => <button key={line}>{line}</button>)}</div>;
}

createRoot(document.getElementById("root")).render(<App />);
