import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { DEFAULT_EXERCISES, DEFAULT_ROUTINES } from "./lib/constants";
import {
  epley,
  fmtShort,
  isoToday,
  shiftISO,
  uid,
  weekKey,
  sessionVolume,
  convertWeight,
} from "./lib/utils";

import Header from "./components/Header";
import Toast from "./components/Toast";
import BottomNav from "./components/BottomNav";
import RestTimerBar from "./components/RestTimerBar";

import WorkoutTab from "./screens/WorkoutTab";
import ActivityTab from "./screens/ActivityTab";
import ProgressHubTab from "./screens/ProgressHubTab";
import CatalogAndDataTab from "./screens/CatalogAndDataTab";

export default function App() {
  const [exercises, setExercises] = useLocalStorage("iron_exercises", DEFAULT_EXERCISES);
  const [logs, setLogs] = useLocalStorage("iron_logs", []);
  const [goals, setGoals] = useLocalStorage("iron_goals", []);
  const [weights, setWeights] = useLocalStorage("iron_weights", []);
  const [theme, setTheme] = useLocalStorage("iron_theme", "dark");
  const [unitPref, setUnitPref] = useLocalStorage("iron_unit_pref", "kg"); // "kg" | "lbs"
  const [routines, setRoutines] = useLocalStorage("iron_routines", DEFAULT_ROUTINES);

  // Active routine context being run in WorkoutTab
  const [activeRoutine, setActiveRoutine] = useState(null);

  // Primary navigation tab: "workout" | "activity" | "progress" | "catalog"
  const [tab, setTab] = useState("workout");
  const [toast, setToast] = useState("");
  const [timer, setTimer] = useState({ duration: 0, remaining: 0, running: false });

  // Sync theme with document root & browser theme-color meta
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f8fafc" : "#080a10");
    }
  }, [theme]);

  // ---- derived metrics (unit aware) --------------------------------------

  const records = useMemo(() => {
    const out = {};
    const exMap = new Map(exercises.map((e) => [e.id, e]));

    for (const log of logs) {
      const ex = exMap.get(log.exerciseId);
      const defaultUnit = ex?.unit || "kg";

      for (const s of log.sets) {
        const rawW = Number(s.weight);
        const r = Number(s.reps);
        if (!rawW || !r) continue;

        const setUnit = s.unit || defaultUnit;
        // Normalize to exercise native unit for PR comparison
        const w = convertWeight(rawW, setUnit, defaultUnit);

        const item = out[log.exerciseId] || {
          maxWeight: 0,
          maxReps: 0,
          est1RM: 0,
          weightForMax: 0,
          repsForMax: 0,
          unit: defaultUnit,
          date: "",
        };

        if (w > item.maxWeight) {
          item.maxWeight = w;
          item.weightForMax = w;
          item.repsForMax = r;
          item.date = log.date;
        }
        item.maxReps = Math.max(item.maxReps, r);

        const est = epley(w, r);
        if (est > item.est1RM) {
          item.est1RM = est;
          item.estWeight = w;
          item.estReps = r;
          item.estDate = log.date;
        }

        out[log.exerciseId] = item;
      }
    }
    return out;
  }, [logs, exercises]);

  const streak = useMemo(() => {
    if (!logs.length) return 0;
    let cur = weekKey(isoToday());
    let n = 0;
    const weeks = new Set(logs.map((l) => weekKey(l.date)));
    if (!weeks.has(cur)) cur = shiftISO(cur, -7);
    while (weeks.has(cur)) {
      n++;
      cur = shiftISO(cur, -7);
    }
    return n;
  }, [logs]);

  const currentWeek = weekKey(isoToday());

  const weeklyVolume = useMemo(() => {
    const map = {};
    const exMap = new Map(exercises.map((e) => [e.id, e]));

    logs.forEach((l) => {
      const w = weekKey(l.date);
      const ex = exMap.get(l.exerciseId);
      const defUnit = ex?.unit || "kg";
      map[w] = (map[w] || 0) + sessionVolume(l, unitPref, defUnit);
    });

    return Array.from({ length: 8 }, (_, i) => {
      const wk = shiftISO(currentWeek, -7 * (7 - i));
      return { week: wk, label: fmtShort(wk), volume: Math.round(map[wk] || 0) };
    });
  }, [logs, exercises, currentWeek, unitPref]);

  const thisWeek = weeklyVolume[7]?.volume || 0;
  const lastWeek = weeklyVolume[6]?.volume || 0;
  const volDelta = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  const totalVolume = useMemo(() => {
    const exMap = new Map(exercises.map((e) => [e.id, e]));
    return logs.reduce((a, l) => {
      const ex = exMap.get(l.exerciseId);
      return a + sessionVolume(l, unitPref, ex?.unit || "kg");
    }, 0);
  }, [logs, exercises, unitPref]);

  const totalSets = logs.reduce((a, l) => a + l.sets.length, 0);

  // ---- rest timer --------------------------------------------------------

  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (!t.running) return t;
        if (t.remaining <= 1) {
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          notify("Descanso terminado");
          return { ...t, remaining: 0, running: false };
        }
        return { ...t, remaining: t.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timer.running]);

  function startRest(seconds) {
    setTimer({ duration: seconds, remaining: seconds, running: true });
  }
  function toggleRest() {
    setTimer((t) => ({ ...t, running: !t.running }));
  }
  function resetRest() {
    setTimer((t) => ({ ...t, remaining: t.duration, running: true }));
  }
  function dismissRest() {
    setTimer({ duration: 0, remaining: 0, running: false });
  }

  function notify(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  // ---- Exercise Management (Create, Edit muscle groups, Toggle favorite) ----

  function handleSaveExercise(ex) {
    const groups =
      Array.isArray(ex.groups) && ex.groups.length > 0
        ? ex.groups
        : ex.group
        ? [ex.group]
        : ["General"];
    const unit = ex.unit === "lbs" ? "lbs" : "kg";

    if (ex.id) {
      setExercises((prev) =>
        prev.map((item) =>
          item.id === ex.id
            ? {
                ...item,
                name: ex.name,
                groups,
                group: groups[0] || "General",
                favorite: ex.favorite,
                unit,
              }
            : item
        )
      );
      notify("Ejercicio actualizado");
    } else {
      const newEx = {
        id: uid("ex"),
        name: ex.name,
        groups,
        group: groups[0] || "General",
        favorite: Boolean(ex.favorite),
        unit,
      };
      setExercises((prev) => [...prev, newEx]);
      notify("Ejercicio creado");
      return newEx;
    }
  }

  function handleToggleFavorite(id) {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e))
    );
  }

  // ---- Routine Management -------------------------------------------------

  function handleSaveRoutine(rt) {
    if (routines.some((r) => r.id === rt.id)) {
      setRoutines(routines.map((r) => (r.id === rt.id ? rt : r)));
      notify("Rutina actualizada");
    } else {
      setRoutines([...routines, rt]);
      notify("Rutina creada");
    }
  }

  function handleDeleteRoutine(id) {
    setRoutines(routines.filter((r) => r.id !== id));
    notify("Rutina eliminada");
  }

  function handleDuplicateRoutine(id) {
    const original = routines.find((r) => r.id === id);
    if (!original) return;
    const duplicated = {
      ...original,
      id: uid("rt"),
      name: `${original.name} (copia)`,
      exercises: original.exercises.map((e) => ({ ...e })),
    };
    setRoutines([...routines, duplicated]);
    notify("Rutina duplicada");
  }

  function handleStartRoutine(routine) {
    setActiveRoutine({
      routineId: routine.id,
      name: routine.name,
      exercises: routine.exercises,
      currentIndex: 0,
    });
    setTab("workout");
    notify(`Iniciando rutina: ${routine.name}`);
  }

  function handleCancelRoutine() {
    setActiveRoutine(null);
    notify("Rutina finalizada");
  }

  // ---- Workouts, Goals, Weight & Data --------------------------------------

  function saveWorkout(exerciseId, date, rawSets) {
    const ex = exercises.find((e) => e.id === exerciseId);
    const defUnit = ex?.unit || "kg";

    const valid = rawSets
      .filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0)
      .map((s) => ({
        weight: Number(s.weight),
        reps: Number(s.reps),
        unit: s.unit || defUnit,
      }));

    if (!exerciseId || !valid.length) return false;

    const prev = records[exerciseId]?.est1RM || 0;
    const best = Math.max(
      ...valid.map((s) => epley(convertWeight(s.weight, s.unit, defUnit), s.reps))
    );

    setLogs([{ id: uid("log"), exerciseId, date, sets: valid }, ...logs]);
    notify(best > prev && prev > 0 ? "🏆 NUEVO PR" : "Entrenamiento guardado");
    return true;
  }

  function deleteLog(id) {
    setLogs(logs.filter((l) => l.id !== id));
    notify("Entrenamiento eliminado");
  }

  function updateLog(updated) {
    setLogs(logs.map((l) => (l.id === updated.id ? updated : l)));
    notify("Entrenamiento actualizado");
  }

  function addWeight(value) {
    setWeights([{ id: uid("wt"), date: isoToday(), weight: value, unit: unitPref }, ...weights]);
    notify("Peso registrado");
  }

  function addGoal(g) {
    if (!g.exerciseId || !Number(g.targetWeight) || !Number(g.targetReps)) return;
    setGoals([
      {
        id: uid("goal"),
        exerciseId: g.exerciseId,
        targetWeight: Number(g.targetWeight),
        targetReps: Number(g.targetReps),
        unit: g.unit || unitPref || "kg",
        note: g.note || "",
      },
      ...goals,
    ]);
    notify("Objetivo fijado");
  }

  function removeGoal(id) {
    setGoals(goals.filter((g) => g.id !== id));
    notify("Objetivo eliminado");
  }

  function exportData() {
    const data = {
      version: 3,
      exportedAt: new Date().toISOString(),
      unitPref,
      exercises,
      routines,
      logs,
      goals,
      weights,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `adergym-backup-${isoToday()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify("Copia exportada");
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (d.unitPref === "kg" || d.unitPref === "lbs") setUnitPref(d.unitPref);
        if (Array.isArray(d.exercises)) setExercises(d.exercises);
        if (Array.isArray(d.routines)) setRoutines(d.routines);
        if (Array.isArray(d.logs)) setLogs(d.logs);
        if (Array.isArray(d.goals)) setGoals(d.goals);
        if (Array.isArray(d.weights)) setWeights(d.weights);
        notify("Copia restaurada");
      } catch {
        notify("Archivo inválido");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="app" data-theme={theme}>
      <Header
        sessionCount={logs.length}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      />
      <Toast message={toast} />

      <main>
        {tab === "workout" && (
          <WorkoutTab
            exercises={exercises}
            logs={logs}
            records={records}
            unitPref={unitPref}
            routines={routines}
            activeRoutine={activeRoutine}
            onStartRoutine={handleStartRoutine}
            onCancelRoutine={handleCancelRoutine}
            onSaveExercise={handleSaveExercise}
            onSaveWorkout={saveWorkout}
            onStartRest={startRest}
            onDeleteLog={deleteLog}
          />
        )}

        {tab === "activity" && (
          <ActivityTab
            logs={logs}
            exercises={exercises}
            streak={streak}
            unitPref={unitPref}
            onDeleteLog={deleteLog}
            onUpdateLog={updateLog}
          />
        )}

        {tab === "progress" && (
          <ProgressHubTab
            weeklyVolume={weeklyVolume}
            volDelta={volDelta}
            totalVolume={totalVolume}
            totalSets={totalSets}
            goals={goals}
            records={records}
            exercises={exercises}
            weights={weights}
            logs={logs}
            unitPref={unitPref}
            onAddGoal={addGoal}
            onRemoveGoal={removeGoal}
            onAddWeight={addWeight}
          />
        )}

        {tab === "catalog" && (
          <CatalogAndDataTab
            exercises={exercises}
            routines={routines}
            logs={logs}
            goals={goals}
            weights={weights}
            theme={theme}
            unitPref={unitPref}
            onSetTheme={setTheme}
            onSetUnitPref={setUnitPref}
            onSaveExercise={handleSaveExercise}
            onToggleFavorite={handleToggleFavorite}
            onSaveRoutine={handleSaveRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onDuplicateRoutine={handleDuplicateRoutine}
            onStartRoutine={handleStartRoutine}
            onExport={exportData}
            onImport={importData}
          />
        )}
      </main>

      {timer.duration > 0 && (
        <RestTimerBar
          timer={timer}
          onToggle={toggleRest}
          onReset={resetRest}
          onDismiss={dismissRest}
        />
      )}

      <BottomNav tab={tab} onSelect={setTab} />
    </div>
  );
}
