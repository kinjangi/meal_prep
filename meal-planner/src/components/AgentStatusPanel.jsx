import React from 'react';
import './AgentStatusPanel.css';

/**
 * AgentStatusPanel
 * ----------------
 * Displays a vertical list of agent steps, each with a status:
 *   "pending"  — dim, waiting
 *   "active"   — violet glow, pulsing dot, "thinking"
 *   "done"     — check mark, muted
 *
 * Props:
 *   steps        Array<{ label: string, status: "pending"|"active"|"done" }>
 *   thinkingText Optional string shown beneath the active step
 */
export default function AgentStatusPanel({ steps = [], thinkingText }) {
  return (
    <div className="agent-panel">
      <ol className="agent-steps">
        {steps.map((step, i) => (
          <li key={i} className={`agent-step agent-step--${step.status}`}>
            <span className="agent-step__icon" aria-hidden="true">
              {step.status === 'done'   && <CheckIcon />}
              {step.status === 'active' && <ActiveDot />}
              {step.status === 'pending'&& <PendingDot />}
            </span>
            <span className="agent-step__label">{step.label}</span>
          </li>
        ))}
      </ol>
      {thinkingText && (
        <p className="agent-thinking-text">
          <span className="agent-thinking-cursor" aria-hidden="true" />
          {thinkingText}
        </p>
      )}
    </div>
  );
}

/* ── tiny inline SVG helpers ── */
function CheckIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ActiveDot() {
  return <span className="agent-active-dot" />;
}

function PendingDot() {
  return <span className="agent-pending-dot" />;
}
