import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Box,
  ChevronUp,
  CircleDollarSign,
  Cpu,
  Folder,
  Home,
  Layers3,
  MonitorCog,
  Search,
  Settings,
  Terminal,
  Trash2,
  UsersRound,
  Volume2,
  WalletCards,
  Wifi
} from "lucide-react";
import "./styles.css";

const ref = (name) => `/assets/reference/${name}.png`;

const setupScreens = [
  { id: "boot1", src: ref("boot1"), label: "Boot" },
  { id: "enter1", src: ref("enter1"), label: "Local Account" },
  { id: "enter2", src: ref("enter2"), label: "Lyriq Account" },
  { id: "enter3", src: ref("enter3"), label: "Apps" },
  { id: "enter4", src: ref("enter4"), label: "AI Providers" },
  { id: "enter5", src: ref("enter5"), label: "Finish" }
];

const dockApps = [
  ["Lyriq Workspace", Layers3],
  ["VOXA Chat", UsersRound],
  ["Agent Pay", WalletCards],
  ["Model Hub", Cpu],
  ["Files", Folder],
  ["Terminal", Terminal],
  ["Settings", Settings]
];

const desktopIcons = [
  ["Home", Home],
  ["Lyriq Workspace", Layers3],
  ["VOXA Chat", UsersRound],
  ["Model Hub", Cpu],
  ["Agent Center", Box],
  ["Trash", Trash2]
];

function App() {
  const [mode, setMode] = useState("setup");
  const [step, setStep] = useState(0);
  const [launcher, setLauncher] = useState(false);
  const [agentCenter, setAgentCenter] = useState(false);

  const nextSetup = () => {
    if (step < setupScreens.length - 1) setStep(step + 1);
    else setMode("desktop");
  };

  if (mode === "setup") {
    return (
      <ReferenceStage image={setupScreens[step].src} label={setupScreens[step].label}>
        <button className="hotspot setup-next" onClick={nextSetup}>{step === setupScreens.length - 1 ? "Enter AgentOS" : "Continue"}</button>
        {step > 0 && <button className="hotspot setup-back" onClick={() => setStep(step - 1)}>Back</button>}
        <div className="step-switcher">
          {setupScreens.map((screen, index) => (
            <button key={screen.id} className={index === step ? "active" : ""} onClick={() => setStep(index)}>{index + 1}</button>
          ))}
        </div>
      </ReferenceStage>
    );
  }

  return (
    <ReferenceStage image={ref("desktop")} label="AgentOS Desktop">
      <DesktopIcons onAgentCenter={() => setAgentCenter(true)} />
      <Taskbar
        launcher={launcher}
        onLauncher={() => setLauncher(!launcher)}
        onAgentCenter={() => setAgentCenter(true)}
      />
      {launcher && <Launcher onClose={() => setLauncher(false)} onAgentCenter={() => setAgentCenter(true)} />}
      {agentCenter && <AgentCenter onClose={() => setAgentCenter(false)} />}
    </ReferenceStage>
  );
}

function ReferenceStage({ image, label, children }) {
  return (
    <main className="stage" aria-label={label}>
      <img className="reference" src={image} alt={label} draggable="false" />
      <div className="interactive-layer">{children}</div>
    </main>
  );
}

function DesktopIcons({ onAgentCenter }) {
  return (
    <div className="desktop-icons-live">
      {desktopIcons.map(([name, Icon]) => (
        <button key={name} onClick={name === "Agent Center" ? onAgentCenter : undefined}>
          <span><Icon size={25} /></span>
          {name}
        </button>
      ))}
    </div>
  );
}

function Taskbar({ launcher, onLauncher, onAgentCenter }) {
  return (
    <div className="taskbar-live">
      <button className={launcher ? "launcher-button active" : "launcher-button"} onClick={onLauncher}><Box size={27} /></button>
      <button className="search-live"><Search size={16} /> Search AgentOS</button>
      <nav className="dock-live">
        {dockApps.map(([name, Icon]) => (
          <button key={name} onClick={name === "Model Hub" ? onAgentCenter : undefined} title={name}>
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
        <Settings size={16} />
        <button onClick={onAgentCenter}>Agents Active</button>
        <span>GPT-5 Online</span>
        <time><strong>16:46</strong><small>Fri, Aug 14</small></time>
      </div>
    </div>
  );
}

function Launcher({ onClose, onAgentCenter }) {
  return (
    <div className="reference-window launcher-reference">
      <img src={ref("launchermenu")} alt="Launcher menu" draggable="false" />
      <button className="close-hit" onClick={onClose}>Close</button>
      <button className="launcher-hit workspace">Lyriq Workspace</button>
      <button className="launcher-hit voxa">VOXA Chat</button>
      <button className="launcher-hit pay">Agent Pay</button>
      <button className="launcher-hit models" onClick={onAgentCenter}>Model Hub</button>
      <button className="launcher-hit agents" onClick={onAgentCenter}>Agent Center</button>
    </div>
  );
}

function AgentCenter({ onClose }) {
  return (
    <div className="reference-window agent-center-reference">
      <img src={ref("agentcenter")} alt="Agent Center" draggable="false" />
      <button className="close-hit agent-close" onClick={onClose}>Close</button>
      <button className="agent-action pause">Pause</button>
      <button className="agent-action settings">Settings</button>
      <button className="agent-action logs">Logs</button>
      <label className="toggle-hit file"><input type="checkbox" defaultChecked /> File access</label>
      <label className="toggle-hit network"><input type="checkbox" defaultChecked /> Network access</label>
      <label className="toggle-hit control"><input type="checkbox" /> App control</label>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
