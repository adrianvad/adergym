import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { uid } from "../lib/utils";

export default function RoutineModal({ routine, exercises, onSave, onClose }) {
  const isEditing = Boolean(routine?.id);
  const [name, setName] = useState(routine?.name || "");
  const [description, setDescription] = useState(routine?.description || "");
  const [items, setItems] = useState(() => {
    if (routine?.exercises && routine.exercises.length > 0) {
      return routine.exercises.map((item) => ({
        id: uid("item"),
        exerciseId: item.exerciseId,
        targetSets: item.targetSets || 3,
        targetReps: item.targetReps || "8-10",
      }));
    }
    return [
      {
        id: uid("item"),
        exerciseId: exercises[0]?.id || "",
        targetSets: 3,
        targetReps: "8-10",
      },
    ];
  });
  const [error, setError] = useState("");

  function addItem() {
    setItems([
      ...items,
      {
        id: uid("item"),
        exerciseId: exercises[0]?.id || "",
        targetSets: 3,
        targetReps: "10-12",
      },
    ]);
  }

  function updateItem(index, key, val) {
    setItems(items.map((item, idx) => (idx === index ? { ...item, [key]: val } : item)));
  }

  function removeItem(index) {
    if (items.length <= 1) {
      setError("La rutina debe incluir al menos un ejercicio.");
      return;
    }
    setError("");
    setItems(items.filter((_, idx) => idx !== index));
  }

  function moveItem(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setItems(next);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Introduce un nombre para la rutina.");
      return;
    }
    if (!items.length) {
      setError("Añade al menos un ejercicio a la rutina.");
      return;
    }

    const cleanItems = items.map((it) => ({
      exerciseId: it.exerciseId,
      targetSets: Math.max(1, Number(it.targetSets) || 3),
      targetReps: String(it.targetReps || "8-10").trim(),
    }));

    onSave({
      id: routine?.id || uid("rt"),
      name: name.trim(),
      description: description.trim(),
      exercises: cleanItems,
    });
    onClose();
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalSheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "88vh" }}>
        <div className="modalHandle" />
        <div className="modalHead">
          <div>
            <strong style={{ fontSize: 17 }}>
              {isEditing ? "Editar rutina" : "Nueva rutina"}
            </strong>
            <div className="muted" style={{ fontSize: 12 }}>
              Define la secuencia de ejercicios y objetivos
            </div>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack small" style={{ overflowY: "auto", paddingRight: 2 }}>
          {error && <div className="warning">{error}</div>}

          <div>
            <label>Nombre de la rutina</label>
            <input
              type="text"
              placeholder="Ej. Torso A — Fuerza"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </div>

          <div>
            <label>Descripción o enfoque (opcional)</label>
            <input
              type="text"
              placeholder="Ej. Pectoral, dorsal y hombro pesado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <div className="row between" style={{ marginBottom: 8 }}>
              <label style={{ margin: 0 }}>Secuencia de ejercicios ({items.length})</label>
              <button
                type="button"
                className="chip small active"
                onClick={addItem}
                style={{ gap: 4, padding: "3px 8px" }}
              >
                <Plus size={12} strokeWidth={2.5} />
                <span>Añadir</span>
              </button>
            </div>

            <div className="stack small">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "10px 12px",
                  }}
                >
                  <div className="row between" style={{ marginBottom: 8 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="setNo" style={{ width: 22, height: 22, fontSize: 11 }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                        Ejercicio {idx + 1}
                      </span>
                    </div>

                    <div className="row" style={{ gap: 4 }}>
                      <button
                        type="button"
                        className="plain"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Subir"
                        style={{ opacity: idx === 0 ? 0.3 : 1, padding: 4 }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="plain"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        aria-label="Bajar"
                        style={{ opacity: idx === items.length - 1 ? 0.3 : 1, padding: 4 }}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="plain"
                        onClick={() => removeItem(idx)}
                        aria-label="Eliminar ejercicio de rutina"
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="stack small">
                    <select
                      value={item.exerciseId}
                      onChange={(e) => updateItem(idx, "exerciseId", e.target.value)}
                    >
                      {exercises.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.group || "General"})
                        </option>
                      ))}
                    </select>

                    <div className="two" style={{ gap: 8 }}>
                      <div>
                        <small className="muted" style={{ fontSize: 11, display: "block", marginBottom: 3 }}>
                          Series objetivo
                        </small>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.targetSets}
                          onChange={(e) => updateItem(idx, "targetSets", e.target.value)}
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <small className="muted" style={{ fontSize: 11, display: "block", marginBottom: 3 }}>
                          Reps objetivo
                        </small>
                        <input
                          type="text"
                          value={item.targetReps}
                          onChange={(e) => updateItem(idx, "targetReps", e.target.value)}
                          placeholder="8-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="primary full" style={{ height: 48, marginTop: 14 }}>
            <span>{isEditing ? "Guardar cambios en la rutina" : "Crear rutina"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
