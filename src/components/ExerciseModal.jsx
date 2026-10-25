import { useState } from "react";
import { Check, Star, X } from "lucide-react";
import { MUSCLE_GROUPS, getExerciseGroups } from "../lib/constants";

export default function ExerciseModal({ exercise, onSave, onClose }) {
  const isEditing = Boolean(exercise?.id);
  const [name, setName] = useState(exercise?.name || "");
  const [selectedGroups, setSelectedGroups] = useState(() => {
    return getExerciseGroups(exercise);
  });
  const [favorite, setFavorite] = useState(Boolean(exercise?.favorite));
  const [unit, setUnit] = useState(exercise?.unit === "lbs" ? "lbs" : "kg");
  const [error, setError] = useState("");

  function toggleGroup(g) {
    setError("");
    if (selectedGroups.includes(g)) {
      if (selectedGroups.length === 1) {
        setError("El ejercicio debe pertenecer al menos a una categoría.");
        return;
      }
      setSelectedGroups(selectedGroups.filter((item) => item !== g));
    } else {
      setSelectedGroups([...selectedGroups, g]);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Introduce un nombre para el ejercicio.");
      return;
    }
    if (!selectedGroups.length) {
      setError("Selecciona al menos una categoría para el ejercicio.");
      return;
    }
    onSave({
      id: exercise?.id,
      name: name.trim(),
      groups: selectedGroups,
      group: selectedGroups[0] || "General",
      favorite,
      unit,
    });
    onClose();
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalSheet" onClick={(e) => e.stopPropagation()}>
        <div className="modalHandle" />
        <div className="modalHead">
          <div>
            <strong style={{ fontSize: 17 }}>
              {isEditing ? "Editar ejercicio" : "Nuevo ejercicio"}
            </strong>
            <div className="muted" style={{ fontSize: 12 }}>
              {isEditing
                ? "El historial de entrenamientos se mantendrá intacto"
                : "Se añadirá a tu catálogo de ejercicios"}
            </div>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack small">
          {error && <div className="warning">{error}</div>}

          <div>
            <label>Nombre del ejercicio</label>
            <input
              type="text"
              placeholder="Ej. Curl bíceps martillo"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </div>

          <div>
            <div className="row between" style={{ marginBottom: 4 }}>
              <label style={{ margin: 0 }}>Categorías (selección múltiple)</label>
              <span className="muted" style={{ fontSize: 11 }}>
                {selectedGroups.length} seleccionada{selectedGroups.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="chips" style={{ marginTop: 6 }}>
              {MUSCLE_GROUPS.map((g) => {
                const isSelected = selectedGroups.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    className={isSelected ? "chip small active" : "chip small"}
                    onClick={() => toggleGroup(g)}
                    style={{ gap: 5 }}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {g}
                  </button>
                );
              })}
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
              Puedes asignar más de una categoría (p. ej. «Brazos» y «Pull»).
            </div>
          </div>

          <div
            className="row between"
            style={{
              padding: "10px 14px",
              background: "var(--surface-inset)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              marginTop: 4,
            }}
          >
            <div>
              <strong style={{ fontSize: 13, display: "block" }}>Unidad de carga predeterminada</strong>
              <span className="muted" style={{ fontSize: 11 }}>
                Unidad base para registrar las series
              </span>
            </div>
            <div className="segmentedControl mini" style={{ margin: 0, padding: 2 }}>
              <button
                type="button"
                className={`segmentedTab ${unit === "kg" ? "active" : ""}`}
                onClick={() => setUnit("kg")}
                style={{ padding: "4px 10px", fontSize: 12 }}
              >
                kg
              </button>
              <button
                type="button"
                className={`segmentedTab ${unit === "lbs" ? "active" : ""}`}
                onClick={() => setUnit("lbs")}
                style={{ padding: "4px 10px", fontSize: 12 }}
              >
                lbs
              </button>
            </div>
          </div>

          <div
            className="row between"
            style={{
              padding: "12px 14px",
              background: "var(--surface-inset)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              marginTop: 4,
            }}
          >
            <div className="row" style={{ gap: 10 }}>
              <Star
                size={18}
                style={{
                  color: favorite ? "var(--cyan)" : "var(--dim-soft)",
                  fill: favorite ? "var(--cyan)" : "none",
                }}
              />
              <div>
                <strong style={{ fontSize: 14, display: "block" }}>Marcar como favorito</strong>
                <span className="muted" style={{ fontSize: 11 }}>
                  Aparecerá en acceso directo al entrenar
                </span>
              </div>
            </div>
            <button
              type="button"
              className={favorite ? "chip small active" : "chip small"}
              onClick={() => setFavorite(!favorite)}
              style={{ flexShrink: 0 }}
            >
              {favorite ? "Favorito" : "Normal"}
            </button>
          </div>

          <button
            type="submit"
            className="primary full"
            style={{ height: 48, marginTop: 14 }}
          >
            <span>{isEditing ? "Guardar cambios" : "Crear ejercicio"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
