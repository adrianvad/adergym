import { Activity, ChevronRight, Minus, Plus, ArrowLeft } from "lucide-react";
import { ResponsiveContainer } from "recharts";

export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return <div className="sectionTitle">{children}</div>;
}

export function Chart({ height, children }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  );
}

export function ChartTip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <div className="muted">{label}</div>
      <strong>
        {payload[0].value}
        {suffix}
      </strong>
    </div>
  );
}

export function Empty({ title, text, action, actionLabel = "EMPEZAR" }) {
  return (
    <div className="empty">
      <Activity size={30} />
      <strong>{title}</strong>
      <span>{text}</span>
      {action && (
        <button className="primary compact" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function MenuButton({ icon, title, text, onClick }) {
  return (
    <button className="menuButton" onClick={onClick}>
      <span className="menuIcon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <ChevronRight />
    </button>
  );
}

export function Stat({ icon, value, label }) {
  return (
    <div className="stat">
      <span className="statIcon">{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

export function MiniStat({ label, value }) {
  return (
    <div className="mini">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function SubHeader({ title, onBack }) {
  return (
    <div className="subHeader">
      <button className="iconBtn" onClick={onBack}>
        <ArrowLeft size={20} />
      </button>
      <h2 className="display">{title}</h2>
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="progress">
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

// Numeric input with tactile +/- controls — lets the user log a set
// tapping instead of typing on a phone keyboard every single time.
export function Stepper({ value, onChange, step = 1, placeholder, min = 0 }) {
  function bump(delta) {
    const current = Number(value) || 0;
    const next = Math.round((current + delta) * 100) / 100;
    onChange(String(next < min ? min : next));
  }

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepperBtn"
        onClick={() => bump(-step)}
        aria-label="Restar"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="stepperBtn"
        onClick={() => bump(step)}
        aria-label="Sumar"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
