import React, { useState, useEffect, useMemo, useRef } from "react";
import { Mic, CheckCircle2, ChevronRight } from "lucide-react";

const T = {
  ink: "#0f1720",
  paper: "#ffffff",
  paperLine: "#e6e6e6",
  marigold: "#c77a00",
  marigoldDeep: "#b15f00",
  mutedOnPaper: "#9aa3ad",
  textOnPaper: "#0f1720",
};

const STEPS = [
  { id: 1, label: "Start" },
  { id: 2, label: "Select" },
  { id: 3, label: "Transcript" },
  { id: 4, label: "Flags" },
  { id: 5, label: "Verifier" },
  { id: 6, label: "Ledger" },
];

const CLIPS = [
  { id: "c1", tag: "Clip A", duration: "0:10", waveform: Array.from({ length: 20 }, () => Math.random()) },
  { id: "c2", tag: "Clip B", duration: "0:08", waveform: Array.from({ length: 20 }, () => Math.random()) },
  { id: "c3", tag: "Clip C", duration: "0:12", waveform: Array.from({ length: 20 }, () => Math.random()) },
];

function Waveform({ bars = [], color = "#e6e6e6", height = 24 }) {
  return (
    <svg width="100%" height={height} aria-hidden="true">
      {bars.map((v, i) => (
        <rect key={i} x={`${(i / bars.length) * 100}%`} y={0} width={`${100 / bars.length}%`} height={Math.max(1, Math.round(v * height))} fill={color} />
      ))}
    </svg>
  );
}

function PrimaryButton({ children, onClick, disabled, icon: Icon }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="primary-btn">
      {children} {Icon && <Icon size={16} aria-hidden="true" />}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon }) {
  return (
    <button type="button" onClick={onClick} className="ghost-btn">
      {Icon && <Icon size={16} aria-hidden="true" />} {children}
    </button>
  );
}

function StampRail({ step, furthest, onJump }) {
  const [focusedIndex, setFocusedIndex] = useState(() => {
    const currentIdx = STEPS.findIndex((s) => s.id === step);
    if (currentIdx !== -1 && STEPS[currentIdx].id <= furthest) return currentIdx;
    return Math.max(0, Math.min(furthest - 1, STEPS.length - 1));
  });
  const itemRefs = useRef([]);

  useEffect(() => {
    if (focusedIndex > furthest - 1) {
      setFocusedIndex(Math.max(0, furthest - 1));
    }
  }, [furthest, focusedIndex]);

  useEffect(() => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx !== -1 && STEPS[idx].id <= furthest) {
      setFocusedIndex(idx);
    }
  }, [step, furthest]);

  useEffect(() => {
    const btn = itemRefs.current[focusedIndex];
    if (btn && typeof btn.focus === "function") {
      btn.focus();
    }
  }, [focusedIndex]);

  function handleKeyDown(e, idx) {
    if (e.key === "ArrowLeft" || e.key === "Left") {
      e.preventDefault();
      for (let i = idx - 1; i >= 0; i--) {
        if (STEPS[i].id <= furthest) {
          setFocusedIndex(i);
          break;
        }
      }
    } else if (e.key === "ArrowRight" || e.key === "Right") {
      e.preventDefault();
      for (let i = idx + 1; i < STEPS.length; i++) {
        if (STEPS[i].id <= furthest) {
          setFocusedIndex(i);
          break;
        }
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(STEPS.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const s = STEPS[idx];
      if (s.id <= furthest) onJump(s.id);
    }
  }

  return (
    <div className="stamp-rail" role="tablist" aria-label="Progress" aria-orientation="horizontal">
      {STEPS.map((s, i) => {
        const done = s.id < step;
        const current = s.id === step;
        const reachable = s.id <= furthest;
        return (
          <React.Fragment key={s.id}>
            <button
              type="button"
              ref={(el) => (itemRefs.current[i] = el)}
              onClick={() => {
                if (reachable) {
                  setFocusedIndex(i);
                  onJump(s.id);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onFocus={() => setFocusedIndex(i)}
              role="tab"
              aria-selected={current}
              aria-label={`Step ${s.id}: ${s.label}`}
              aria-disabled={!reachable}
              tabIndex={i === focusedIndex ? 0 : -1}
              className={`stamp-item ${done ? "done" : ""} ${current ? "current" : ""} ${!reachable ? "locked" : ""}`}>
              <div className="stamp-dot" aria-hidden>
                {done ? "\u2713" : s.id}
              </div>
              <span className="stamp-label">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`stamp-rail-gap ${s.id < step ? "filled" : ""}`} aria-hidden />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RovingClipList({ CLIPS, selectedId, onSelect }) {
  const [focusedIdx, setFocusedIdx] = useState(() => {
    const selIdx = CLIPS.findIndex((c) => c.id === selectedId);
    return selIdx >= 0 ? selIdx : 0;
  });
  const refs = useRef([]);

  useEffect(() => {
    const selIdx = CLIPS.findIndex((c) => c.id === selectedId);
    if (selIdx >= 0) setFocusedIdx(selIdx);
  }, [selectedId, CLIPS]);

  useEffect(() => {
    const el = refs.current[focusedIdx];
    if (el && typeof el.focus === "function") el.focus();
  }, [focusedIdx]);

  function onKeyDown(e, idx) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => (i - 1 + CLIPS.length) % CLIPS.length);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => (i + 1) % CLIPS.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIdx(CLIPS.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(CLIPS[idx].id);
    }
  }

  return (
    <>
      {CLIPS.map((c, idx) => {
        const active = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            ref={(el) => (refs.current[idx] = el)}
            onClick={() => {
              onSelect(c.id);
              setFocusedIdx(idx);
            }}
            onKeyDown={(e) => onKeyDown(e, idx)}
            onFocus={() => setFocusedIdx(idx)}
            className={`clip-item ${active ? "active" : ""}`}
            aria-pressed={active}
            aria-label={`${c.tag}, duration ${c.duration}`}
            tabIndex={idx === focusedIdx ? 0 : -1}>
            <div className="clip-icon"><Mic size={18} aria-hidden="true" /></div>
            <div className="clip-body">
              <div className="clip-head">
                <span className="clip-tag">{c.tag}</span>
                <span className="clip-duration">{c.duration}</span>
              </div>
              <Waveform bars={c.waveform} color={active ? T.marigoldDeep : T.paperLine} height={28} />
            </div>
            {active && <CheckCircle2 size={20} aria-hidden="true" />}
          </button>
        );
      })}
    </>
  );
}

function StepStart({ onNext }) {
  return (
    <div className="step start" role="region" aria-labelledby="step-start-heading">
      <h2 id="step-start-heading">Welcome</h2>
      <p className="muted">This walkthrough demonstrates the verifier flow.</p>
      <div className="actions">
        <PrimaryButton onClick={onNext} icon={ChevronRight}>Get started</PrimaryButton>
      </div>
    </div>
  );
}

function StepSelect({ onSelect, selectedId, onNext }) {
  return (
    <div className="step select" role="region" aria-labelledby="step-select-heading">
      <h2 id="step-select-heading">Pick a sample voice note</h2>
      <p className="muted">Three pre-recorded clips stand in for live audio, so the walkthrough stays reliable for a demo.</p>

      <div className="clip-list">
        <RovingClipList CLIPS={CLIPS} selectedId={selectedId} onSelect={onSelect} />
      </div>

      <div className="actions">
        <PrimaryButton onClick={onNext} disabled={!selectedId} icon={ChevronRight}>Transcribe this clip</PrimaryButton>
      </div>
    </div>
  );
}

function StepLedger({ log = [], onBack, onRestart }) {
  return (
    <div className="step ledger" role="region" aria-labelledby="step-ledger-heading">
      <h2 id="step-ledger-heading">Trust log</h2>
      <p className="muted">A record of verification decisions.</p>
      <ul>
        {log.map((r, i) => (
          <li key={i}>{r.status} — {r.verifier}</li>
        ))}
      </ul>
      <div className="actions">
        <GhostButton onClick={onBack}>Back</GhostButton>
        <PrimaryButton onClick={onRestart}>Restart</PrimaryButton>
      </div>
    </div>
  );
}

export default function EchoVerifyPrototype() {
  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [log, setLog] = useState([]);
  const mainRef = useRef(null);

  function goto(n) {
    setStep(n);
    setFurthest((f) => Math.max(f, n));
  }

  function restart() {
    setStep(1);
    setFurthest(1);
    setSelectedId(null);
    setDecisions({});
    setLog([]);
  }

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    const heading = container.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, [step]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <div className="echo-verify-root" style={{ background: T.ink, minHeight: "100vh", color: T.paper }}>
        <div className="topbar">
          <div className="brand">EchoVerify Prototype</div>
        </div>

        <nav aria-label="Primary">
          <StampRail step={step} furthest={furthest} onJump={(n) => goto(n)} />
        </nav>

        <main id="main-content" ref={mainRef} className="panel" role="main" aria-live="polite">
          {step === 1 && <StepStart onNext={() => goto(2)} />}
          {step === 2 && <StepSelect onSelect={(id) => setSelectedId(id)} selectedId={selectedId} onNext={() => goto(3)} />}
          {step === 6 && <StepLedger log={log} onBack={() => goto(5)} onRestart={restart} />}
        </main>

        <div id="a11y-announcer" aria-live="polite" className="visually-hidden">
          {log.length > 0 ? `${log[log.length - 1].status} by ${log[log.length - 1].verifier}` : ""}
        </div>
      </div>
    </>
  );
}
