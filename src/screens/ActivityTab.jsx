import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Dumbbell, Flame, Pencil, Search, Trash2 } from "lucide-react";
import { Card, Empty, SectionTitle } from "../components/ui";
import EditLogModal from "../components/EditLogModal";
import { fmtDate, isoToday, sessionVolume } from "../lib/utils";
import { getExerciseGroups } from "../lib/constants";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function ActivityTab({
  logs,
  exercises,
  streak,
  unitPref = "kg",
  onDeleteLog,
  onUpdateLog,
}) {
  const today = isoToday();
  const [month, setMonth] = useState(() => {
    const [tY, tM] = today.split("-").map(Number);
    return new Date(tY, tM - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState(null); // click a day to filter history!
  const [expandedDate, setExpandedDate] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  // JavaScript getDay(): 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
  // Calendar columns: L (Mon)=0, M (Tue)=1, X (Wed)=2, J (Thu)=3, V (Fri)=4, S (Sat)=5, D (Sun)=6
  const dayOfWeek = first.getDay();
  const start = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const days = new Date(y, m + 1, 0).getDate();

  // Exactly 4, 5, or 6 weeks (multiples of 7)
  const totalSlots = Math.ceil((start + days) / 7) * 7;
  const trailing = totalSlots - (start + days);

  const cells = [];
  // Leading spacer cells before day 1
  for (let i = 0; i < start; i++) {
    cells.push({ key: `lead-${y}-${m}-${i}`, date: null });
  }
  // Days of current month
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key: iso, date: iso, dayNum: d });
  }
  // Trailing spacer cells to complete the final week row
  for (let i = 0; i < trailing; i++) {
    cells.push({ key: `trail-${y}-${m}-${i}`, date: null });
  }

  const trainedDays = useMemo(() => new Set(logs.map((l) => l.date)), [logs]);
  const monthPrefix = `${y}-${String(m + 1).padStart(2, "0")}-`;
  const trainedThisMonth = [...trainedDays].filter((d) => d.startsWith(monthPrefix)).length;

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups = {};
    for (const l of logs) {
      if (selectedDate && l.date !== selectedDate) continue;
      if (filterQuery.trim()) {
        const ex = exercises.find((e) => e.id === l.exerciseId);
        if (!ex?.name.toLowerCase().includes(filterQuery.toLowerCase())) continue;
      }
      (groups[l.date] ??= []).push(l);
    }
    return groups;
  }, [logs, exercises, selectedDate, filterQuery]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedLogs).sort().reverse();
  }, [groupedLogs]);

  return (
    <div className="stack">
      {/* Mini Calendar Scrubber & Racha Card */}
      <Card style={{ padding: "14px 12px" }}>
        <div className="calendarTop">
          <button
            type="button"
            className="iconBtn"
            onClick={() => setMonth(new Date(y, m - 1, 1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <strong style={{ fontSize: 15, textTransform: "capitalize" }}>
            {month.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}
          </strong>
          <button
            type="button"
            className="iconBtn"
            onClick={() => setMonth(new Date(y, m + 1, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="weekdays">
          {WEEKDAYS.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>

        <div className="calendar">
          {cells.map((cell) => {
            if (!cell.date) {
              return (
                <div
                  key={cell.key}
                  className="daySpacer"
                  aria-hidden="true"
                />
              );
            }
            const d = cell.date;
            const isTrained = trainedDays.has(d);
            const isToday = d === today;
            const isSelected = d === selectedDate;
            return (
              <button
                type="button"
                key={cell.key}
                className={isTrained ? "day trained" : "day"}
                onClick={() => setSelectedDate(selectedDate === d ? null : d)}
                aria-label={`${cell.dayNum} ${month.toLocaleDateString("es-PE", { month: "long" })}${isTrained ? ", entrenado" : ""}${isToday ? ", hoy" : ""}`}
                style={{
                  border: isSelected
                    ? "2px solid var(--cyan)"
                    : isToday
                    ? "1.5px solid var(--border-focus)"
                    : undefined,
                  boxShadow: isSelected ? "0 0 12px var(--cyan-glow)" : undefined,
                  cursor: "pointer",
                }}
              >
                <span>{cell.dayNum}</span>
                {isTrained && <i />}
              </button>
            );
          })}
        </div>

        {/* Responsive Calendar stats footer */}
        <div className="calendarFooter">
          <div className="calStatPill">
            <Flame size={14} style={{ color: "var(--cyan)", flexShrink: 0 }} />
            <span className="muted">Racha:</span>
            <strong className="tabular">{streak} {streak === 1 ? "sem" : "sems"}</strong>
          </div>
          <div className="calStatPill">
            <CalendarDays size={14} style={{ color: "var(--dim)", flexShrink: 0 }} />
            <span className="muted">Mes:</span>
            <strong className="tabular">{trainedThisMonth} {trainedThisMonth === 1 ? "día" : "días"}</strong>
          </div>
        </div>

        {selectedDate && (
          <div
            className="row between"
            style={{
              marginTop: 10,
              padding: "6px 12px",
              background: "rgba(6, 182, 212, 0.1)",
              borderRadius: 10,
              fontSize: 12,
            }}
          >
            <span>Filtrando: <strong>{fmtDate(selectedDate)}</strong></span>
            <button
              type="button"
              className="plain"
              onClick={() => setSelectedDate(null)}
              style={{ padding: "2px 6px", fontSize: 11, color: "var(--cyan)" }}
            >
              Ver todos
            </button>
          </div>
        )}
      </Card>

      {/* Search History Filter */}
      <div className="searchRow">
        <Search size={14} />
        <input
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Buscar ejercicio en el historial…"
        />
        {filterQuery && (
          <button type="button" className="plain" onClick={() => setFilterQuery("")}>
            ×
          </button>
        )}
      </div>

      {/* Chronological History Feed */}
      <div className="stack small">
        <SectionTitle>Historial de sesiones ({sortedDates.length})</SectionTitle>

        {!sortedDates.length ? (
          <Empty
            title="Sin entrenamientos que mostrar"
            text={
              selectedDate || filterQuery
                ? "No se encontraron entrenamientos con los filtros seleccionados."
                : "Tus entrenamientos registrados se listarán aquí en orden cronológico."
            }
          />
        ) : (
          sortedDates.map((d) => {
            const entries = groupedLogs[d];
            const volume = entries.reduce((sum, l) => {
              const ex = exercises.find((e) => e.id === l.exerciseId);
              return sum + sessionVolume(l, unitPref, ex?.unit || "kg");
            }, 0);
            const isExpanded = expandedDate === d || sortedDates.length === 1;

            return (
              <Card key={d} style={{ padding: 14 }}>
                <button
                  type="button"
                  className="dateHeader"
                  onClick={() => setExpandedDate(isExpanded && sortedDates.length > 1 ? null : d)}
                >
                  <div className="row" style={{ gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "rgba(6, 182, 212, 0.12)",
                        color: "var(--cyan)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CalendarDays size={14} />
                    </div>
                    <strong style={{ fontSize: 14, textTransform: "capitalize" }}>
                      {fmtDate(d)}
                    </strong>
                  </div>

                  <div className="row" style={{ gap: 8 }}>
                    <span className="muted tabular" style={{ fontSize: 12 }}>
                      {entries.length} ej. · {Math.round(volume).toLocaleString("es-PE")} {unitPref}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} style={{ color: "var(--dim-soft)" }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: "var(--dim-soft)" }} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="historyBody">
                    {entries.map((l) => {
                      const ex = exercises.find((e) => e.id === l.exerciseId);
                      const defUnit = ex?.unit || "kg";
                      return (
                        <div className="historyEntry" key={l.id}>
                          <div className="row between">
                            <div className="row" style={{ gap: 6 }}>
                              <Dumbbell size={14} style={{ color: "var(--dim-soft)" }} />
                              <strong style={{ fontSize: 13 }}>
                                {ex?.name || "Ejercicio eliminado"}
                              </strong>
                              <div className="row wrap" style={{ gap: 4 }}>
                                {getExerciseGroups(ex).map((g) => (
                                  <span key={g} className="exerciseCategoryTag mini">
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="row" style={{ gap: 4 }}>
                              <button
                                type="button"
                                className="plain"
                                onClick={() => setEditingLog(l)}
                                title="Editar sesión"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                className="plain"
                                onClick={() => onDeleteLog(l.id)}
                                title="Eliminar sesión"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="chips" style={{ marginTop: 6 }}>
                            {l.sets.map((s, idx) => (
                              <span className="setTag" key={idx}>
                                {s.weight} {s.unit || defUnit} × {s.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {editingLog && (
        <EditLogModal
          log={editingLog}
          exerciseName={exercises.find((e) => e.id === editingLog.exerciseId)?.name || "Ejercicio"}
          exerciseUnit={exercises.find((e) => e.id === editingLog.exerciseId)?.unit || "kg"}
          onClose={() => setEditingLog(null)}
          onSave={(updated) => {
            onUpdateLog(updated);
            setEditingLog(null);
          }}
        />
      )}
    </div>
  );
}
