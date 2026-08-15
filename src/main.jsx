import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Activity,
  Cpu,
  Database,
  Eye,
  EyeOff,
  FileText,
  Folder,
  Globe2,
  HardDrive,
  Home,
  KeyRound,
  Layers3,
  Lock,
  Mail,
  MonitorCog,
  Network,
  Pause,
  Play,
  Power,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingBag,
  User,
  Terminal,
  Trash2,
  UsersRound,
  Volume2,
  WalletCards,
  Wifi,
  X
} from "lucide-react";
import { checkUpdates, getDaemonState, getFiles, getSecurityStatus, launchApp, quarantineThreat, requestPower, runSecurityScan, setSecurityProtection, validateProvider } from "./lib/agentosApi.js";
import "./styles.css";

const ref = (name) => `${import.meta.env.BASE_URL}assets/reference/${name}.png`;
const brand = (name) => `${import.meta.env.BASE_URL}assets/brand/${name}`;

const onboarding = [
  { id: "boot", title: "Boot", heading: "Welcome to AgentOS", image: ref("boot1") },
  { id: "local", title: "Local Account", heading: "Create Local Account", image: ref("enter1") },
  { id: "lyriq", title: "Lyriq Account", heading: "Connect your Lyriq Account", image: ref("enter2") },
  { id: "apps", title: "Lyriq Apps", heading: "Choose Lyriq Apps", image: ref("enter3") },
  { id: "providers", title: "AI Providers", heading: "Connect Model Provider", image: ref("enter4") },
  { id: "finish", title: "Finish Setup", heading: "AgentOS is Ready", image: ref("enter5") }
];

const appCatalog = [
  ["workspace", "Lyriq Workspace", "Projects, files, teams, agents and automations.", Layers3],
  ["voxa", "VOXA Chat", "Lyriq social network for posts, profiles, creators and communities.", UsersRound],
  ["pay", "Agent Pay", "Wallet, subscriptions, credits, limits and payments.", WalletCards],
  ["modelhub", "Model Hub", "Models, providers, costs, routing and fallback.", Cpu],
  ["agentcenter", "Agent Center", "Permissions, active agents, memory and runtime.", Box],
  ["defender", "Lyriq Defender", "Virus protection, firewall, threat monitoring and quarantine.", ShieldCheck],
  ["files", "Files", "Local files, Drive, knowledge bases and sync.", Folder],
  ["terminal", "Terminal", "Shell, Lyra commands, logs and dev tools.", Terminal],
  ["settings", "Settings", "System, network, security, users and accessibility.", Settings]
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

const launcherApps = [
  ...appCatalog.filter(([id]) => ["workspace", "voxa", "pay", "modelhub", "agentcenter", "defender", "files", "terminal", "settings"].includes(id)),
  ["browser", "Browser", "Web navigation and agent browsing.", Globe2],
  ["store", "App Store", "Install Lyriq apps and extensions.", ShoppingBag],
  ["monitor", "System Monitor", "Runtime, resources and process health.", MonitorCog],
  ["security", "Security Center", "Access, vault, device and account protection.", ShieldCheck]
];

const desktopIcons = [
  ["home", "Home", Home],
  ["workspace", "Lyriq Workspace", Layers3],
  ["voxa", "VOXA Chat", UsersRound],
  ["modelhub", "Model Hub", Cpu],
  ["agentcenter", "Agent Center", Box],
  ["defender", "Lyriq Defender", ShieldCheck],
  ["trash", "Trash", Trash2]
];

const launcherSections = [
  ["apps", "Apps", Layers3],
  ["agents", "Agents", UsersRound],
  ["files", "Files", Folder],
  ["settings", "Settings", Settings],
  ["power", "Power", Power]
];

const launcherSectionCopy = {
  apps: ["Apps", "Installed Lyriq apps and system tools ready on this desktop."],
  agents: ["Agents", "Live runtime agents, permissions, memory and routing status."],
  files: ["Files", "Local files, cloud sync, knowledge bases and secure storage."],
  settings: ["Settings", "System controls, accounts, security, network and accessibility."],
  power: ["Power", "Choose whether to sleep, restart or shut down AgentOS."]
};

const sectionItems = {
  agents: [
    ["agentcenter", "System Agent", "Core OS automation, commands and routine actions.", Box, "Online"],
    ["workspace", "Workspace Agent", "Projects, files, app sync and workspace context.", Layers3, "Syncing"],
    ["modelhub", "Model Router", "Provider routing, fallback, cost and validation status.", Cpu, "Connected"],
    ["memory-agent", "Memory Agent", "Long-term context, notes and personal preferences.", ShieldCheck, "Ready"],
    ["automation-agent", "Automation Agent", "Background tasks, schedules and workflow triggers.", MonitorCog, "Idle"],
    ["support-agent", "Support Agent", "Diagnostics, logs, incidents and user assistance.", UsersRound, "Online"]
  ],
  files: [
    ["home", "Home", "Desktop, documents, downloads and local workspace.", Home, "24 items"],
    ["files", "Lyriq Drive", "Cloud sync, shared folders and workspace files.", Folder, "Synced"],
    ["knowledge", "Knowledge Bases", "RAG sources, indexed docs and agent references.", Layers3, "8 bases"],
    ["recent", "Recent Files", "Latest opened files, uploads and generated artifacts.", Search, "Today"],
    ["secure", "Secure Vault", "Private keys, secrets and protected documents.", Lock, "Locked"],
    ["trash", "Trash", "Deleted files waiting for recovery or cleanup.", Trash2, "Empty"]
  ],
  settings: [
    ["network", "Network", "Wi-Fi, proxy, DNS and connection status.", Wifi, "Online"],
    ["settings", "Accounts", "Local user, Lyriq account and sign-in options.", User, "Connected"],
    ["security", "Security", "Permissions, app access, encryption and recovery.", ShieldCheck, "Protected"],
    ["modelhub", "Model Routing", "Provider, model, API key and fallback behavior.", Cpu, "Validated"],
    ["notifications", "Notifications", "Alerts, badges, sound and quiet hours.", Bell, "Enabled"],
    ["accessibility", "Accessibility", "Keyboard focus, contrast, motion and readable UI.", MonitorCog, "Ready"]
  ],
  power: [
    ["sleep", "Sleep", "Pause the session while keeping apps ready.", Power, "Standby"],
    ["restart", "Restart", "Reload AgentOS services and app runtime.", MonitorCog, "System"],
    ["shutdown", "Shut Down", "Close AgentOS and stop running services.", Power, "Power off"]
  ]
};

function App() {
  const params = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState(params.get("screen") || "setup");
  const [step, setStep] = useState(Number(params.get("step") || 0));
  const bootPhase = params.has("bootPhase") ? Number(params.get("bootPhase")) : null;
  const [launcher, setLauncher] = useState(params.get("launcher") === "1");
  const [openApp, setOpenApp] = useState(params.get("app"));
  const [session, setSession] = useState({
    name: params.get("name") || "",
    username: params.get("username") || "",
    password: "",
    lyriqEmail: params.get("lyriqEmail") || "",
    lyriqPassword: "",
    selectedApps: params.get("apps")
      ? params.get("apps").split(",").filter(Boolean)
      : ["workspace", "voxa", "pay", "modelhub", "agentcenter"],
    provider: params.get("provider") || "OpenAI",
    model: params.get("model") || "gpt-5",
    apiKey: "",
    keyValid: params.get("keyValid") === "1"
  });
  const [daemonState, setDaemonState] = useState({
    online: false,
    apps: [],
    agents: [],
    config: null,
    system: null,
    network: null,
    error: ""
  });

  useEffect(() => {
    let cancelled = false;
    getDaemonState()
      .then((state) => {
        if (cancelled) return;
        setDaemonState({ online: true, ...state, error: "" });
        setSession((current) => ({
          ...current,
          provider: state.config.provider || current.provider,
          model: state.config.model || current.model,
          keyValid: state.config.keyValid || current.keyValid
        }));
      })
      .catch((error) => {
        if (!cancelled) setDaemonState((current) => ({ ...current, online: false, error: error.message }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const next = () => {
    if (mode === "setup" && step < onboarding.length - 1) setStep(step + 1);
    if (mode === "setup" && step === onboarding.length - 1) setMode("lock");
  };

  const refreshDaemonState = () => {
    getDaemonState()
      .then((state) => setDaemonState({ online: true, ...state, error: "" }))
      .catch((error) => setDaemonState((current) => ({ ...current, online: false, error: error.message })));
  };

  const runPowerAction = async (action) => {
    try {
      await requestPower(action);
      refreshDaemonState();
    } catch {
      // UI still previews the action when the daemon is offline.
    }
    setLauncher(false);
    setOpenApp(null);
    if (action === "sleep") setMode("lock");
    if (action === "restart") setMode("boot");
    if (action === "shutdown") setMode("shutdown");
  };

  if ((mode === "setup" && step === 0) || mode === "boot") {
    return <BootSequence phaseOverride={bootPhase} onComplete={() => setStep(1)} />;
  }

  if (mode === "setup") {
    return (
      <Stage label={onboarding[step].title}>
        <SetupWizard
          step={step}
          setStep={setStep}
          session={session}
          setSession={setSession}
          onNext={next}
          onBack={() => setStep(Math.max(1, step - 1))}
        />
      </Stage>
    );
  }

  if (mode === "lock") {
    return <LockScreen session={session} onUnlock={() => setMode("desktop")} />;
  }

  if (mode === "shutdown") {
    return <ShutdownScreen onPower={() => setMode("boot")} />;
  }

  return (
    <Stage label="AgentOS Desktop" desktop>
      <DesktopIcons open={setOpenApp} />
      <Taskbar
        launcher={launcher}
        selectedApps={session.selectedApps}
        provider={session.provider}
        model={session.model}
        daemonState={daemonState}
        onLauncher={() => setLauncher(!launcher)}
        open={async (id) => {
          try { await launchApp(id); refreshDaemonState(); } catch {}
          setOpenApp(id);
        }}
      />
      <AgentCenterWidget open={() => setOpenApp("agentcenter")} />
      {launcher && (
        <Launcher
          session={session}
          selectedApps={session.selectedApps}
          initialSection={params.get("launcherSection") || "apps"}
          onClose={() => setLauncher(false)}
          open={(id) => {
            setLauncher(false);
            launchApp(id).then(refreshDaemonState).catch(() => {});
            setOpenApp(id);
          }}
          onPowerAction={runPowerAction}
        />
      )}
      {openApp && (
        <AppWindow
          appId={openApp}
          session={session}
          setSession={setSession}
          daemonState={daemonState}
          refreshDaemonState={refreshDaemonState}
          runPowerAction={runPowerAction}
          onClose={() => setOpenApp(null)}
        />
      )}
    </Stage>
  );
}

function BootSequence({ phaseOverride = null, onComplete }) {
  const bootSteps = [
    "Starting AgentOS",
    "Loading Runtime",
    "Checking Providers",
    "Starting Agents",
    "Launching Desktop"
  ];
  const [phase, setPhase] = useState(0);
  const shownPhase = Number.isInteger(phaseOverride)
    ? Math.min(Math.max(phaseOverride, 0), bootSteps.length - 1)
    : phase;

  useEffect(() => {
    if (Number.isInteger(phaseOverride)) return undefined;
    const timer = window.setInterval(() => {
      setPhase((current) => {
        if (current >= bootSteps.length - 1) {
          window.clearInterval(timer);
          window.setTimeout(onComplete, 900);
          return current;
        }
        return current + 1;
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [onComplete, phaseOverride]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Enter" || event.key === " ") onComplete();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onComplete]);

  return (
    <main className="boot-screen" aria-label="AgentOS boot screen" onDoubleClick={onComplete}>
      <div className="boot-noise" />
      <section className="boot-stack">
        <div className="boot-logo-wrap">
          <img className="boot-logo-img" src={brand("agentos-boot-mark-crop.png")} alt="AgentOS" draggable="false" />
        </div>
        <h1>Lyriq Agent<span>OS</span></h1>
        <div className="boot-progress" aria-label={bootSteps[shownPhase]}>
          {bootSteps.map((stepName, index) => (
            <span key={stepName} className={index === shownPhase ? "active" : ""} />
          ))}
        </div>
        <p>{bootSteps[shownPhase]}</p>
      </section>
    </main>
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
    <aside className="agent-widget" aria-label="Agent Center status">
      <header><strong>Agent Center</strong><span><Settings size={14} /><ChevronUp size={14} /></span></header>
      {[
        ["System Agent", "Online", Box, "green"],
        ["Workspace Agent", "Syncing", Layers3, "blue"],
        ["Model Router", "GPT-5 Connected", Cpu, "violet"]
      ].map(([name, status, Icon, color]) => (
        <button key={name} onClick={open} aria-label={`Open Agent Center, ${name} ${status}`}>
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
  const [lyriqAuthView, setLyriqAuthView] = useState("sign-in");
  const heading = onboarding[step].heading;
  const setupSteps = [
    ["local", "Local Account", User],
    ["lyriq", "Lyriq Account", UsersRound],
    ["apps", "Lyriq Apps", Layers3],
    ["providers", "AI Providers", Box],
    ["finish", "Finish Setup", Check]
  ];
  const subtitles = [
    "Set up your local account, Lyriq apps and AI providers",
    "Set up your local account, Lyriq apps and AI providers",
    "Sync your apps, agents, licenses and workspace settings",
    "Choose the apps installed on first boot",
    "Connect the first provider and model router",
    "Review your setup before starting your first desktop session"
  ];
  const localReady = session.name.trim().length > 1
    && session.username.trim().length > 2
    && session.password.trim().length > 5;
  const lyriqReady = session.lyriqEmail.trim().includes("@") && session.lyriqPassword.trim().length > 0;
  const appsReady = true;
  const providerReady = session.keyValid;
  const canContinue = step === 1 ? localReady
    : step === 2 ? lyriqReady
    : step === 3 ? appsReady
    : step === 4 ? providerReady
    : true;
  const continueLabel = step === 5 ? "Start AgentOS" : step === 0 ? "Start setup" : "Continue";
  const handleContinue = () => {
    if (!canContinue) return;
    onNext();
  };

  return (
    <section className="setup-panel">
      <header className="setup-header">
        <div className="brand-row"><img src={brand("agentos-boot-mark-crop.png")} alt="AgentOS" /><strong>Agent<span>OS</span></strong></div>
        <h1>{step === 2 && lyriqAuthView === "reset" ? "Reset your Lyriq Password" : heading}</h1>
        <p>{step === 2 && lyriqAuthView === "reset" ? "Enter your Lyriq email to start password recovery" : subtitles[step]}</p>
      </header>
      <div className="setup-body">
        <aside className="setup-sidebar">
        <nav>
          {setupSteps.map(([id, label, Icon], index) => (
            <button key={id} type="button" disabled className={index + 1 === step ? "active" : index + 1 < step ? "done" : ""}>
              <span>{index + 1 < step ? <Check size={16} /> : <Icon size={18} />}</span>
              <b>{index + 1}. {label}</b>
            </button>
          ))}
        </nav>
      </aside>
        <main className="setup-content">
          {step === 0 && <WelcomePanel />}
          {step === 1 && <LocalAccount session={session} setSession={setSession} />}
          {step === 2 && lyriqAuthView === "sign-in" && (
            <LyriqAccount
              session={session}
              setSession={setSession}
              canSignIn={lyriqReady}
              onSignIn={onNext}
              onForgotPassword={() => setLyriqAuthView("reset")}
            />
          )}
          {step === 2 && lyriqAuthView === "reset" && (
            <LyriqPasswordReset
              session={session}
              setSession={setSession}
              onBack={() => setLyriqAuthView("sign-in")}
            />
          )}
          {step === 3 && <AppPicker session={session} setSession={setSession} />}
          {step === 4 && <ProviderSetup session={session} setSession={setSession} />}
          {step === 5 && <FinishPanel session={session} />}
        </main>
      </div>
      <footer className="setup-footer">
        <div className="system-mini"><span>US</span><Wifi size={16} /><MonitorCog size={16} /><span>10:42 AM</span></div>
        {step !== 2 && <div className="setup-actions">
        {step > 1 && <button className="secondary" onClick={onBack}>Back</button>}
        {(step === 3 || step === 4) && <button className="skip-action" onClick={onNext}>Skip for now</button>}
        <button className="primary" disabled={!canContinue} onClick={handleContinue}>{step === 3 ? "Install Selected Apps" : continueLabel}</button>
      </div>}
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
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="form-panel account-card">
      <label>Name<input value={session.name} onChange={(e) => setSession({ ...session, name: e.target.value })} placeholder="Full name" /></label>
      <label>Username<input value={session.username} onChange={(e) => setSession({ ...session, username: e.target.value })} placeholder="username" /></label>
      <label>Password
        <span className="password-field">
          <input type={showPassword ? "text" : "password"} value={session.password} onChange={(e) => setSession({ ...session, password: e.target.value })} placeholder="Create a strong password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>
    </div>
  );
}

function LyriqAccount({ session, setSession, canSignIn, onSignIn, onForgotPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="form-panel lyriq-card">
      <label>Email<input value={session.lyriqEmail} onChange={(e) => setSession({ ...session, lyriqEmail: e.target.value })} placeholder="you@example.com" /></label>
      <label>Password
        <span className="password-field">
          <input type={showPassword ? "text" : "password"} value={session.lyriqPassword} onChange={(e) => setSession({ ...session, lyriqPassword: e.target.value })} placeholder="Enter your password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>
      <button type="button" className="forgot-auth" onClick={onForgotPassword}>Forgot password?</button>
      <button className="primary sign-in" disabled={!canSignIn} onClick={onSignIn}>Sign In</button>
      <div className="or-row"><span />or<span /></div>
      <p className="create-account">Don’t have an account? <button type="button" onClick={() => setSession({ ...session, lyriqEmail: "", lyriqPassword: "" })}>Create Lyriq Account</button></p>
      <p className="local-note"><ShieldCheck size={15} /> Your local system remains usable without cloud sync</p>
    </div>
  );
}

function LyriqPasswordReset({ session, setSession, onBack }) {
  const emailReady = session.lyriqEmail.trim().includes("@");

  return (
    <div className="form-panel lyriq-card reset-card">
      <button type="button" className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to Sign In</button>
      <div className="reset-icon"><Mail size={24} /></div>
      <label>Lyriq Email<input value={session.lyriqEmail} onChange={(e) => setSession({ ...session, lyriqEmail: e.target.value })} placeholder="you@example.com" /></label>
      <button className="primary sign-in" disabled={!emailReady}>Send Recovery Link</button>
      <p className="local-note"><ShieldCheck size={15} /> Authentication will be connected here later</p>
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
          <article key={id} className={session.selectedApps.includes(id) ? "app-tile selected" : "app-tile"}>
            <button
              type="button"
              className="app-check"
              aria-label={`${session.selectedApps.includes(id) ? "Deselect" : "Select"} ${name}`}
              aria-pressed={session.selectedApps.includes(id)}
              onClick={() => toggle(id)}
            >
              {session.selectedApps.includes(id) && <Check size={13} strokeWidth={3} />}
            </button>
            <span className="logo-slot"><Icon size={22} /></span>
            <strong>{name}</strong>
            <small>{description}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProviderSetup({ session, setSession }) {
  const models = providers[session.provider];
  const [validationMessage, setValidationMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const hasApiKey = session.apiKey.trim().length > 0;
  const validate = async () => {
    if (!hasApiKey) {
      setValidationMessage("Enter an API key before validating.");
      setSession({ ...session, keyValid: false });
      return;
    }

    setValidating(true);
    try {
      const result = await validateProvider({
        provider: session.provider,
        model: session.model,
        apiKey: session.apiKey
      });
      setValidationMessage(result.message);
      setSession({ ...session, keyValid: true });
    } catch (error) {
      setValidationMessage(error.message || "Provider validation failed.");
      setSession({ ...session, keyValid: false });
    } finally {
      setValidating(false);
    }
  };
  const updateProvider = (provider) => {
    setValidationMessage("");
    setSession({ ...session, provider, model: providers[provider][0], keyValid: false });
  };
  const updateModel = (model) => {
    setValidationMessage("");
    setSession({ ...session, model, keyValid: false });
  };
  const updateApiKey = (apiKey) => {
    setValidationMessage("");
    setSession({ ...session, apiKey, keyValid: false });
  };

  return (
    <div className="form-panel provider-card">
      <div className="provider-fields">
        <label>Provider<Select value={session.provider} onChange={updateProvider} options={Object.keys(providers)} /></label>
        <label>Model<Select value={session.model} onChange={updateModel} options={models} /></label>
      </div>
      <label>API Key
        <div className="key-row">
          <input type="password" value={session.apiKey} onChange={(e) => updateApiKey(e.target.value)} placeholder="sk-••••••••••••••••••" />
          <button type="button" onClick={validate} disabled={validating}>{validating ? "Validating" : "Validate"}</button>
        </div>
      </label>
      <p className={session.keyValid ? "status good" : "status"}>
        <span />
        {validationMessage || "Provider not validated yet"}
      </p>
      <p className="provider-note">You can add more providers later in Model Hub</p>
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
  const selectedAppNames = appCatalog
    .filter(([id]) => session.selectedApps.includes(id))
    .map(([, name]) => name);
  const appsSummary = selectedAppNames.length > 0 ? selectedAppNames.join(", ") : "No apps selected";
  const localName = session.name.trim() || "Not provided";
  const localUsername = session.username.trim() || "Not provided";
  const lyriqEmail = session.lyriqEmail.trim() || "Not connected";
  const providerStatus = session.keyValid ? "API key validated" : "Skipped";
  const providerSummary = session.keyValid
    ? `Provider: ${session.provider}`
    : "Provider: Not connected";
  const modelSummary = session.keyValid ? `Model: ${session.model}` : "Model: Not selected";
  const summaryItems = [
    {
      title: "Local Account",
      Icon: User,
      details: [`Name: ${localName}`, `Username: ${localUsername}`],
      status: localUsername === "Not provided" ? "Pending" : "Created"
    },
    {
      title: "Lyriq Account",
      Icon: UsersRound,
      details: [`Email: ${lyriqEmail}`],
      status: lyriqEmail === "Not connected" ? "Skipped" : "Connected"
    },
    {
      title: "Selected Lyriq Apps",
      Icon: Layers3,
      details: [appsSummary],
      status: selectedAppNames.length > 0 ? "Ready to install" : "Skipped"
    },
    {
      title: "Model Provider",
      Icon: Box,
      details: [providerSummary, modelSummary],
      status: providerStatus
    },
    {
      title: "System Mode",
      Icon: Settings,
      details: ["Agent runtime, app launcher, model hub and workspace sync enabled"],
      status: "Ready"
    }
  ];

  return (
    <div className="form-panel finish-card">
      <div className="finish-summary-list">
        {summaryItems.map(({ title, Icon, details, status }) => (
          <article key={title} className="finish-summary-item">
            <span className="finish-icon"><Icon size={22} /></span>
            <div className="finish-copy">
              <strong>{title}</strong>
              <p>
                {details.map((detail) => <span key={detail}>{detail}</span>)}
              </p>
            </div>
            <em>Status: <b>{status}</b></em>
            <i />
          </article>
        ))}
      </div>
      <p className="finish-note"><ShieldCheck size={15} /> You can change apps, providers and account settings later in System Settings</p>
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

function ShutdownScreen({ onPower }) {
  return (
    <main className="shutdown-screen" aria-label="AgentOS powered off">
      <button onClick={onPower} aria-label="Power on AgentOS">
        <Power size={34} />
      </button>
      <span>AgentOS is shut down</span>
    </main>
  );
}

function DesktopIcons({ open }) {
  return (
    <nav className="desktop-icons-live" aria-label="Desktop shortcuts">
      {desktopIcons.map(([id, name, Icon]) => (
        <button key={id} onClick={() => id !== "trash" && open(id)} aria-label={name}>
          <span><Icon size={25} /></span>
          {name}
        </button>
      ))}
    </nav>
  );
}

function Taskbar({ launcher, selectedApps, provider, model, daemonState, onLauncher, open }) {
  const visibleDock = dockApps.filter(([id]) => selectedApps.includes(id));
  const cpu = daemonState?.system?.resources?.cpu;
  const networkName = daemonState?.network?.active?.name;

  return (
    <div className="taskbar-live" role="toolbar" aria-label="AgentOS taskbar">
      <button className={launcher ? "launcher-button active" : "launcher-button"} onClick={onLauncher} title="Launcher" aria-label="Open launcher"><img src={brand("agentos-boot-mark-crop.png")} alt="" /></button>
      <button className="search-live" onClick={() => open("search")} aria-label="Search AgentOS"><Search size={16} /> <span>Search AgentOS</span></button>
      <nav className="dock-live">
        {visibleDock.map(([id, name, , Icon]) => (
          <button key={id} onClick={() => open(id)} title={name} aria-label={`Open ${name}`}>
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
        <span>{daemonState?.online ? `${model || provider} Online` : "Daemon Offline"}</span>
        {Number.isFinite(cpu) && <span>CPU {cpu}%</span>}
        {networkName && <span>{networkName}</span>}
        <time><strong>20:46</strong><small>Fri, Aug 14</small></time>
      </div>
    </div>
  );
}

function Launcher({ session, selectedApps, initialSection, onClose, open, onPowerAction }) {
  const [section, setSection] = useState(launcherSectionCopy[initialSection] ? initialSection : "apps");
  const [, sectionDescription] = launcherSectionCopy[section];

  return (
    <div className="reference-window launcher-reference">
      <img src={ref("launchermenu")} alt="Launcher menu" draggable="false" />
      <div className="launcher-live">
        <aside className="launcher-sidebar" aria-label="Launcher sections">
          <nav>
            {launcherSections.map(([id, label, Icon]) => (
              <button
                key={id}
                className={section === id ? "active" : ""}
                onClick={() => setSection(id)}
                aria-pressed={section === id}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="launcher-user">
            <span><User size={22} /></span>
            <strong>Augusto</strong>
            <small>@augusto</small>
          </div>
        </aside>

        <main className="launcher-main">
          <button className="launcher-close" onClick={onClose} aria-label="Close launcher"><X size={17} /></button>
          <div className="launcher-search"><Search size={16} /> Search apps, files, agents and commands</div>
          <header className="launcher-section-head">
            <strong>{launcherSectionCopy[section][0]}</strong>
            <small>{sectionDescription}</small>
          </header>
          <LauncherSection
            section={section}
            session={session}
            selectedApps={selectedApps}
            open={open}
            onClose={onClose}
            onPowerAction={onPowerAction}
          />
        </main>

        <aside className="launcher-info" aria-label="System summary">
          <dl>
            <div><dt>User:</dt><dd>Augusto</dd></div>
            <div><dt>Lyriq Account:</dt><dd>Connected <i className="ok-dot" /></dd></div>
            <div><dt>Model:</dt><dd>GPT-5 Online <i className="violet-dot" /></dd></div>
            <div><dt>Agents:</dt><dd>3 Active <i className="ok-dot" /></dd></div>
            <div><dt>Storage:</dt><dd>Healthy <i className="ok-dot" /></dd></div>
          </dl>
          <section>
            <strong>Quick Commands</strong>
            {[
              ["New Agent", UsersRound, "agentcenter"],
              ["Open Workspace", Layers3, "workspace"],
              ["Connect Model", Cpu, "modelhub"],
              ["System Settings", Settings, "settings"]
            ].map(([label, Icon, id]) => (
              <button key={label} onClick={() => open(id)}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </section>
          <footer>
            <button aria-label="Sleep"><Power size={17} /></button>
            <button aria-label="Restart"><MonitorCog size={17} /></button>
            <button aria-label="Power"><Power size={17} /></button>
          </footer>
        </aside>
        <div className="launcher-pointer" />
      </div>
    </div>
  );
}

function LauncherSection({ section, session, selectedApps, open, onClose, onPowerAction }) {
  if (section === "apps") {
    return (
      <div className="launcher-apps" role="list" aria-label="Apps">
        {launcherApps.map(([id, name, description, Icon]) => (
          <button
            key={id}
            className={selectedApps.includes(id) ? "installed" : ""}
            onClick={() => open(id)}
          >
            <span><Icon size={27} /></span>
            <strong>{name}</strong>
            <small>{description}</small>
          </button>
        ))}
      </div>
    );
  }

  const items = sectionItems[section] || [];
  return (
    <div className="launcher-apps launcher-section-grid" role="list" aria-label={launcherSectionCopy[section][0]}>
      {items.map(([id, name, description, Icon]) => (
        <button
          key={name}
          onClick={() => {
            if (section === "power") onPowerAction(id);
            else open(id === "trash" ? "files" : id);
          }}
        >
          <span><Icon size={27} /></span>
            <strong>{name}</strong>
            <small>{description}</small>
        </button>
      ))}
    </div>
  );
}

function AppWindow({ appId, session, setSession, daemonState, refreshDaemonState, runPowerAction, onClose }) {
  if (appId === "agentcenter") {
    return <AgentCenterApp session={session} daemonState={daemonState} onClose={onClose} />;
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
        {appId === "files" && <FilesApp />}
        {appId === "settings" && <SettingsApp daemonState={daemonState} refreshDaemonState={refreshDaemonState} runPowerAction={runPowerAction} />}
        {appId === "defender" || appId === "security" ? <LyriqDefenderApp daemonState={daemonState} refreshDaemonState={refreshDaemonState} /> : null}
        {appId === "terminal" && <TerminalApp daemonState={daemonState} />}
        {appId !== "modelhub" && appId !== "voxa" && appId !== "files" && appId !== "settings" && appId !== "terminal" && appId !== "defender" && appId !== "security" && <GenericMock appId={appId} />}
      </div>
    </div>
  );
}

const agentTabs = [
  ["overview", "Overview", Activity],
  ["active", "Active Agents", RefreshCcw],
  ["permissions", "Permissions", ShieldCheck],
  ["automations", "Automations", Network],
  ["memory", "Memory", Database],
  ["routing", "Model Routing", SlidersHorizontal],
  ["logs", "Logs", FileText],
  ["settings", "Settings", Settings]
];

const runtimeAgents = [
  ["system", "System Agent", "Monitors OS health, permissions, files and runtime.", Box, "Running", "green"],
  ["workspace", "Workspace Agent", "Connects Lyriq Workspace tasks, projects, files and automations.", Layers3, "Ready", "blue"],
  ["router", "Model Router", "Chooses the best compatible model based on provider, task and cost.", Network, "Active", "violet"]
];

function agentIcon(id) {
  if (id === "workspace") return Layers3;
  if (id === "router") return Network;
  return Box;
}

function titleCase(value) {
  return String(value || "").slice(0, 1).toUpperCase() + String(value || "").slice(1);
}

function AgentCenterApp({ session, daemonState, onClose }) {
  const [tab, setTab] = useState("overview");
  const [selectedAgent, setSelectedAgent] = useState("system");
  const daemonAgents = daemonState?.agents?.length
    ? daemonState.agents
    : runtimeAgents.map(([id, name, description, , status, tone]) => ({ id, name, description, status: status.toLowerCase(), tone }));
  const [running, setRunning] = useState({ system: true, workspace: false, router: true });
  const [permissions, setPermissions] = useState({
    files: true,
    network: true,
    control: false,
    sensitive: true,
    memory: true,
    notifications: true
  });
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [logLines, setLogLines] = useState([
    "16:44:10  [INFO]  Runtime initialized",
    "16:44:12  [INFO]  API key validated",
    "16:44:14  [INFO]  Model router online",
    "16:44:16  [INFO]  Workspace sync ready"
  ]);

  useEffect(() => {
    if (!daemonState?.config) return;
    setPermissions(daemonState.config.permissions || {});
    setLogLines(daemonState.config.logs || []);
    setRunning(Object.fromEntries(daemonAgents.map((agent) => [agent.id, ["running", "active"].includes(agent.status)])));
  }, [daemonState?.config]);

  const activeAgent = daemonAgents.find((agent) => agent.id === selectedAgent) || daemonAgents[0];
  const ActiveIcon = agentIcon(activeAgent.id);
  const addLog = (line) => setLogLines((lines) => [...lines.slice(-7), line]);
  const toggleRun = (id) => {
    setRunning((state) => {
      const next = !state[id];
      addLog(`16:46:${String(linesSecond()).padStart(2, "0")}  [INFO]  ${id} ${next ? "started" : "paused"}`);
      return { ...state, [id]: next };
    });
  };

  return (
    <div className="app-window agent-center-window" role="dialog" aria-label="Agent Center">
      <WindowChrome title="Agent Center" onClose={onClose} />
      <div className="agent-center-layout">
        <aside className="agent-center-sidebar" aria-label="Agent Center sections">
          <nav>
            {agentTabs.map(([id, label, Icon]) => (
              <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)} aria-pressed={tab === id}>
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="agent-center-main">
          <AgentCenterTab
            tab={tab}
            session={session}
            daemonState={daemonState}
            daemonAgents={daemonAgents}
            running={running}
            permissions={permissions}
            setPermissions={setPermissions}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            toggleRun={toggleRun}
            automationEnabled={automationEnabled}
            setAutomationEnabled={setAutomationEnabled}
            logs={logLines}
            clearLogs={() => setLogLines([])}
            addLog={addLog}
          />
        </main>

        <aside className="agent-center-details" aria-label="Agent details">
          <h3>Agent Details</h3>
          <div className="detail-agent-card">
            <span className="detail-agent-icon"><ActiveIcon size={30} /></span>
            <div>
              <strong>{activeAgent.name}</strong>
              <small className={running[activeAgent.id] ? "green" : activeAgent.tone || "blue"}>{running[activeAgent.id] ? "Running" : titleCase(activeAgent.status)}</small>
            </div>
          </div>
          <dl className="detail-list">
            <div><dt>Daemon</dt><dd>{daemonState?.online ? "Online" : "Fallback UI"}</dd></div>
            <div><dt>Current Task</dt><dd>{activeAgent.task || "Monitoring system runtime"}</dd></div>
            <div><dt>Permissions</dt><dd>{(activeAgent.permissions || ["Files", "Network", "Notifications"]).join(", ")}</dd></div>
            <div><dt>Memory Access</dt><dd>{activeAgent.memoryAccess || (permissions.memory ? "Limited" : "Off")}</dd></div>
            <div><dt>Last Activity</dt><dd>{activeAgent.lastActivity || "2 minutes ago"}</dd></div>
            <div><dt>Model Used</dt><dd>{(activeAgent.modelUsed || session.model).toUpperCase()}</dd></div>
            <div><dt>Cost Today</dt><dd>{activeAgent.costToday || "$0.00"}</dd></div>
          </dl>
          <div className="detail-permissions">
            <ToggleRow label="Allow file access" checked={permissions.files} onChange={() => setPermissions((p) => ({ ...p, files: !p.files }))} />
            <ToggleRow label="Allow network access" checked={permissions.network} onChange={() => setPermissions((p) => ({ ...p, network: !p.network }))} />
            <ToggleRow label="Allow app control" checked={permissions.control} onChange={() => setPermissions((p) => ({ ...p, control: !p.control }))} />
            <ToggleRow label="Require confirmation for sensitive actions" checked={permissions.sensitive} onChange={() => setPermissions((p) => ({ ...p, sensitive: !p.sensitive }))} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function linesSecond() {
  return Math.floor(Date.now() / 1000) % 60;
}

function AgentCenterTab(props) {
  const { tab } = props;
  if (tab === "overview") return <AgentOverview {...props} />;
  if (tab === "active") return <AgentActive {...props} />;
  if (tab === "permissions") return <AgentPermissions {...props} />;
  if (tab === "automations") return <AgentAutomations {...props} />;
  if (tab === "memory") return <AgentMemory {...props} />;
  if (tab === "routing") return <AgentRouting {...props} />;
  if (tab === "logs") return <AgentLogs logs={props.logs} clearLogs={props.clearLogs} />;
  return <AgentSettings {...props} />;
}

function AgentOverview(props) {
  const activeCount = props.daemonAgents?.filter((agent) => ["running", "active"].includes(agent.status)).length || 3;
  return (
    <>
      <h2 className="agent-section-title">Overview</h2>
      <div className="agent-metrics">
        {[
          ["Agents Active", String(activeCount), "green"],
          ["System Runtime", props.daemonState?.online ? "Online" : "Fallback", props.daemonState?.online ? "green" : "blue"],
          ["Default Model", props.session.model.toUpperCase(), "violet"],
          ["Local Permissions", "Protected", "blue"],
          ["API Status", props.session.keyValid ? "Validated" : "Pending", props.session.keyValid ? "green" : "blue"]
        ].map(([label, value, tone]) => <Metric key={label} label={label} value={value} tone={tone} />)}
      </div>
      <AgentActive {...props} compact />
      <AgentLogs logs={props.logs} clearLogs={props.clearLogs} compact />
    </>
  );
}

function Metric({ label, value, tone }) {
  return <article className="agent-metric"><small className={tone}>{label}</small><strong>{value}</strong></article>;
}

function AgentActive({ daemonAgents, running, selectedAgent, setSelectedAgent, toggleRun, compact }) {
  return (
    <section className={compact ? "agent-block compact" : "agent-block"}>
      <header><h2>Active Agents</h2>{compact && <button aria-label="Close section"><X size={13} /></button>}</header>
      <div className="agent-runtime-list">
        {daemonAgents.map((agent) => {
          const Icon = agentIcon(agent.id);
          return (
          <article key={agent.id} className={selectedAgent === agent.id ? "selected" : ""} onClick={() => setSelectedAgent(agent.id)}>
            <span className="runtime-icon"><Icon size={28} /></span>
            <div className="runtime-copy"><strong>{agent.name}</strong><small>{agent.description}</small></div>
            <em className={running[agent.id] ? "green" : agent.tone}>{running[agent.id] ? "Running" : titleCase(agent.status)}</em>
            <div className="runtime-actions">
              <button onClick={(event) => { event.stopPropagation(); toggleRun(agent.id); }}>{running[agent.id] ? <Pause size={15} /> : <Play size={15} />}{running[agent.id] ? "Pause" : "Start"}</button>
              <button onClick={(event) => event.stopPropagation()}><Settings size={15} />Settings</button>
              <button onClick={(event) => event.stopPropagation()}><FileText size={15} />Logs</button>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

function AgentPermissions({ permissions, setPermissions }) {
  const rows = [
    ["files", "File access", "Read and organize local files when explicitly requested."],
    ["network", "Network access", "Use online services, providers and workspace sync."],
    ["control", "App control", "Open apps, run approved commands and trigger local actions."],
    ["sensitive", "Sensitive confirmations", "Ask before irreversible or reputation-sensitive actions."],
    ["memory", "Memory access", "Use durable context to personalize agents."],
    ["notifications", "Notifications", "Show status, approvals and background task alerts."]
  ];
  return (
    <section className="agent-block">
      <header><h2>Permissions</h2><button><ShieldCheck size={14} />Review</button></header>
      <div className="agent-settings-list">
        {rows.map(([key, label, help]) => (
          <ToggleRow key={key} label={label} help={help} checked={permissions[key]} onChange={() => setPermissions((p) => ({ ...p, [key]: !p[key] }))} />
        ))}
      </div>
    </section>
  );
}

function AgentAutomations({ automationEnabled, setAutomationEnabled, addLog }) {
  return (
    <section className="agent-block">
      <header><h2>Automations</h2><button onClick={() => { setAutomationEnabled(!automationEnabled); addLog(`16:46:${String(linesSecond()).padStart(2, "0")}  [INFO]  automations ${automationEnabled ? "paused" : "enabled"}`); }}>{automationEnabled ? <Pause size={14} /> : <Play size={14} />}{automationEnabled ? "Pause all" : "Enable all"}</button></header>
      <div className="agent-card-grid">
        {[
          ["Workspace Sync", "Every 15 minutes", "Enabled", RefreshCcw],
          ["Permission Audit", "Daily at 09:00", "Enabled", ShieldCheck],
          ["Runtime Cleanup", "When idle", "Ready", MonitorCog],
          ["Cost Watch", "After each model call", "Active", Activity]
        ].map(([name, cadence, status, Icon]) => <AgentSmallCard key={name} Icon={Icon} name={name} detail={cadence} status={status} />)}
      </div>
    </section>
  );
}

function AgentMemory() {
  return (
    <section className="agent-block">
      <header><h2>Memory</h2><button><Database size={14} />Reindex</button></header>
      <div className="agent-card-grid">
        {[
          ["User Profile", "Founder preferences and working style.", "Limited", User],
          ["Workspace Memory", "Projects, files and product context.", "Synced", Folder],
          ["Agent Notes", "Runtime decisions and reusable context.", "Ready", FileText],
          ["Secure Vault", "Keys and secrets remain isolated.", "Locked", KeyRound]
        ].map(([name, detail, status, Icon]) => <AgentSmallCard key={name} Icon={Icon} name={name} detail={detail} status={status} />)}
      </div>
    </section>
  );
}

function AgentRouting({ session, addLog }) {
  return (
    <section className="agent-block">
      <header><h2>Model Routing</h2><button onClick={() => addLog(`16:46:${String(linesSecond()).padStart(2, "0")}  [INFO]  routing test passed`)}><Activity size={14} />Test route</button></header>
      <div className="routing-panel">
        <div><small>Provider</small><strong>{session.provider}</strong></div>
        <div><small>Primary Model</small><strong>{session.model.toUpperCase()}</strong></div>
        <div><small>Fallback</small><strong>Auto Router</strong></div>
        <div><small>Policy</small><strong>Cost balanced</strong></div>
      </div>
      <div className="neon-chart" aria-label="Routing activity chart">
        <i /><i /><i /><i /><i /><i />
      </div>
    </section>
  );
}

function AgentLogs({ logs, clearLogs, compact }) {
  return (
    <section className={compact ? "agent-block logs compact" : "agent-block logs"}>
      <header><h2>Log Preview</h2><button onClick={clearLogs}>Clear</button></header>
      <pre>{logs.length ? logs.join("\n") : "No logs to display"}</pre>
    </section>
  );
}

function AgentSettings({ permissions, setPermissions }) {
  return (
    <section className="agent-block">
      <header><h2>Settings</h2><button><HardDrive size={14} />Save</button></header>
      <div className="agent-settings-list">
        <ToggleRow label="Start Agent Center with desktop" checked onChange={() => {}} />
        <ToggleRow label="Show tray status" checked onChange={() => {}} />
        <ToggleRow label="Allow notifications" checked={permissions.notifications} onChange={() => setPermissions((p) => ({ ...p, notifications: !p.notifications }))} />
        <ToggleRow label="Reduce motion" checked={false} onChange={() => {}} />
      </div>
    </section>
  );
}

function AgentSmallCard({ Icon, name, detail, status }) {
  return (
    <article className="agent-small-card">
      <span><Icon size={22} /></span>
      <strong>{name}</strong>
      <small>{detail}</small>
      <em>{status}</em>
    </article>
  );
}

function ToggleRow({ label, help, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span><strong>{label}</strong>{help && <small>{help}</small>}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <i />
    </label>
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

function FilesApp() {
  const [filesState, setFilesState] = useState({ loading: true, location: "Home", quickAccess: [], files: [] });
  const [selected, setSelected] = useState("");

  useEffect(() => {
    getFiles()
      .then((payload) => setFilesState({ loading: false, ...payload }))
      .catch(() => setFilesState({
        loading: false,
        location: "Local Home",
        quickAccess: ["Desktop", "Documents", "Downloads", "Workspace", "Vault"],
        files: [
          { name: "Workspace", type: "folder", size: 0 },
          { name: "Documents", type: "folder", size: 0 },
          { name: "agentos-notes.md", type: "file", size: 4200 }
        ]
      }));
  }, []);

  return (
    <div className="os-files">
      <aside>
        {filesState.quickAccess.map((item) => (
          <button key={item} className={selected === item ? "active" : ""} onClick={() => setSelected(item)}>
            <Folder size={17} />{item}
          </button>
        ))}
      </aside>
      <section>
        <header>
          <strong>{selected || "Home"}</strong>
          <span>{filesState.location}</span>
          <button><Search size={15} />Search</button>
          <button><Folder size={15} />New Folder</button>
        </header>
        <div className="file-grid">
          {filesState.loading && <p>Loading files...</p>}
          {!filesState.loading && filesState.files.map((file) => (
            <button key={file.name}>
              <span>{file.type === "folder" ? <Folder size={25} /> : <FileText size={25} />}</span>
              <strong>{file.name}</strong>
              <small>{file.type === "folder" ? "Folder" : `${Math.max(1, Math.round((file.size || 0) / 1024))} KB`}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsApp({ daemonState, refreshDaemonState, runPowerAction }) {
  const [section, setSection] = useState("system");
  const [updates, setUpdates] = useState(null);
  const system = daemonState?.system;
  const network = daemonState?.network;

  const loadUpdates = async () => {
    try {
      setUpdates(await checkUpdates());
      refreshDaemonState?.();
    } catch (error) {
      setUpdates({ ok: false, message: error.message });
    }
  };

  return (
    <div className="os-settings">
      <aside>
        {[
          ["system", "System", MonitorCog],
          ["network", "Network", Wifi],
          ["security", "Security", ShieldCheck],
          ["updates", "Updates", RefreshCcw],
          ["accessibility", "Accessibility", Eye],
          ["power", "Power", Power]
        ].map(([id, label, Icon]) => (
          <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}>
            <Icon size={17} />{label}
          </button>
        ))}
      </aside>
      <section>
        {section === "system" && (
          <SettingsPanel title="System">
            <div className="settings-stats">
              <Metric label="CPU" value={`${system?.resources?.cpu ?? 0}%`} tone="blue" />
              <Metric label="Memory" value={`${system?.resources?.memory ?? 0}%`} tone="violet" />
              <Metric label="Storage" value={`${system?.resources?.storage ?? 42}%`} tone="green" />
              <Metric label="Battery" value={`${system?.resources?.battery ?? 86}%`} tone="green" />
            </div>
            <InfoRows rows={[
              ["OS", system?.os?.name || "Lyriq AgentOS"],
              ["Base", system?.os?.base || "Linux"],
              ["Hostname", system?.os?.hostname || "agentos"],
              ["Daemon", daemonState?.online ? "Online" : "Offline fallback"]
            ]} />
          </SettingsPanel>
        )}
        {section === "network" && (
          <SettingsPanel title="Network">
            <InfoRows rows={[
              ["Status", network?.connected ? "Connected" : "Offline"],
              ["Interface", network?.active?.name || "Not detected"],
              ["Address", network?.active?.address || "Unavailable"],
              ["DNS", (network?.dns || []).join(", ") || "Automatic"]
            ]} />
            <div className="wifi-list">
              {(network?.wifi || []).map((wifi) => (
                <button key={wifi.ssid}>
                  <Wifi size={18} />
                  <strong>{wifi.ssid}</strong>
                  <small>{wifi.strength}% {wifi.secured ? "secured" : "open"}</small>
                  <em>{wifi.connected ? "Connected" : "Connect"}</em>
                </button>
              ))}
            </div>
          </SettingsPanel>
        )}
        {section === "security" && (
          <SettingsPanel title="Security">
            <ToggleRow label="Require confirmation for sensitive actions" checked={daemonState?.config?.permissions?.sensitive ?? true} onChange={() => {}} />
            <ToggleRow label="Allow app network access" checked={daemonState?.config?.permissions?.network ?? true} onChange={() => {}} />
            <ToggleRow label="Protect local vault" checked onChange={() => {}} />
            <InfoRows rows={[["Vault", "Locked"], ["API Keys", "Stored by daemon only"], ["App Permissions", "Review required"]]} />
          </SettingsPanel>
        )}
        {section === "updates" && (
          <SettingsPanel title="Updates">
            <button className="settings-primary" onClick={loadUpdates}><RefreshCcw size={16} />Check for updates</button>
            {updates && <InfoRows rows={[
              ["Current", updates.current || "0.1.0"],
              ["Latest", updates.latest || "Unavailable"],
              ["Channel", updates.channel || "dev"],
              ["Signature", updates.signed ? "Verified" : "Pending"],
              ["Status", updates.updateAvailable ? "Update available" : "Up to date"]
            ]} />}
          </SettingsPanel>
        )}
        {section === "accessibility" && (
          <SettingsPanel title="Accessibility">
            <ToggleRow label="High contrast mode" checked={false} onChange={() => {}} />
            <ToggleRow label="Reduce motion" checked={false} onChange={() => {}} />
            <ToggleRow label="Keyboard focus indicators" checked onChange={() => {}} />
            <ToggleRow label="Readable window spacing" checked onChange={() => {}} />
          </SettingsPanel>
        )}
        {section === "power" && (
          <SettingsPanel title="Power">
            <div className="power-actions">
              <button onClick={() => runPowerAction("sleep")}><Power size={22} /><strong>Sleep</strong><small>Keep session ready</small></button>
              <button onClick={() => runPowerAction("restart")}><RefreshCcw size={22} /><strong>Restart</strong><small>Reload runtime</small></button>
              <button onClick={() => runPowerAction("shutdown")}><Power size={22} /><strong>Shut Down</strong><small>Power off AgentOS</small></button>
            </div>
          </SettingsPanel>
        )}
      </section>
    </div>
  );
}

function LyriqDefenderApp({ daemonState, refreshDaemonState }) {
  const [security, setSecurity] = useState(daemonState?.security || null);
  const [scanType, setScanType] = useState("quick");
  const [busy, setBusy] = useState(false);
  const state = security || {
    score: 100,
    state: "protected",
    protection: {
      realtime: true,
      firewall: true,
      ransomwareGuard: true,
      webProtection: true,
      appControl: true,
      vaultProtection: true
    },
    lastScan: { type: "Quick Scan", status: "clean", scanned: 0, threats: 0, duration: "00:00" },
    threats: [],
    quarantine: [],
    events: ["Lyriq Defender waiting for daemon"]
  };

  useEffect(() => {
    if (daemonState?.security) setSecurity(daemonState.security);
  }, [daemonState?.security]);

  const reload = async () => {
    const payload = await getSecurityStatus();
    setSecurity(payload);
    refreshDaemonState?.();
  };

  const scan = async () => {
    setBusy(true);
    try {
      const payload = await runSecurityScan(scanType);
      setSecurity(payload);
      refreshDaemonState?.();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (key) => {
    const nextEnabled = !state.protection[key];
    setSecurity({ ...state, protection: { ...state.protection, [key]: nextEnabled } });
    try {
      const payload = await setSecurityProtection(key, nextEnabled);
      setSecurity(payload);
      refreshDaemonState?.();
    } catch {
      setSecurity(state);
    }
  };

  const quarantine = async (threatId) => {
    const payload = await quarantineThreat(threatId);
    setSecurity(payload);
    refreshDaemonState?.();
  };

  return (
    <div className="defender-app">
      <section className="defender-hero">
        <div className="defender-ring" aria-label={`Protection score ${state.score}`}>
          <ShieldCheck size={38} />
          <strong>{state.score}</strong>
          <span>Security Score</span>
        </div>
        <div>
          <h3>{state.state === "protected" ? "Device protected" : "Action needed"}</h3>
          <p>Lyriq Defender monitors files, apps, network access, agent permissions and local vault activity.</p>
          <div className="defender-actions">
            <span className="select-wrap compact">
              <select value={scanType} onChange={(event) => setScanType(event.target.value)}>
                <option value="quick">Quick Scan</option>
                <option value="full">Full Scan</option>
                <option value="custom">Custom Scan</option>
              </select>
              <ChevronDown size={15} />
            </span>
            <button onClick={scan} disabled={busy}><Search size={15} />{busy ? "Scanning" : "Run Scan"}</button>
            <button onClick={reload}><RefreshCcw size={15} />Refresh</button>
          </div>
        </div>
      </section>

      <div className="defender-grid">
        <section className="defender-card">
          <header><h3>Protection Modules</h3><small>Windows Defender style controls, mapped for AgentOS.</small></header>
          <div className="defender-toggles">
            {[
              ["realtime", "Real-time protection", "Monitor files and executable changes."],
              ["firewall", "Firewall", "Control inbound and outbound network access."],
              ["ransomwareGuard", "Ransomware guard", "Protect workspace folders from suspicious writes."],
              ["webProtection", "Web protection", "Block risky domains and downloads."],
              ["appControl", "App control", "Require trust before apps control OS actions."],
              ["vaultProtection", "Vault protection", "Protect API keys and secrets from app access."]
            ].map(([key, label, help]) => (
              <ToggleRow key={key} label={label} help={help} checked={state.protection[key]} onChange={() => toggle(key)} />
            ))}
          </div>
        </section>

        <section className="defender-card">
          <header><h3>Scan Summary</h3><small>Latest local scan result.</small></header>
          <InfoRows rows={[
            ["Type", state.lastScan.type],
            ["Status", state.lastScan.status],
            ["Files scanned", String(state.lastScan.scanned)],
            ["Threats", String(state.lastScan.threats)],
            ["Duration", state.lastScan.duration]
          ]} />
          <div className="threat-list">
            {(state.threats || []).length === 0 && <p>No active threats found.</p>}
            {(state.threats || []).map((threat) => (
              <article key={threat.id}>
                <span><ShieldCheck size={18} /></span>
                <strong>{threat.name}</strong>
                <small>{threat.path}</small>
                <button onClick={() => quarantine(threat.id)}>Quarantine</button>
              </article>
            ))}
          </div>
        </section>

        <section className="defender-card wide">
          <header><h3>Security Event Log</h3><small>Daemon-side protection events.</small></header>
          <pre>{(state.events || []).join("\n")}</pre>
        </section>
      </div>
    </div>
  );
}

function SettingsPanel({ title, children }) {
  return <div className="settings-panel"><h3>{title}</h3>{children}</div>;
}

function InfoRows({ rows }) {
  return (
    <dl className="settings-info">
      {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}

function TerminalApp({ daemonState }) {
  const lines = [
    "agentosctl status",
    `daemon: ${daemonState?.online ? "online" : "offline"}`,
    `model: ${(daemonState?.config?.model || "gpt-5").toUpperCase()}`,
    `network: ${daemonState?.network?.connected ? "connected" : "offline"}`,
    "services: agent-runtime, app-registry, model-router",
    "ready."
  ];

  return <pre className="terminal-app">{lines.join("\n")}</pre>;
}

function GenericMock({ appId }) {
  const items = useMemo(() => ({
    workspace: sectionItems.files.slice(0, 4),
    pay: [
      ["wallet", "Wallet", "Credits, billing balance and spending limit.", WalletCards],
      ["subscriptions", "Subscriptions", "Plan, renewals and app licenses.", Check],
      ["usage", "Usage", "Model spend, agents and invoices.", Cpu],
      ["security", "Approvals", "Human review for sensitive spending.", ShieldCheck]
    ],
    files: sectionItems.files,
    terminal: [
      ["init", "lyra init agent", "Create a new agent project.", Terminal],
      ["status", "agentos model status", "Inspect provider and router status.", Cpu],
      ["apps", "agentos apps list", "List installed Lyriq apps.", Layers3],
      ["logs", "agentos logs tail", "Stream runtime logs.", MonitorCog]
    ],
    settings: sectionItems.settings,
    search: [
      ["apps", "Apps", "Installed apps and launcher actions.", Layers3],
      ["files", "Files", "Local files and synced folders.", Folder],
      ["settings", "Settings", "System and accessibility controls.", Settings],
      ["agents", "Agent Commands", "Commands, permissions and runtime tasks.", UsersRound]
    ],
    home: sectionItems.files.slice(0, 3)
  })[appId] || [["ready", "Ready", "Configured and available.", Check]], [appId]);

  return (
    <div className="generic-list">
      {items.map(([id, title, detail, Icon]) => (
        <button key={id}>
          <span><Icon size={20} /></span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </button>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
