import { useState } from "react";
import { X } from "lucide-react";
import SetsEditor from "./SetsEditor";

export default function EditLogModal({
  log,
  exerciseName,
  exerciseUnit = "kg",
  onSave,
  onClose,
}) {
  const [date, setDate] = useState(log.date);
  const [sets, setSets] = useState(
    log.sets.map((s) => ({
      weight: String(s.weight),
      reps: String(s.reps),
      unit: s.unit || exerciseUnit || "kg",
    }))
  );

  function handleSave() {
    const valid = sets
      .filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0)
      .map((s) => ({
        weight: Number(s.weight),
        reps: Number(s.reps),
        unit: s.unit || exerciseUnit || "kg",
      }));

    if (!valid.length) return;
    onSave({ ...log, date, sets: valid });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalSheet" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.2)",
            margin: "0 auto 16px",
          }}
        />
        <div className="modalHead">
          <div>
            <strong style={{ fontSize: 17 }}>Editar entrenamiento</strong>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {exerciseName}
            </div>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="stack">
          <div>
            <label>Fecha de la sesión</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label style={{ marginBottom: 10 }}>Series registradas</label>
            <SetsEditor sets={sets} onChange={setSets} unit={exerciseUnit} />
          </div>

          <button className="primary full" onClick={handleSave} style={{ height: 50, marginTop: 10 }}>
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
}
