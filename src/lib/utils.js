import { STANDARD_PLATES } from "./constants";

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
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function fmtShort(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });
}

export function uid(prefix) {
  return prefix + Date.now() + Math.random().toString(36).slice(2, 7);
}

export function sessionVolume(log) {
  return log.sets.reduce((sum, s) => sum + Number(s.weight) * Number(s.reps), 0);
}

// Greedy plate calculation: how many of each plate (per side) to reach target weight
export function calculatePlates(targetWeight, barWeight, availablePlates = STANDARD_PLATES) {
  const perSide = (targetWeight - barWeight) / 2;

  if (perSide <= 0) {
    return { perSide: 0, breakdown: [], achieved: barWeight, remainder: 0 };
  }

  let remaining = perSide;
  const breakdown = [];

  for (const plate of availablePlates) {
    let count = 0;
    // avoid float precision issues
    while (remaining >= plate - 1e-6 && count < 20) {
      remaining = Math.round((remaining - plate) * 100) / 100;
      count++;
    }
    if (count > 0) breakdown.push({ plate, count });
  }

  const usedPerSide = breakdown.reduce((sum, b) => sum + b.plate * b.count, 0);
  const achieved = barWeight + usedPerSide * 2;

  return {
    perSide: usedPerSide,
    breakdown,
    achieved,
    remainder: Math.round(remaining * 100) / 100,
  };
}
