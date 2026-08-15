import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Cpu,
  Eye,
  EyeOff,
  Folder,
  Globe2,
  Home,
  Layers3,
  Lock,
  Mail,
  MonitorCog,
  Power,
  Search,
  Settings,
  ShieldCheck,
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
  ...appCatalog.filter(([id]) => ["workspace", "voxa", "pay", "modelhub", "agentcenter", "files", "terminal", "settings"].includes(id)),
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

  const next = () => {
    if (mode === "setup" && step < onboarding.length - 1) setStep(step + 1);
    if (mode === "setup" && step === onboarding.length - 1) setMode("lock");
  };

  const runPowerAction = (action) => {
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
        onLauncher={() => setLauncher(!launcher)}
        open={setOpenApp}
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
  const hasApiKey = session.apiKey.trim().length > 0;
  const validate = () => {
    if (!hasApiKey) {
      setValidationMessage("Enter an API key before validating.");
      setSession({ ...session, keyValid: false });
      return;
    }

    setValidationMessage(`${session.provider} key validated. ${session.model} is ready.`);
    setSession({ ...session, keyValid: true });
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
          <button type="button" onClick={validate}>Validate</button>
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

function Taskbar({ launcher, selectedApps, provider, model, onLauncher, open }) {
  const visibleDock = dockApps.filter(([id]) => selectedApps.includes(id));

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
        <span>{model || provider} Online</span>
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
