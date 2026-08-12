import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { DEFAULT_EXERCISES } from "./lib/constants";
import { epley, fmtShort, isoToday, shiftISO, uid, weekKey, sessionVolume } from "./lib/utils";

import Header from "./components/Header";
import Toast from "./components/Toast";
import BottomNav from "./components/BottomNav";
import RestTimerBar from "./components/RestTimerBar";

import Summary from "./screens/Summary";
import Register from "./screens/Register";
import History from "./screens/History";
import ProgressTab from "./screens/ProgressTab";
import More from "./screens/More";
import Goals from "./screens/Goals";
import CalendarView from "./screens/CalendarView";
import Records from "./screens/Records";
import Weight from "./screens/Weight";
import DataTools from "./screens/DataTools";
import PlateCalculator from "./screens/PlateCalculator";

export default function App() {
  const [exercises, setExercises] = useLocalStorage("iron_exercises", DEFAULT_EXERCISES);
  const [logs, setLogs] = useLocalStorage("iron_logs", []);
  const [goals, setGoals] = useLocalStorage("iron_goals", []);
  const [weights, setWeights] = useLocalStorage("iron_weights", []);

  const [tab, setTab] = useState("summary");
  const [sub, setSub] = useState(null);
  const [toast, setToast] = useState("");

  const [timer, setTimer] = useState({ duration: 0, remaining: 0, running: false });

  // ---- derived data ----------------------------------------------------

  const records = useMemo(() => {
    const out = {};
    for (const log of logs) {
      for (const s of log.sets) {
        const w = Number(s.weight);
        const r = Number(s.reps);
        if (!w || !r) continue;

        const item = out[log.exerciseId] || {
          maxWeight: 0,
          maxReps: 0,
          est1RM: 0,
          weightForMax: 0,
          repsForMax: 0,
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
  }, [logs]);

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
    logs.forEach((l) => {
      const w = weekKey(l.date);
      map[w] = (map[w] || 0) + sessionVolume(l);
    });

    return Array.from({ length: 8 }, (_, i) => {
      const wk = shiftISO(currentWeek, -7 * (7 - i));
      return { week: wk, label: fmtShort(wk), volume: Math.round(map[wk] || 0) };
    });
  }, [logs, currentWeek]);

  const thisWeek = weeklyVolume[7]?.volume || 0;
  const lastWeek = weeklyVolume[6]?.volume || 0;
  const volDelta = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  const totalVolume = logs.reduce((a, l) => a + sessionVolume(l), 0);
  const totalSets = logs.reduce((a, l) => a + l.sets.length, 0);

  const recentPRs = useMemo(() => {
    return Object.entries(records)
      .map(([exerciseId, r]) => ({ exerciseId, ...r }))
      .sort((a, b) => b.est1RM - a.est1RM)
      .slice(0, 5);
  }, [records]);

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

  // ---- notifications ------------------------------------------------------

  function notify(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  // ---- handlers passed down to screens ------------------------------------

  function addExercise(name) {
    if (!name || !name.trim()) return null;
    const ex = { id: uid("ex"), name: name.trim(), group: "General" };
    setExercises([...exercises, ex]);
    return ex;
  }

  function saveWorkout(exerciseId, date, rawSets) {
    const valid = rawSets
      .filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0)
      .map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) }));

    if (!exerciseId || !valid.length) return false;

    const prev = records[exerciseId]?.est1RM || 0;
    const best = Math.max(...valid.map((s) => epley(s.weight, s.reps)));

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
    setWeights([{ id: uid("wt"), date: isoToday(), weight: value }, ...weights]);
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
        note: g.note,
      },
      ...goals,
    ]);
    notify("Objetivo creado");
  }

  function removeGoal(id) {
    setGoals(goals.filter((g) => g.id !== id));
  }

  function exportData() {
    const data = { version: 2, exportedAt: new Date().toISOString(), exercises, logs, goals, weights };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `iron-log-backup-${isoToday()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (Array.isArray(d.exercises)) setExercises(d.exercises);
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

  function goToSub(name) {
    setSub(name);
  }
  function backFromSub() {
    setSub(null);
  }
  function selectTab(id) {
    setTab(id);
    setSub(null);
  }

  // ---- routing -------------------------------------------------------------

  let screen;
  if (sub === "goals") {
    screen = (
      <Goals
        exercises={exercises}
        goals={goals}
        records={records}
        onAddGoal={addGoal}
        onRemoveGoal={removeGoal}
        onBack={backFromSub}
      />
    );
  } else if (sub === "calendar") {
    screen = <CalendarView logs={logs} streak={streak} onBack={backFromSub} />;
  } else if (sub === "records") {
    screen = <Records records={records} exercises={exercises} onBack={backFromSub} />;
  } else if (sub === "weight") {
    screen = <Weight weights={weights} onAddWeight={addWeight} onBack={backFromSub} />;
  } else if (sub === "plates") {
    screen = <PlateCalculator onBack={backFromSub} />;
  } else if (sub === "data") {
    screen = <DataTools onExport={exportData} onImport={importData} onBack={backFromSub} />;
  } else if (tab === "summary") {
    screen = (
      <Summary
        logs={logs}
        streak={streak}
        thisWeek={thisWeek}
        weeklyVolume={weeklyVolume}
        volDelta={volDelta}
        totalVolume={totalVolume}
        totalSets={totalSets}
        latestWeight={weights[0]?.weight}
        recentPRs={recentPRs}
        exercises={exercises}
        onGoToRegister={() => selectTab("register")}
      />
    );
  } else if (tab === "register") {
    screen = (
      <Register
        exercises={exercises}
        logs={logs}
        records={records}
        onAddExercise={addExercise}
        onSaveWorkout={saveWorkout}
        onStartRest={startRest}
      />
    );
  } else if (tab === "history") {
    screen = (
      <History logs={logs} exercises={exercises} onDeleteLog={deleteLog} onUpdateLog={updateLog} />
    );
  } else if (tab === "progress") {
    screen = (
      <ProgressTab
        weeklyVolume={weeklyVolume}
        goals={goals}
        records={records}
        exercises={exercises}
        weights={weights}
        onGoToSub={goToSub}
      />
    );
  } else {
    screen = <More onGoToSub={goToSub} />;
  }

  return (
    <div className="app">
      <Header sessionCount={logs.length} />
      <Toast message={toast} />
      <main>{screen}</main>
      {timer.duration > 0 && (
        <RestTimerBar timer={timer} onToggle={toggleRest} onReset={resetRest} onDismiss={dismissRest} />
      )}
      <BottomNav tab={tab} sub={sub} onSelect={selectTab} />
    </div>
  );
}
