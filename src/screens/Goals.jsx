import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, Field, ProgressBar, SubHeader } from "../components/ui";
import { emptyGoal } from "../lib/constants";
import { epley } from "../lib/utils";

function GoalCard({ goal, exercises, records, onRemove }) {
  const r = records[goal.exerciseId];
  const current = r?.est1RM || 0;
  const target = epley(goal.targetWeight, goal.targetReps);
  const pct = Math.min(100, Math.round((current / target) * 100) || 0);

  return (
    <Card>
      <div className="row between">
        <div>
          <strong>{exercises.find((e) => e.id === goal.exerciseId)?.name || "Ejercicio"}</strong>
          <div className="muted">
            {goal.targetWeight} kg × {goal.targetReps} · objetivo 1RM {Math.round(target)} kg
          </div>
        </div>
        <button className="plain" onClick={onRemove}>
          <Trash2 size={15} />
        </button>
      </div>

      <ProgressBar pct={pct} />

      <div className="row between smallText">
        <span>{Math.round(current)} kg actual</span>
        <span>{pct}%</span>
      </div>

      {goal.note && <div className="note">{goal.note}</div>}
    </Card>
  );
}

export default function Goals({ exercises, goals, records, onAddGoal, onRemoveGoal, onBack }) {
  const [g, setG] = useState(emptyGoal);

  function handleCreate() {
    onAddGoal(g);
    setG(emptyGoal);
  }

  return (
    <div>
      <SubHeader title="OBJETIVOS" onBack={onBack} />

      <div className="stack">
        <Card>
          <label>Ejercicio</label>
          <select
            value={g.exerciseId}
            onChange={(e) => setG({ ...g, exerciseId: e.target.value })}
          >
            <option value="">Selecciona…</option>
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          <div className="two">
            <Field label="Peso objetivo">
              <input
                type="number"
                value={g.targetWeight}
                onChange={(e) => setG({ ...g, targetWeight: e.target.value })}
                placeholder="kg"
              />
            </Field>
            <Field label="Reps objetivo">
              <input
                type="number"
                value={g.targetReps}
                onChange={(e) => setG({ ...g, targetReps: e.target.value })}
                placeholder="reps"
              />
            </Field>
          </div>

          <input
            value={g.note}
            onChange={(e) => setG({ ...g, note: e.target.value })}
            placeholder="Nota opcional"
          />

          <button className="primary" onClick={handleCreate}>
            CREAR OBJETIVO
          </button>
        </Card>

        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            exercises={exercises}
            records={records}
            onRemove={() => onRemoveGoal(goal.id)}
          />
        ))}
      </div>
    </div>
  );
}
