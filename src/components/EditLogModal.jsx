import { useState } from "react";
import { X } from "lucide-react";
import SetsEditor from "./SetsEditor";

export default function EditLogModal({ log, exerciseName, onSave, onClose }) {
  const [date, setDate] = useState(log.date);
  const [sets, setSets] = useState(
    log.sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps) }))
  );

  function handleSave() {
    const valid = sets
      .filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0)
      .map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) }));

    if (!valid.length) return;
    onSave({ ...log, date, sets: valid });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalSheet" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <strong>Editar · {exerciseName}</strong>
          <button className="iconBtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="stack">
          <div>
            <label>Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <SetsEditor sets={sets} onChange={setSets} />

          <button className="primary" onClick={handleSave}>
            GUARDAR CAMBIOS
          </button>
        </div>
      </div>
    </div>
  );
}
