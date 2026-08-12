import { Plus, X } from "lucide-react";
import { Stepper } from "./ui";

export default function SetsEditor({ sets, onChange }) {
  function updateSet(i, key, val) {
    onChange(sets.map((s, x) => (x === i ? { ...s, [key]: val } : s)));
  }

  function addSet() {
    const last = sets[sets.length - 1];
    onChange([...sets, { weight: last?.weight || "", reps: last?.reps || "" }]);
  }

  function removeSet(i) {
    onChange(sets.filter((_, x) => x !== i));
  }

  return (
    <div className="stack small">
      {sets.map((s, i) => (
        <div className="setCard" key={i}>
          <div className="setCardHead">
            <span className="setNo">{i + 1}</span>
            {sets.length > 1 && (
              <button className="plain" onClick={() => removeSet(i)}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="setCardBody">
            <div className="setCardCol">
              <small>kg</small>
              <Stepper
                value={s.weight}
                onChange={(v) => updateSet(i, "weight", v)}
                step={2.5}
                placeholder="0"
              />
            </div>
            <div className="setCardCol">
              <small>reps</small>
              <Stepper
                value={s.reps}
                onChange={(v) => updateSet(i, "reps", v)}
                step={1}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      ))}

      <button className="linkBtn" onClick={addSet}>
        <Plus size={14} /> Añadir serie
      </button>
    </div>
  );
}
