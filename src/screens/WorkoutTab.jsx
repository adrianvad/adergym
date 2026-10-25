import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  Layers,
  Play,
  Plus,
  Search,
  Star,
  Timer,
  X,
} from "lucide-react";
import SetsEditor from "../components/SetsEditor";
import { Card, SectionTitle } from "../components/ui";
import { isoToday, fmtDate, shiftISO, formatWeight, sessionVolume } from "../lib/utils";
import { REST_PRESETS, MUSCLE_GROUPS, getExerciseGroups } from "../lib/constants";
import ExerciseModal from "../components/ExerciseModal";
import WarmupModal from "../components/WarmupModal";

export default function WorkoutTab({
  exercises,
  logs,
  records,
  unitPref = "kg",
  routines = [],
  activeRoutine = null,
  onStartRoutine,
  onCancelRoutine,
  onSaveExercise,
  onSaveWorkout,
  onStartRest,
  onDeleteLog,
}) {
  const [selectedEx, setSelectedEx] = useState(exercises[0]?.id || "");
  const [date, setDate] = useState(isoToday());
  const [sets, setSets] = useState([{ weight: "", reps: "" }]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerGroup, setPickerGroup] = useState("Todos");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWarmupModal, setShowWarmupModal] = useState(false);
  const [showTodaysDetails, setShowTodaysDetails] = useState(true);
  const [showRoutineDrawer, setShowRoutineDrawer] = useState(false);

  // Active routine tracking index
  const [routineIndex, setRoutineIndex] = useState(0);

  // Sync when active routine starts or changes
  useEffect(() => {
    if (activeRoutine?.exercises?.length) {
      const idx = activeRoutine.currentIndex || 0;
      setRoutineIndex(idx);
      const exId = activeRoutine.exercises[idx]?.exerciseId;
      if (exId && exercises.some((e) => e.id === exId)) {
        setSelectedEx(exId);
        // Pre-create blank sets matching targetSets
        const count = activeRoutine.exercises[idx]?.targetSets || 3;
        setSets(Array.from({ length: count }, () => ({ weight: "", reps: "" })));
      }
    }
  }, [activeRoutine, exercises]);

  // Current routine exercise item (if in routine)
  const currentRoutineItem = useMemo(() => {
    if (!activeRoutine?.exercises?.length) return null;
    return activeRoutine.exercises[routineIndex] || null;
  }, [activeRoutine, routineIndex]);

  // Recent exercise IDs from past logs (up to 5)
  const recentExIds = useMemo(() => {
    const ids = [];
    for (const l of logs) {
      if (!ids.includes(l.exerciseId)) ids.push(l.exerciseId);
      if (ids.length >= 5) break;
    }
    return ids;
  }, [logs]);

  // Favorite exercises
  const favoriteExercises = useMemo(() => {
    return exercises.filter((e) => e.favorite);
  }, [exercises]);

  // Filtered exercises for the picker
  const pickerFilteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const groups = getExerciseGroups(ex);
      const matchesGroup = pickerGroup === "Todos" || groups.includes(pickerGroup);
      const matchesQuery = ex.name.toLowerCase().includes(pickerQuery.trim().toLowerCase());
      return matchesGroup && matchesQuery;
    });
  }, [exercises, pickerGroup, pickerQuery]);

  // Last log for currently selected exercise
  const lastLog = useMemo(() => {
    if (!selectedEx) return null;
    return logs.find((l) => l.exerciseId === selectedEx) || null;
  }, [logs, selectedEx]);

  // Logs recorded for the currently selected date
  const todaysLogs = useMemo(() => {
    return logs.filter((l) => l.date === date);
  }, [logs, date]);

  const activeExObj = exercises.find((e) => e.id === selectedEx) || exercises[0];
  const activeExUnit = activeExObj?.unit === "lbs" ? "lbs" : "kg";
  const activeGroups = activeExObj ? getExerciseGroups(activeExObj) : [];

  function copyLastSession() {
    if (!lastLog) return;
    setSets(
      lastLog.sets.map((s) => ({
        weight: String(s.weight),
        reps: String(s.reps),
        unit: s.unit || activeExUnit,
      }))
    );
  }

  function handleSave() {
    const ok = onSaveWorkout(selectedEx, date, sets);
    if (ok) {
      setSets([{ weight: "", reps: "", unit: activeExUnit }]);
    }
  }

  function handleNextRoutineExercise() {
    if (!activeRoutine) return;
    const nextIdx = routineIndex + 1;
    if (nextIdx < activeRoutine.exercises.length) {
      setRoutineIndex(nextIdx);
      const nextExId = activeRoutine.exercises[nextIdx].exerciseId;
      setSelectedEx(nextExId);
      const targetCount = activeRoutine.exercises[nextIdx].targetSets || 3;
      setSets(Array.from({ length: targetCount }, () => ({ weight: "", reps: "" })));
    } else {
      onCancelRoutine();
    }
  }

  function handlePrevRoutineExercise() {
    if (!activeRoutine || routineIndex <= 0) return;
    const prevIdx = routineIndex - 1;
    setRoutineIndex(prevIdx);
    const prevExId = activeRoutine.exercises[prevIdx].exerciseId;
    setSelectedEx(prevExId);
    const targetCount = activeRoutine.exercises[prevIdx].targetSets || 3;
    setSets(Array.from({ length: targetCount }, () => ({ weight: "", reps: "" })));
  }

  const canSave = selectedEx && sets.some((s) => Number(s.weight) > 0 && Number(s.reps) > 0);

  // Compute total volume for today normalized to unitPref
  const totalVolumeToday = todaysLogs.reduce((acc, l) => {
    const ex = exercises.find((e) => e.id === l.exerciseId);
    return acc + sessionVolume(l, unitPref, ex?.unit || "kg");
  }, 0);
  const totalSetsToday = todaysLogs.reduce((acc, l) => acc + l.sets.length, 0);

  return (
    <div className="stack">
      {/* 1. Date Selector Bar & Routine Quick Launcher */}
      <Card style={{ padding: "10px 14px" }}>
        <div className="row between">
          <div className="row" style={{ gap: 6 }}>
            <Calendar size={15} style={{ color: "var(--cyan)" }} />
            <button
              type="button"
              className={date === isoToday() ? "chip small active" : "chip small"}
              onClick={() => setDate(isoToday())}
            >
              Hoy
            </button>
            <button
              type="button"
              className={date === shiftISO(isoToday(), -1) ? "chip small active" : "chip small"}
              onClick={() => setDate(shiftISO(isoToday(), -1))}
            >
              Ayer
            </button>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: "5px 10px", fontSize: 13, maxWidth: 140 }}
            />
          </div>
        </div>
      </Card>

      {/* 2. Active Routine Runner Banner (if currently in a routine) */}
      {activeRoutine ? (
        <Card
          style={{
            padding: "12px 14px",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)",
            borderColor: "rgba(6, 182, 212, 0.35)",
          }}
        >
          <div className="row between" style={{ marginBottom: 6 }}>
            <div className="row" style={{ gap: 6 }}>
              <Layers size={15} style={{ color: "var(--cyan)" }} />
              <strong style={{ fontSize: 14 }}>{activeRoutine.name}</strong>
            </div>
            <button
              type="button"
              className="plain"
              onClick={onCancelRoutine}
              style={{ fontSize: 11, color: "var(--rose)", padding: "2px 6px" }}
            >
              Finalizar rutina
            </button>
          </div>

          <div className="row between" style={{ marginTop: 4 }}>
            <div className="row" style={{ gap: 6, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--cyan)",
                  background: "var(--surface-inset)",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                Paso {routineIndex + 1} de {activeRoutine.exercises.length}
              </span>
              {currentRoutineItem && (
                <span className="muted tabular" style={{ fontSize: 12 }}>
                  Objetivo: {currentRoutineItem.targetSets} series × {currentRoutineItem.targetReps} reps
                </span>
              )}
            </div>

            <div className="row" style={{ gap: 6 }}>
              <button
                type="button"
                className="chip small"
                disabled={routineIndex === 0}
                onClick={handlePrevRoutineExercise}
                style={{ padding: "3px 8px", opacity: routineIndex === 0 ? 0.3 : 1 }}
              >
                <ChevronLeft size={13} />
                <span>Ant</span>
              </button>
              <button
                type="button"
                className="chip small active"
                onClick={handleNextRoutineExercise}
                style={{ padding: "3px 10px" }}
              >
                <span>{routineIndex < activeRoutine.exercises.length - 1 ? "Sig" : "Completar"}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </Card>
      ) : (
        /* Quick Routine Selector Strip when not currently in a routine */
        routines.length > 0 && (
          <div className="row between" style={{ padding: "0 4px" }}>
            <div className="chips scrollX" style={{ margin: 0 }}>
              <span
                className="muted"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  alignSelf: "center",
                  marginRight: 4,
                  textTransform: "uppercase",
                }}
              >
                Rutinas:
              </span>
              {routines.map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  className="chip small"
                  onClick={() => onStartRoutine(rt)}
                  style={{ gap: 5, padding: "4px 10px" }}
                >
                  <Play size={10} fill="currentColor" />
                  <span>{rt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* 3. Hero Active Exercise Card */}
      <Card style={{ padding: "16px 16px 14px" }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <span className="sectionBadge">
            <Dumbbell size={12} strokeWidth={2.5} />
            Ejercicio activo
          </span>
          <button
            type="button"
            className="chip small active"
            onClick={() => setShowPicker(true)}
            style={{
              padding: "5px 12px",
              gap: 6,
              background: "var(--cyan-glow)",
              borderColor: "rgba(6, 182, 212, 0.4)",
            }}
          >
            <Search size={12} />
            <span>Cambiar</span>
            <ChevronDown size={13} />
          </button>
        </div>

        {activeExObj && (
          <div>
            <div className="row between" style={{ alignItems: "flex-start", gap: 12 }}>
              <div>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                    {activeExObj.name}
                  </h2>
                  {activeExObj.favorite && (
                    <Star size={16} style={{ color: "var(--cyan)", fill: "var(--cyan)" }} />
                  )}
                  <span
                    className="tabular"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--cyan)",
                      background: "rgba(6, 182, 212, 0.12)",
                      padding: "2px 7px",
                      borderRadius: 6,
                    }}
                  >
                    {activeExUnit}
                  </span>
                </div>

                <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
                  {activeGroups.map((g) => (
                    <span key={g} className="exerciseCategoryTag">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {records[selectedEx] && (
                <div
                  className="recordPill"
                  title={`Mejor serie: ${records[selectedEx].weightForMax} ${records[selectedEx].unit || "kg"} × ${records[selectedEx].repsForMax}`}
                >
                  <small>1RM Estimado</small>
                  <strong>
                    {formatWeight(
                      records[selectedEx].est1RM,
                      records[selectedEx].unit || "kg",
                      unitPref
                    )}
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1-Tap Quick Switcher for Favorites & Recents */}
        {(favoriteExercises.length > 0 || recentExIds.length > 0) && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="muted" style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                Acceso directo
              </span>
              <button
                type="button"
                className="plain"
                onClick={() => setShowCreateModal(true)}
                style={{ padding: "2px 6px", fontSize: 11, color: "var(--cyan)" }}
              >
                + Nuevo
              </button>
            </div>
            <div className="chips scrollX" style={{ margin: 0 }}>
              {favoriteExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  className={selectedEx === ex.id ? "chip small active" : "chip small"}
                  onClick={() => setSelectedEx(ex.id)}
                >
                  <Star size={11} style={{ fill: "currentColor" }} />
                  {ex.name}
                </button>
              ))}
              {recentExIds
                .filter((id) => !favoriteExercises.some((f) => f.id === id))
                .map((id) => {
                  const ex = exercises.find((e) => e.id === id);
                  if (!ex) return null;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      className={selectedEx === ex.id ? "chip small active" : "chip small"}
                      onClick={() => setSelectedEx(ex.id)}
                    >
                      <Clock size={11} />
                      {ex.name}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </Card>

      {/* 4. Last Session Recall Helper Banner */}
      {selectedEx && lastLog && (
        <button
          type="button"
          className="lastSession"
          onClick={copyLastSession}
          title="Toca para cargar estas series automáticamente"
        >
          <div className="lastSessionIcon">
            <Copy size={14} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12 }}>
              <strong>Copiar última sesión</strong> ({fmtDate(lastLog.date)})
            </div>
            <div className="tabular" style={{ color: "var(--text-secondary)", fontSize: 11, marginTop: 2 }}>
              {lastLog.sets
                .map((s) => `${s.weight} ${s.unit || activeExUnit} × ${s.reps}`)
                .join("  ·  ")}
            </div>
          </div>
          <span className="lastSessionAction">Cargar</span>
        </button>
      )}

      {/* 5. Series de Trabajo (Sets Editor) with Warmup Calculator Button */}
      <Card style={{ padding: "16px 14px" }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <SectionTitle style={{ margin: 0 }}>Series de trabajo</SectionTitle>
            <span className="muted tabular" style={{ fontSize: 11 }}>
              ({sets.length})
            </span>
          </div>

          <button
            type="button"
            className="chip small"
            onClick={() => setShowWarmupModal(true)}
            style={{
              padding: "4px 10px",
              gap: 5,
              borderColor: "rgba(244, 63, 94, 0.35)",
              color: "var(--rose)",
              background: "rgba(244, 63, 94, 0.08)",
            }}
          >
            <Flame size={13} />
            <span>Calentamiento</span>
          </button>
        </div>

        <SetsEditor sets={sets} onChange={setSets} unit={activeExUnit} />
      </Card>

      {/* 6. Rest Presets Bar */}
      <Card style={{ padding: "10px 14px" }}>
        <div className="row between">
          <div className="row" style={{ gap: 6 }}>
            <Timer size={14} style={{ color: "var(--cyan)" }} />
            <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              Temporizador
            </span>
          </div>
          <div className="chips" style={{ margin: 0 }}>
            {REST_PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                className="chip small"
                onClick={() => onStartRest(s)}
                style={{ padding: "4px 8px" }}
              >
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 7. Primary Action: Save to Workout */}
      <button
        type="button"
        className="primary full"
        disabled={!canSave}
        onClick={handleSave}
        style={{ height: 48 }}
      >
        <Check size={18} strokeWidth={2.5} />
        <span>Guardar en el entrenamiento</span>
      </button>

      {/* 8. Today's Workout Summary (Collapsible & Organized) */}
      {todaysLogs.length > 0 && (
        <Card style={{ padding: 14, marginTop: 4 }}>
          <button
            type="button"
            className="row between fullWidth plainBtn"
            onClick={() => setShowTodaysDetails(!showTodaysDetails)}
            style={{ width: "100%", padding: 0 }}
          >
            <div>
              <div className="row" style={{ gap: 6 }}>
                <SectionTitle style={{ margin: 0 }}>Sesión de hoy</SectionTitle>
                <span className="badgeCount">{todaysLogs.length}</span>
              </div>
              <div className="muted tabular" style={{ fontSize: 12, marginTop: 2, textAlign: "left" }}>
                {totalSetsToday} series · {Math.round(totalVolumeToday).toLocaleString("es-PE")}{" "}
                {unitPref} de volumen
              </div>
            </div>
            {showTodaysDetails ? (
              <ChevronUp size={18} style={{ color: "var(--dim-soft)" }} />
            ) : (
              <ChevronDown size={18} style={{ color: "var(--dim-soft)" }} />
            )}
          </button>

          {showTodaysDetails && (
            <div
              className="stack small"
              style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}
            >
              {todaysLogs.map((l) => {
                const ex = exercises.find((e) => e.id === l.exerciseId);
                const defaultUnit = ex?.unit || "kg";
                return (
                  <div key={l.id} className="loggedExerciseRow">
                    <div className="row between">
                      <div>
                        <strong style={{ fontSize: 13 }}>{ex?.name || "Ejercicio"}</strong>
                        <div className="chips" style={{ marginTop: 4 }}>
                          {l.sets.map((s, idx) => (
                            <span key={idx} className="setTag">
                              {s.weight} {s.unit || defaultUnit} × {s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="plain"
                        onClick={() => onDeleteLog(l.id)}
                        title="Eliminar este ejercicio"
                        style={{ padding: 6 }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Exercise Picker Modal / Drawer */}
      {showPicker && (
        <div className="modalOverlay" onClick={() => setShowPicker(false)}>
          <div className="modalSheet" onClick={(e) => e.stopPropagation()}>
            <div className="modalHandle" />
            <div className="modalHead">
              <div>
                <strong style={{ fontSize: 17 }}>Seleccionar ejercicio</strong>
                <div className="muted" style={{ fontSize: 12 }}>
                  {pickerFilteredExercises.length} ejercicios disponibles
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button
                  type="button"
                  className="chip small active"
                  onClick={() => {
                    setShowPicker(false);
                    setShowCreateModal(true);
                  }}
                  style={{ gap: 4 }}
                >
                  <Plus size={13} />
                  <span>Crear</span>
                </button>
                <button className="iconBtn" onClick={() => setShowPicker(false)} aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="searchRow" style={{ marginBottom: 10 }}>
              <Search size={15} />
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Buscar ejercicio…"
                autoFocus
              />
              {pickerQuery && (
                <button type="button" className="plain" onClick={() => setPickerQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="chips scrollX" style={{ marginBottom: 12 }}>
              {["Todos", ...MUSCLE_GROUPS].map((g) => (
                <button
                  key={g}
                  type="button"
                  className={pickerGroup === g ? "chip small active" : "chip small"}
                  onClick={() => setPickerGroup(g)}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="stack small" style={{ maxHeight: "45vh", overflowY: "auto", padding: 2 }}>
              {pickerFilteredExercises.map((ex) => {
                const isSelected = selectedEx === ex.id;
                const groups = getExerciseGroups(ex);
                const rec = records[ex.id];
                const unit = ex.unit === "lbs" ? "lbs" : "kg";

                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      setSelectedEx(ex.id);
                      setShowPicker(false);
                    }}
                    className={isSelected ? "pickerItem active" : "pickerItem"}
                  >
                    <div className="row between fullWidth" style={{ width: "100%" }}>
                      <div style={{ textAlign: "left" }}>
                        <div className="row" style={{ gap: 6, alignItems: "center" }}>
                          <strong style={{ fontSize: 14 }}>{ex.name}</strong>
                          {ex.favorite && (
                            <Star size={13} style={{ color: "var(--cyan)", fill: "var(--cyan)" }} />
                          )}
                          <span
                            className="tabular"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--cyan)",
                              background: "rgba(6, 182, 212, 0.1)",
                              padding: "1px 5px",
                              borderRadius: 4,
                            }}
                          >
                            {unit}
                          </span>
                        </div>
                        <div className="row wrap" style={{ gap: 4, marginTop: 4 }}>
                          {groups.map((g) => (
                            <span key={g} className="exerciseCategoryTag mini">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {rec ? (
                        <div style={{ textAlign: "right" }}>
                          <span
                            className="tabular"
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--cyan)",
                              background: "rgba(6, 182, 212, 0.1)",
                              padding: "2px 6px",
                              borderRadius: 6,
                            }}
                          >
                            1RM {formatWeight(rec.est1RM, rec.unit || "kg", unitPref)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}

              {pickerFilteredExercises.length === 0 && (
                <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
                  No se encontraron ejercicios con ese criterio.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Warmup Calculator */}
      {showWarmupModal && (
        <WarmupModal
          exerciseName={activeExObj?.name || "Ejercicio"}
          initialTargetWeight={sets[0]?.weight || lastLog?.sets?.[0]?.weight || 60}
          unit={activeExUnit}
          onApplySets={(warmupSets) => setSets(warmupSets)}
          onClose={() => setShowWarmupModal(false)}
        />
      )}

      {/* Modal for Creating New Exercise with Multi-Category Support */}
      {showCreateModal && (
        <ExerciseModal
          onSave={(newEx) => {
            const saved = onSaveExercise(newEx);
            if (saved?.id) setSelectedEx(saved.id);
            else if (newEx.id) setSelectedEx(newEx.id);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
