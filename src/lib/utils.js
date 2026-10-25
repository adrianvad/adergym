import { KG_TO_LBS, LBS_TO_KG, getExerciseGroups } from "./constants";

export function epley(w, r) {
  return w && r ? w * (1 + r / 30) : 0;
}

export function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export function shiftISO(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekKey(iso) {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function fmtShort(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });
}

export function uid(prefix = "id") {
  return prefix + Date.now() + Math.random().toString(36).slice(2, 7);
}

/**
 * Exact weight conversion between kg and lbs
 * 1 kg = 2.20462262185 lbs
 */
export function convertWeight(val, fromUnit = "kg", toUnit = "kg") {
  const num = Number(val);
  if (!num || isNaN(num)) return 0;
  const from = fromUnit === "lbs" ? "lbs" : "kg";
  const to = toUnit === "lbs" ? "lbs" : "kg";

  if (from === to) return num;
  if (from === "kg" && to === "lbs") {
    return num * KG_TO_LBS;
  }
  return num * LBS_TO_KG;
}

/**
 * Rounds a number to the nearest step (e.g. 0.5, 1, 2.5, 5)
 */
export function roundToStep(val, step = 0.5) {
  const s = Number(step) || 0.5;
  return Math.round(Number(val) / s) * s;
}

/**
 * Formats a weight with exact conversion and readable precision
 */
export function formatWeight(val, fromUnit = "kg", displayUnit = "kg", precision = 1) {
  const converted = convertWeight(val, fromUnit, displayUnit);
  const rounded = Number(converted.toFixed(precision));
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(precision)} ${displayUnit}`;
}

export function formatNumber(val, precision = 1) {
  const num = Number(val) || 0;
  const rounded = Number(num.toFixed(precision));
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(precision);
}

export function sessionVolume(log, targetUnit = null, defaultLogUnit = "kg") {
  if (!log?.sets) return 0;
  return log.sets.reduce((sum, s) => {
    const rawW = Number(s.weight || 0);
    const r = Number(s.reps || 0);
    if (!rawW || !r) return sum;
    const setUnit = s.unit || defaultLogUnit || "kg";
    const w = targetUnit ? convertWeight(rawW, setUnit, targetUnit) : rawW;
    return sum + w * r;
  }, 0);
}

/**
 * Generates progressive conservative warm-up sets
 * Warmup 1: ~45% (or empty bar 20kg / 45lbs if target is high) x 8-10 reps
 * Warmup 2: ~60% x 5 reps
 * Warmup 3: ~75% x 3 reps
 * Warmup 4: ~85% x 1-2 reps
 */
export function calcWarmupSets(targetWeight, unit = "kg", plateIncrement = 2.5) {
  const target = Number(targetWeight);
  if (!target || target <= 0) return [];

  const inc = Number(plateIncrement) || (unit === "lbs" ? 5 : 2.5);
  const minBar = unit === "lbs" ? 45 : 20;

  const rawSteps = [
    { pct: 0.45, reps: 10, label: "Calentamiento suave / Movilidad" },
    { pct: 0.60, reps: 5, label: "Aceleración técnica" },
    { pct: 0.75, reps: 3, label: "Activación neuronal" },
    { pct: 0.85, reps: 2, label: "Aproximación final" },
  ];

  return rawSteps.map((step, idx) => {
    let calcW = target * step.pct;
    // Don't go below standard bar if target is heavy
    if (target >= minBar * 1.5 && calcW < minBar) {
      calcW = minBar;
    }
    // Round to chosen plate increment
    let rounded = roundToStep(calcW, inc);
    if (rounded < inc) rounded = inc;
    if (rounded >= target) rounded = Math.max(inc, target - inc);

    return {
      setNumber: idx + 1,
      percent: Math.round(step.pct * 100),
      weight: rounded,
      reps: step.reps,
      unit,
      label: step.label,
    };
  });
}

/**
 * Aggregates actual sets completed per muscle group in a given week.
 * Preserves multi-category attribution without duplicating the total unique sets count.
 */
export function calcWeeklyMuscleVolume(logs, exercises, targetWeekKey) {
  const weekLogs = logs.filter((l) => weekKey(l.date) === targetWeekKey);
  const exMap = new Map(exercises.map((e) => [e.id, e]));

  const groupSets = {};
  let totalUniqueSets = 0;

  for (const log of weekLogs) {
    const ex = exMap.get(log.exerciseId);
    const groups = getExerciseGroups(ex);
    const validSetsCount = (log.sets || []).filter(
      (s) => Number(s.weight || 0) > 0 && Number(s.reps || 0) > 0
    ).length;

    totalUniqueSets += validSetsCount;

    for (const g of groups) {
      groupSets[g] = (groupSets[g] || 0) + validSetsCount;
    }
  }

  return {
    groupSets,
    totalUniqueSets,
    weekLogsCount: weekLogs.length,
  };
}

/**
 * Evaluates progress towards a specific goal (targetWeight x targetReps)
 * strictly using REAL recorded sets, with safe unit handling.
 */
export function evaluateGoalProgress(goal, logs, exercises = []) {
  const targetW = Number(goal.targetWeight);
  const targetR = Number(goal.targetReps);
  const goalUnit = goal.unit === "lbs" ? "lbs" : "kg";

  if (!targetW || !targetR) {
    return { pct: 0, achieved: false, bestSet: null, statusText: "Datos incompletos" };
  }

  const ex = exercises.find((e) => e.id === goal.exerciseId);
  const defaultExUnit = ex?.unit === "lbs" ? "lbs" : "kg";
  const exerciseLogs = logs.filter((l) => l.exerciseId === goal.exerciseId);
  const allSets = [];

  for (const log of exerciseLogs) {
    for (const s of log.sets || []) {
      const rawW = Number(s.weight || 0);
      const r = Number(s.reps || 0);
      if (rawW > 0 && r > 0) {
        const setUnit = s.unit || defaultExUnit;
        // Convert real set weight to the goal's unit to compare accurately
        const normalizedWeight = convertWeight(rawW, setUnit, goalUnit);
        allSets.push({
          weight: rawW,
          normalizedWeight,
          reps: r,
          unit: setUnit,
          date: log.date,
        });
      }
    }
  }

  if (!allSets.length) {
    return {
      pct: 0,
      achieved: false,
      bestSet: null,
      statusText: "Sin series registradas",
    };
  }

  // Check if any real set reached or surpassed the exact target
  const achievedSets = allSets.filter(
    (s) => s.normalizedWeight >= targetW && s.reps >= targetR
  );
  if (achievedSets.length > 0) {
    const best = achievedSets.sort(
      (a, b) => b.normalizedWeight * b.reps - a.normalizedWeight * a.reps
    )[0];
    const bestFormatted = formatNumber(best.normalizedWeight);
    return {
      pct: 100,
      achieved: true,
      bestSet: best,
      statusText: `¡Objetivo cumplido! (${bestFormatted} ${goalUnit} × ${best.reps} reps)`,
    };
  }

  let bestScore = 0;
  let bestSet = null;

  for (const s of allSets) {
    const weightFraction = Math.min(1, s.normalizedWeight / targetW);
    const repsFraction = Math.min(1, s.reps / targetR);
    const score = Math.round(weightFraction * repsFraction * 100);

    if (score > bestScore) {
      bestScore = score;
      bestSet = s;
    } else if (score === bestScore && s.normalizedWeight > (bestSet?.normalizedWeight || 0)) {
      bestSet = s;
    }
  }

  const bestFormatted = bestSet ? formatNumber(bestSet.normalizedWeight) : "";

  return {
    pct: Math.min(99, Math.max(0, bestScore)),
    achieved: false,
    bestSet,
    statusText: bestSet
      ? `Mejor serie real: ${bestFormatted} ${goalUnit} × ${bestSet.reps} reps`
      : "En progreso",
  };
}

