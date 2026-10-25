import { Plus, X } from "lucide-react";
import { Stepper } from "./ui";

export default function SetsEditor({ sets, onChange, unit = "kg" }) {
  function updateSet(i, key, val) {
    onChange(sets.map((s, x) => (x === i ? { ...s, [key]: val, unit: s.unit || unit } : s)));
  }

  function addSet() {
    const last = sets[sets.length - 1];
    onChange([...sets, { weight: last?.weight || "", reps: last?.reps || "", unit: last?.unit || unit }]);
  }

  function removeSet(i) {
    onChange(sets.filter((_, x) => x !== i));
  }

  const defaultStep = unit === "lbs" ? 5 : 2.5;

  return (
    <div className="stack small">
      {sets.map((s, i) => {
        const setUnit = s.unit || unit;
        return (
          <div className="setCard" key={i}>
            <div className="setCardHead">
              <div className="row" style={{ gap: 8 }}>
                <span className="setNo">{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>
                  Serie {i + 1}
                </span>
              </div>
              {sets.length > 1 && (
                <button
                  type="button"
                  className="plain"
                  onClick={() => removeSet(i)}
                  aria-label={`Eliminar serie ${i + 1}`}
                  title="Eliminar serie"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="setCardBody">
              <div className="setCardCol">
                <div className="row between" style={{ marginBottom: 4 }}>
                  <small style={{ margin: 0 }}>Carga ({setUnit})</small>
                </div>
                <Stepper
                  value={s.weight}
                  onChange={(v) => updateSet(i, "weight", v)}
                  step={setUnit === "lbs" ? 5 : 2.5}
                  placeholder="0"
                />
              </div>
              <div className="setCardCol">
                <div className="row between" style={{ marginBottom: 4 }}>
                  <small style={{ margin: 0 }}>Repeticiones</small>
                </div>
                <Stepper
                  value={s.reps}
                  onChange={(v) => updateSet(i, "reps", v)}
                  step={1}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="chip dashed"
        onClick={addSet}
        style={{
          width: "100%",
          justifyContent: "center",
          padding: "12px 16px",
          borderRadius: 14,
          fontSize: 13,
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Añadir otra serie</span>
      </button>
    </div>
  );
}
