import { useMemo, useState } from "react";
import { Check, Copy, Plus, Search, Timer } from "lucide-react";
import SetsEditor from "../components/SetsEditor";
import { Field } from "../components/ui";
import { isoToday, fmtDate } from "../lib/utils";
import { REST_PRESETS } from "../lib/constants";

export default function Register({
  exercises,
  logs,
  records,
  onAddExercise,
  onSaveWorkout,
  onStartRest,
}) {
  const [selectedEx, setSelectedEx] = useState("");
  const [date, setDate] = useState(isoToday());
  const [sets, setSets] = useState([{ weight: "", reps: "" }]);
  const [newEx, setNewEx] = useState("");
  const [showNewEx, setShowNewEx] = useState(false);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");

  const groups = useMemo(
    () => ["Todos", ...new Set(exercises.map((e) => e.group || "General"))],
    [exercises]
  );

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesGroup = group === "Todos" || ex.group === group;
      const matchesQuery = ex.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesGroup && matchesQuery;
    });
  }, [exercises, group, query]);

  const lastLog = useMemo(() => {
    if (!selectedEx) return null;
    return logs.find((l) => l.exerciseId === selectedEx) || null;
  }, [logs, selectedEx]);

  function handleAddExercise() {
    const ex = onAddExercise(newEx);
    if (ex) {
      setSelectedEx(ex.id);
      setNewEx("");
      setShowNewEx(false);
    }
  }

  function copyLastSession() {
    if (!lastLog) return;
    setSets(lastLog.sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps) })));
  }

  function handleSave() {
    const ok = onSaveWorkout(selectedEx, date, sets);
    if (ok) setSets([{ weight: "", reps: "" }]);
  }

  const canSave = selectedEx && sets.some((s) => s.weight && s.reps);

  return (
    <div className="stack">
      <Field label="Fecha">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <div>
        <label>Ejercicio</label>

        <div className="searchRow">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ejercicio…"
          />
        </div>

        <div className="chips scrollX">
          {groups.map((g) => (
            <button
              key={g}
              className={group === g ? "chip active small" : "chip small"}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="chips">
          {filteredExercises.map((ex) => (
            <button
              key={ex.id}
              className={selectedEx === ex.id ? "chip active" : "chip"}
              onClick={() => setSelectedEx(ex.id)}
            >
              {ex.name}
            </button>
          ))}

          <button className="chip dashed" onClick={() => setShowNewEx(!showNewEx)}>
            <Plus size={14} /> Nuevo
          </button>
        </div>
      </div>

      {showNewEx && (
        <div className="inline">
          <input
            value={newEx}
            onChange={(e) => setNewEx(e.target.value)}
            placeholder="Nombre del ejercicio"
            autoFocus
          />
          <button className="iconBtn accent" onClick={handleAddExercise}>
            <Check size={17} />
          </button>
        </div>
      )}

      {selectedEx && lastLog && (
        <button className="lastSession" onClick={copyLastSession}>
          <Copy size={15} />
          <span>
            Copiar última sesión — {fmtDate(lastLog.date)}:{" "}
            {lastLog.sets.map((s) => `${s.weight}×${s.reps}`).join(", ")}
          </span>
        </button>
      )}

      <div>
        <div className="row between">
          <label>Series</label>
          {records[selectedEx] && (
            <span className="accentText">1RM est. {Math.round(records[selectedEx].est1RM)} kg</span>
          )}
        </div>

        <SetsEditor sets={sets} onChange={setSets} />
      </div>

      <div>
        <label>Descanso</label>
        <div className="chips">
          {REST_PRESETS.map((s) => (
            <button key={s} className="chip" onClick={() => onStartRest(s)}>
              <Timer size={13} /> {s < 60 ? `${s}s` : `${s / 60}min`}
            </button>
          ))}
        </div>
      </div>

      <button className="primary" disabled={!canSave} onClick={handleSave}>
        GUARDAR ENTRENAMIENTO
      </button>
    </div>
  );
}
