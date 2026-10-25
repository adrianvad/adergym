import { Activity, ChevronRight, Minus, Plus, ArrowLeft } from "lucide-react";
import { ResponsiveContainer } from "recharts";

export function Card({ children, className = "", onClick }) {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
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
      <div className="muted" style={{ fontSize: 11, marginBottom: 2 }}>{label}</div>
      <div className="row" style={{ gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--cyan)",
            display: "inline-block",
          }}
        />
        <strong className="tabular">
          {Number(payload[0].value).toLocaleString("es-PE")}
          {suffix}
        </strong>
      </div>
    </div>
  );
}

export function Empty({ title, text, action, actionLabel = "Empezar ahora" }) {
  return (
    <div className="empty">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "rgba(6, 182, 212, 0.12)",
          color: "var(--cyan)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Activity size={24} strokeWidth={2.2} />
      </div>
      <strong style={{ fontSize: 15 }}>{title}</strong>
      <span>{text}</span>
      {action && (
        <button className="primary compact" onClick={action} style={{ marginTop: 6 }}>
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
      <ChevronRight size={18} />
    </button>
  );
}

export function Stat({ icon, value, label }) {
  return (
    <div className="stat">
      <span className="statIcon">{icon}</span>
      <strong className="tabular">{value}</strong>
      <small>{label}</small>
    </div>
  );
}

export function MiniStat({ label, value }) {
  return (
    <div className="mini">
      <span>{label}</span>
      <strong className="tabular">{value}</strong>
    </div>
  );
}

export function SubHeader({ title, onBack }) {
  return (
    <div className="subHeader">
      <button className="iconBtn" onClick={onBack} aria-label="Volver">
        <ArrowLeft size={18} />
      </button>
      <h2>{title}</h2>
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

// Numeric input with tactile +/- controls — lets the user log a set
// tapping comfortably instead of typing on a phone keyboard every single time.
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
        <Minus size={15} strokeWidth={2.5} />
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
        <Plus size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
