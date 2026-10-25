import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Layers,
  Plus as PlusIcon,
  Scale as ScaleIcon,
  Target as TargetIcon,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy as TrophyIcon,
} from "lucide-react";
import { Card, ChartTip, Empty, Field, ProgressBar, SectionTitle } from "../components/ui";
import { C, MUSCLE_GROUPS, emptyGoal, getExerciseGroups } from "../lib/constants";
import {
  calcWeeklyMuscleVolume,
  convertWeight,
  evaluateGoalProgress,
  fmtDate,
  fmtShort,
  formatNumber,
  formatWeight,
  isoToday,
  shiftISO,
  weekKey,
} from "../lib/utils";

export default function ProgressHubTab({
  weeklyVolume,
  volDelta,
  totalVolume,
  totalSets,
  goals,
  records,
  exercises,
  weights,
  logs,
  unitPref = "kg",
  onAddGoal,
  onRemoveGoal,
  onAddWeight,
}) {
  const [subView, setSubView] = useState("volumen"); // "volumen" | "grupos" | "objetivos" | "records" | "peso"
  const [newGoal, setNewGoal] = useState({ ...emptyGoal, unit: unitPref });
  const [newWeightVal, setNewWeightVal] = useState("");

  // Muscle volume week selector state
  const currentWeek = weekKey(isoToday());
  const [selectedMuscleWeek, setSelectedMuscleWeek] = useState(currentWeek);

  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const recordEntries = Object.entries(records).sort((a, b) => b[1].est1RM - a[1].est1RM);

  // Muscle volume breakdown for the selected week
  const weeklyMuscleData = useMemo(() => {
    return calcWeeklyMuscleVolume(logs, exercises, selectedMuscleWeek);
  }, [logs, exercises, selectedMuscleWeek]);

  function handleCreateGoal(e) {
    e.preventDefault();
    if (!newGoal.exerciseId || !Number(newGoal.targetWeight) || !Number(newGoal.targetReps)) return;
    onAddGoal(newGoal);
    setNewGoal({ ...emptyGoal, unit: unitPref });
  }

  function handleSaveWeight(e) {
    e.preventDefault();
    const v = Number(newWeightVal);
    if (v > 0) {
      onAddWeight(v);
      setNewWeightVal("");
    }
  }

  function handlePrevWeek() {
    setSelectedMuscleWeek((prev) => shiftISO(prev, -7));
  }

  function handleNextWeek() {
    if (selectedMuscleWeek < currentWeek) {
      setSelectedMuscleWeek((prev) => shiftISO(prev, 7));
    }
  }

  return (
    <div className="stack">
      {/* Apple-style Segmented View Switcher */}
      <div className="segmentedControl">
        <button
          type="button"
          className={`segmentedTab ${subView === "volumen" ? "active" : ""}`}
          onClick={() => setSubView("volumen")}
        >
          Volumen
        </button>
        <button
          type="button"
          className={`segmentedTab ${subView === "grupos" ? "active" : ""}`}
          onClick={() => setSubView("grupos")}
        >
          Grupos
        </button>
        <button
          type="button"
          className={`segmentedTab ${subView === "objetivos" ? "active" : ""}`}
          onClick={() => setSubView("objetivos")}
        >
          Objetivos ({goals.length})
        </button>
        <button
          type="button"
          className={`segmentedTab ${subView === "records" ? "active" : ""}`}
          onClick={() => setSubView("records")}
        >
          Récords
        </button>
        <button
          type="button"
          className={`segmentedTab ${subView === "peso" ? "active" : ""}`}
          onClick={() => setSubView("peso")}
        >
          Peso ({weights[0]?.weight ? `${weights[0].weight}${weights[0]?.unit || unitPref}` : "—"})
        </button>
      </div>

      {/* VIEW 1: VOLUMEN TOTAL Y CARGA SEMANAL */}
      {subView === "volumen" && (
        <div className="stack">
          {/* Quick Stats Grid */}
          <div className="statGrid">
            <div className="stat">
              <span className="statIcon">
                <Dumbbell size={16} />
              </span>
              <strong className="tabular">{totalSets}</strong>
              <small>Series totales</small>
            </div>
            <div className="stat">
              <span className="statIcon">
                <TrendingUp size={16} />
              </span>
              <strong className="tabular">
                {Math.round(totalVolume).toLocaleString("es-PE")}
              </strong>
              <small>{unitPref} levantados</small>
            </div>
            <div className="stat">
              <span className="statIcon">
                <TrophyIcon size={16} />
              </span>
              <strong className="tabular">{recordEntries.length}</strong>
              <small>Ej. con récords</small>
            </div>
          </div>

          {volDelta !== null && (
            <div style={{ textAlign: "center", marginTop: -6 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  color: volDelta >= 0 ? "var(--green)" : "var(--rose)",
                  background: volDelta >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                  border: `1px solid ${volDelta >= 0 ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)"}`,
                  padding: "4px 12px",
                  borderRadius: 999,
                }}
              >
                {volDelta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>
                  {volDelta >= 0 ? "+" : ""}
                  {volDelta}% volumen vs semana previa
                </span>
              </span>
            </div>
          )}

          {/* Volume Chart */}
          <Card>
            <div className="row between" style={{ marginBottom: 10 }}>
              <SectionTitle style={{ margin: 0 }}>Carga semanal ({unitPref})</SectionTitle>
              <span className="muted" style={{ fontSize: 11 }}>Últimas 8 semanas</span>
            </div>

            <div style={{ width: "100%", height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyVolume} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volCyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.65} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: C.dim, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
                  />
                  <Tooltip
                    content={<ChartTip suffix={` ${unitPref}`} />}
                    cursor={{ fill: "rgba(255, 255, 255, 0.04)", radius: 6 }}
                  />
                  <Bar dataKey="volume" fill="url(#volCyanGrad)" radius={[6, 6, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Callout to Muscle Group Breakdown */}
          <button
            type="button"
            className="lastSession"
            onClick={() => setSubView("grupos")}
            style={{ textAlign: "left" }}
          >
            <div className="lastSessionIcon">
              <Layers size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 13, display: "block" }}>
                Ver volumen semanal por grupo muscular
              </strong>
              <span className="muted" style={{ fontSize: 11 }}>
                Desglose de series efectivas por Pecho, Espalda, Pierna y más
              </span>
            </div>
            <span className="lastSessionAction">Ver grupos</span>
          </button>
        </div>
      )}

      {/* VIEW 2: VOLUMEN SEMANAL POR GRUPO MUSCULAR */}
      {subView === "grupos" && (
        <div className="stack">
          {/* Week Selector Bar */}
          <Card style={{ padding: "10px 14px" }}>
            <div className="row between">
              <button
                type="button"
                className="iconBtn"
                onClick={handlePrevWeek}
                aria-label="Semana anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ textAlign: "center" }}>
                <strong style={{ fontSize: 14 }}>
                  Semana del {fmtShort(selectedMuscleWeek)}
                </strong>
                <div className="muted" style={{ fontSize: 11 }}>
                  {selectedMuscleWeek === currentWeek ? "Semana actual" : "Semana histórica"}
                </div>
              </div>

              <div className="row" style={{ gap: 6 }}>
                {selectedMuscleWeek !== currentWeek && (
                  <button
                    type="button"
                    className="chip small active"
                    onClick={() => setSelectedMuscleWeek(currentWeek)}
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    Hoy
                  </button>
                )}
                <button
                  type="button"
                  className="iconBtn"
                  onClick={handleNextWeek}
                  disabled={selectedMuscleWeek >= currentWeek}
                  aria-label="Semana siguiente"
                  style={{ opacity: selectedMuscleWeek >= currentWeek ? 0.3 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Card>

          {/* Week Summary Stat */}
          <div className="two" style={{ gap: 8 }}>
            <div className="mini">
              <span>Series totales de la semana</span>
              <strong className="tabular">{weeklyMuscleData.totalUniqueSets}</strong>
            </div>
            <div className="mini">
              <span>Sesiones registradas</span>
              <strong className="tabular">{weeklyMuscleData.weekLogsCount}</strong>
            </div>
          </div>

          {/* Muscle Group Volume Cards */}
          <Card>
            <div className="row between" style={{ marginBottom: 12 }}>
              <SectionTitle style={{ margin: 0 }}>Desglose de series por grupo muscular</SectionTitle>
              <span className="muted" style={{ fontSize: 11 }}>Meta: 10-20 series</span>
            </div>

            <div className="stack small">
              {MUSCLE_GROUPS.map((group) => {
                const count = weeklyMuscleData.groupSets[group] || 0;
                // Target volume heuristic: 10-20 sets for optimal hypertrophy
                const pct = Math.min(100, Math.round((count / 16) * 100));

                let statusBadge = { label: "Sin series", color: "var(--dim-soft)", bg: "transparent" };
                if (count >= 10 && count <= 20) {
                  statusBadge = {
                    label: "Óptimo",
                    color: "var(--green)",
                    bg: "rgba(16, 185, 129, 0.12)",
                  };
                } else if (count > 20) {
                  statusBadge = {
                    label: "Alto",
                    color: "var(--blue)",
                    bg: "rgba(56, 189, 248, 0.12)",
                  };
                } else if (count > 0) {
                  statusBadge = {
                    label: "Mantenimiento",
                    color: "var(--cyan)",
                    bg: "rgba(6, 182, 212, 0.12)",
                  };
                }

                return (
                  <div
                    key={group}
                    style={{
                      background: "var(--surface-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}
                  >
                    <div className="row between">
                      <div className="row" style={{ gap: 8 }}>
                        <strong style={{ fontSize: 14 }}>{group}</strong>
                        <span
                          className="tabular"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: statusBadge.color,
                            background: statusBadge.bg,
                            padding: "2px 7px",
                            borderRadius: 6,
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </div>

                      <strong className="tabular" style={{ fontSize: 15 }}>
                        {count} <small className="muted" style={{ fontSize: 11, fontWeight: 500 }}>series</small>
                      </strong>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <ProgressBar pct={pct} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="muted" style={{ fontSize: 11, marginTop: 12 }}>
              Los ejercicios con múltiples categorías asignadas (p. ej. Dominadas en Espalda y
              Pull) computan en cada uno de sus grupos musculares correspondientes de forma
              independiente sin duplicar las series totales reales del entrenamiento.
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 3: OBJETIVOS */}
      {subView === "objetivos" && (
        <div className="stack">
          {/* Create Goal Card */}
          <Card>
            <div className="row" style={{ gap: 8, marginBottom: 12 }}>
              <TargetIcon size={16} style={{ color: "var(--cyan)" }} />
              <SectionTitle style={{ margin: 0 }}>Nuevo objetivo de fuerza</SectionTitle>
            </div>

            <form onSubmit={handleCreateGoal} className="stack small">
              <Field label="Ejercicio">
                <select
                  value={newGoal.exerciseId}
                  onChange={(e) => {
                    const ex = exercises.find((item) => item.id === e.target.value);
                    setNewGoal({
                      ...newGoal,
                      exerciseId: e.target.value,
                      unit: ex?.unit || unitPref,
                    });
                  }}
                >
                  <option value="">Selecciona un ejercicio…</option>
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.group || "General"}) — {e.unit || "kg"}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="two">
                <Field label={`Peso objetivo (${newGoal.unit || unitPref})`}>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={`Ej. ${newGoal.unit === "lbs" ? "135" : "60"}`}
                    value={newGoal.targetWeight}
                    onChange={(e) => setNewGoal({ ...newGoal, targetWeight: e.target.value })}
                  />
                </Field>
                <Field label="Reps objetivo">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Ej. 12"
                    value={newGoal.targetReps}
                    onChange={(e) => setNewGoal({ ...newGoal, targetReps: e.target.value })}
                  />
                </Field>
              </div>

              <div className="row between" style={{ padding: "4px 0" }}>
                <span className="muted" style={{ fontSize: 12 }}>Unidad del objetivo</span>
                <div className="segmentedControl mini" style={{ margin: 0, padding: 2 }}>
                  <button
                    type="button"
                    className={`segmentedTab ${(newGoal.unit || unitPref) === "kg" ? "active" : ""}`}
                    onClick={() => setNewGoal({ ...newGoal, unit: "kg" })}
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    className={`segmentedTab ${(newGoal.unit || unitPref) === "lbs" ? "active" : ""}`}
                    onClick={() => setNewGoal({ ...newGoal, unit: "lbs" })}
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    lbs
                  </button>
                </div>
              </div>

              <div>
                <label>Nota o meta (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Superar estancamiento antes de fin de mes"
                  value={newGoal.note}
                  onChange={(e) => setNewGoal({ ...newGoal, note: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="primary full"
                disabled={
                  !newGoal.exerciseId ||
                  !Number(newGoal.targetWeight) ||
                  !Number(newGoal.targetReps)
                }
                style={{ height: 44, marginTop: 6 }}
              >
                <PlusIcon size={16} strokeWidth={2.5} />
                <span>Fijar objetivo</span>
              </button>
            </form>
          </Card>

          {/* Goals List */}
          <div className="stack small">
            <SectionTitle>Objetivos activos ({goals.length})</SectionTitle>

            {!goals.length ? (
              <Empty
                title="Sin objetivos fijados"
                text="Fija un peso y repeticiones meta (ej. Press banca 60 kg × 12 reps). El progreso se evaluará de forma transparente contra tus series reales completadas."
              />
            ) : (
              goals.map((g) => {
                const ex = exercises.find((e) => e.id === g.exerciseId);
                const evalResult = evaluateGoalProgress(g, logs, exercises);
                const goalUnit = g.unit || ex?.unit || unitPref;

                return (
                  <Card key={g.id} style={{ padding: 16 }}>
                    <div className="row between">
                      <div>
                        <strong style={{ fontSize: 15 }}>{ex?.name || "Ejercicio"}</strong>
                        <div className="muted tabular" style={{ fontSize: 12, marginTop: 2 }}>
                          Meta fija:{" "}
                          <strong style={{ color: "var(--text)" }}>
                            {g.targetWeight} {goalUnit} × {g.targetReps} reps
                          </strong>
                        </div>
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <span
                          className="tabular"
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: evalResult.achieved ? "var(--green)" : "var(--cyan)",
                            background: evalResult.achieved
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(6, 182, 212, 0.15)",
                            border: `1px solid ${evalResult.achieved ? "rgba(16, 185, 129, 0.3)" : "rgba(6, 182, 212, 0.3)"}`,
                            padding: "3px 9px",
                            borderRadius: 999,
                          }}
                        >
                          {evalResult.pct}%
                        </span>
                        <button
                          type="button"
                          className="plain"
                          onClick={() => onRemoveGoal(g.id)}
                          title="Eliminar objetivo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <ProgressBar pct={evalResult.pct} />

                    <div className="row between smallText" style={{ marginTop: 6 }}>
                      <span
                        style={{ color: evalResult.achieved ? "var(--green)" : "var(--dim)" }}
                      >
                        {evalResult.statusText}
                      </span>
                      <span>
                        {evalResult.achieved
                          ? "100% completado"
                          : evalResult.bestSet
                          ? `Faltan ${Math.max(0, Number(g.targetWeight) - evalResult.bestSet.normalizedWeight).toFixed(1)} ${goalUnit} / ${Math.max(0, Number(g.targetReps) - evalResult.bestSet.reps)} reps`
                          : "Pendiente"}
                      </span>
                    </div>

                    {g.note && <div className="note">{g.note}</div>}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: RÉCORDS */}
      {subView === "records" && (
        <div className="stack small">
          <SectionTitle>Marcas históricas por ejercicio</SectionTitle>

          {!recordEntries.length ? (
            <Empty
              title="Aún no hay récords"
              text="Registra tus series en la pestaña Entrenar y aquí verás tus mejores marcas de peso, repeticiones y 1RM."
            />
          ) : (
            recordEntries.map(([id, r]) => {
              const ex = exercises.find((e) => e.id === id);
              const sourceUnit = r.unit || ex?.unit || "kg";
              const estConverted = convertWeight(r.est1RM, sourceUnit, unitPref);

              return (
                <Card key={id} style={{ padding: 14 }}>
                  <div className="row between">
                    <div>
                      <strong style={{ fontSize: 15 }}>{ex?.name || "Ejercicio"}</strong>
                      <span
                        className="chip small"
                        style={{ marginLeft: 8, padding: "2px 6px", fontSize: 10 }}
                      >
                        {ex?.group || "General"}
                      </span>
                    </div>
                    <div className="recordBig">
                      {Math.round(estConverted)}
                      <small> {unitPref} 1RM</small>
                    </div>
                  </div>

                  <div className="recordGrid">
                    <div className="mini">
                      <span>Carga máx</span>
                      <strong className="tabular">
                        {formatWeight(r.maxWeight, sourceUnit, unitPref)}
                      </strong>
                    </div>
                    <div className="mini">
                      <span>Reps máx</span>
                      <strong className="tabular">{r.maxReps}</strong>
                    </div>
                    <div className="mini">
                      <span>Serie 1RM</span>
                      <strong className="tabular">
                        {formatNumber(convertWeight(r.estWeight, sourceUnit, unitPref))}
                        {unitPref}×{r.estReps}
                      </strong>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 5: PESO CORPORAL */}
      {subView === "peso" && (
        <div className="stack">
          {/* Quick Add Weight Card */}
          <Card>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div>
                <span className="muted" style={{ fontSize: 11 }}>Último registro</span>
                <div className="big tabular" style={{ fontSize: 28, marginTop: 2 }}>
                  {weights[0]?.weight || "—"} <small>{weights[0]?.unit || unitPref}</small>
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(56, 189, 248, 0.12)",
                  color: "var(--blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ScaleIcon size={20} />
              </div>
            </div>

            <form onSubmit={handleSaveWeight} className="inline">
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder={`Añadir nuevo peso (${unitPref})`}
                value={newWeightVal}
                onChange={(e) => setNewWeightVal(e.target.value)}
              />
              <button
                type="submit"
                className="primary compact"
                disabled={!Number(newWeightVal)}
                style={{ flexShrink: 0 }}
              >
                <PlusIcon size={15} strokeWidth={2.5} />
                <span>Guardar</span>
              </button>
            </form>
          </Card>

          {/* Weight Chart */}
          {sortedWeights.length > 1 && (
            <Card>
              <div className="row between" style={{ marginBottom: 10 }}>
                <SectionTitle style={{ margin: 0 }}>Evolución del peso ({unitPref})</SectionTitle>
                <span className="muted" style={{ fontSize: 11 }}>
                  {sortedWeights.length} registros
                </span>
              </div>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sortedWeights.map((w) => ({
                      ...w,
                      label: fmtShort(w.date),
                      weightVal: Number(w.weight),
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="weightCyanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      domain={["dataMin - 2", "dataMax + 2"]}
                      tick={{ fill: C.dim, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={38}
                    />
                    <Tooltip
                      content={<ChartTip suffix={` ${unitPref}`} />}
                      cursor={{ stroke: "rgba(56, 189, 248, 0.3)", strokeWidth: 1.5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weightVal"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      fill="url(#weightCyanGrad)"
                      dot={{ fill: "#38bdf8", stroke: "#080a10", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#ffffff", stroke: "#38bdf8", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Weight Logs List */}
          {weights.length > 0 && (
            <div className="stack small">
              <SectionTitle>Historial de pesajes</SectionTitle>
              {weights.slice(0, 8).map((w) => (
                <Card key={w.id} style={{ padding: "10px 14px" }}>
                  <div className="row between">
                    <span style={{ fontSize: 13 }}>{fmtDate(w.date)}</span>
                    <strong className="tabular" style={{ fontSize: 14, color: "var(--blue)" }}>
                      {w.weight} {w.unit || unitPref}
                    </strong>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
