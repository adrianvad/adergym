import { useState, useMemo } from "react";
import { Flame, X, Check, ArrowRight } from "lucide-react";
import { calcWarmupSets, formatNumber } from "../lib/utils";

export default function WarmupModal({
  exerciseName,
  initialTargetWeight,
  unit = "kg",
  onApplySets,
  onClose,
}) {
  const [targetWeight, setTargetWeight] = useState(() => {
    const val = Number(initialTargetWeight);
    return val > 0 ? String(val) : unit === "lbs" ? "135" : "60";
  });

  const [increment, setIncrement] = useState(unit === "lbs" ? 5 : 2.5);

  const increments = unit === "lbs" ? [2.5, 5, 10] : [1.25, 2.5, 5];

  const warmupSteps = useMemo(() => {
    return calcWarmupSets(Number(targetWeight), unit, increment);
  }, [targetWeight, unit, increment]);

  function handleApply() {
    if (!warmupSteps.length) return;
    const mapped = warmupSteps.map((s) => ({
      weight: String(s.weight),
      reps: String(s.reps),
      unit: s.unit || unit,
    }));
    // Also append the target working set
    mapped.push({
      weight: String(targetWeight),
      reps: "8",
      unit,
    });
    onApplySets(mapped);
    onClose();
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalSheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "88vh" }}>
        <div className="modalHandle" />
        <div className="modalHead">
          <div className="row" style={{ gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(244, 63, 94, 0.14)",
                color: "var(--rose)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Flame size={17} />
            </div>
            <div>
              <strong style={{ fontSize: 17 }}>Calculadora de calentamiento</strong>
              <div className="muted" style={{ fontSize: 12 }}>
                {exerciseName} · Progresión sin fatiga
              </div>
            </div>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="stack small" style={{ overflowY: "auto", paddingRight: 2 }}>
          {/* Target Weight Field */}
          <div
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
            }}
          >
            <div className="row between" style={{ marginBottom: 6 }}>
              <label style={{ margin: 0 }}>Peso objetivo de trabajo ({unit})</label>
              <span className="muted" style={{ fontSize: 11 }}>Carga para tu serie principal</span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step={increment}
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder={`Ej. ${unit === "lbs" ? "135" : "60"}`}
              style={{ fontSize: 16, fontWeight: 700 }}
              autoFocus
            />
          </div>

          {/* Plate Increment Selector */}
          <div
            className="row between"
            style={{
              padding: "10px 14px",
              background: "var(--surface-inset)",
              border: "1px solid var(--border)",
              borderRadius: 14,
            }}
          >
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, display: "block" }}>
                Incremento de disco
              </span>
              <span className="muted" style={{ fontSize: 11 }}>
                Redondeo por lado de barra
              </span>
            </div>
            <div className="chips" style={{ margin: 0 }}>
              {increments.map((inc) => (
                <button
                  type="button"
                  key={inc}
                  className={increment === inc ? "chip small active" : "chip small"}
                  onClick={() => setIncrement(inc)}
                  style={{ padding: "4px 8px" }}
                >
                  {inc} {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Warmup Sets Breakdown List */}
          <div style={{ marginTop: 6 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                Progresión piramidal sugerida
              </span>
              <span className="muted tabular" style={{ fontSize: 11 }}>
                {warmupSteps.length} series de aproximación
              </span>
            </div>

            <div className="stack small">
              {warmupSteps.map((step) => (
                <div
                  key={step.setNumber}
                  style={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="row" style={{ gap: 10 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        background: "rgba(244, 63, 94, 0.12)",
                        color: "var(--rose)",
                        fontSize: 12,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.setNumber}
                    </span>
                    <div>
                      <div className="row" style={{ gap: 6, alignItems: "baseline" }}>
                        <strong className="tabular" style={{ fontSize: 15 }}>
                          {formatNumber(step.weight)} {unit}
                        </strong>
                        <span className="muted tabular" style={{ fontSize: 13 }}>
                          × {step.reps} reps
                        </span>
                      </div>
                      <small className="muted" style={{ fontSize: 11 }}>
                        {step.percent}% — {step.label}
                      </small>
                    </div>
                  </div>

                  <span
                    className="tabular"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      background: "var(--surface-inset)",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {step.percent}%
                  </span>
                </div>
              ))}

              {/* Working set target indicator */}
              <div
                style={{
                  background: "rgba(6, 182, 212, 0.08)",
                  border: "1px dashed rgba(6, 182, 212, 0.4)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "var(--cyan-glow)",
                      color: "var(--cyan)",
                      fontSize: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ★
                  </span>
                  <div>
                    <strong className="tabular" style={{ fontSize: 15, color: "var(--cyan)" }}>
                      {targetWeight} {unit}
                    </strong>
                    <div className="muted" style={{ fontSize: 11 }}>
                      Serie de trabajo principal (100%)
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--cyan)",
                    textTransform: "uppercase",
                  }}
                >
                  Objetivo
                </span>
              </div>
            </div>
          </div>

          <div className="two" style={{ marginTop: 14, gap: 10 }}>
            <button
              type="button"
              className="secondary full"
              onClick={onClose}
              style={{ height: 46 }}
            >
              <span>Descartar</span>
            </button>
            <button
              type="button"
              className="primary full"
              onClick={handleApply}
              disabled={!warmupSteps.length}
              style={{ height: 46 }}
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Cargar en sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
