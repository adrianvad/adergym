import { useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Card, Empty } from "../components/ui";
import EditLogModal from "../components/EditLogModal";
import { fmtDate, sessionVolume } from "../lib/utils";

export default function History({ logs, exercises, onDeleteLog, onUpdateLog }) {
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);

  const groups = {};
  logs.forEach((l) => {
    (groups[l.date] ??= []).push(l);
  });
  const dates = Object.keys(groups).sort().reverse();

  return (
    <div className="stack small">
      {!dates.length ? (
        <Empty title="Sin historial" text="Aquí aparecerán tus entrenamientos." />
      ) : (
        dates.map((d) => {
          const entries = groups[d];
          const volume = entries.reduce((a, l) => a + sessionVolume(l), 0);

          return (
            <Card key={d}>
              <button
                className="dateHeader"
                onClick={() => setExpanded(expanded === d ? null : d)}
              >
                <span>
                  <CalendarDays size={15} /> {fmtDate(d)}
                </span>
                <span className="muted">
                  {entries.length} ej. · {Math.round(volume)} kg {expanded === d ? "⌃" : "⌄"}
                </span>
              </button>

              {expanded === d && (
                <div className="historyBody">
                  {entries.map((l) => (
                    <div className="historyEntry" key={l.id}>
                      <div className="row between">
                        <strong>
                          {exercises.find((e) => e.id === l.exerciseId)?.name ||
                            "Ejercicio eliminado"}
                        </strong>
                        <div className="row" style={{ gap: 4 }}>
                          <button className="plain" onClick={() => setEditing(l)}>
                            <Pencil size={14} />
                          </button>
                          <button className="plain" onClick={() => onDeleteLog(l.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="chips">
                        {l.sets.map((s, i) => (
                          <span className="setTag" key={i}>
                            {s.weight} kg × {s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })
      )}

      {editing && (
        <EditLogModal
          log={editing}
          exerciseName={exercises.find((e) => e.id === editing.exerciseId)?.name || "Ejercicio"}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            onUpdateLog(updated);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
