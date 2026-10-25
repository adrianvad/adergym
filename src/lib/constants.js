export const C = {
  bg: "#080a10",
  surface: "#0f131d",
  surfaceElevated: "#161c2c",
  border: "rgba(255, 255, 255, 0.08)",
  text: "#f8fafc",
  dim: "#94a3b8",
  dimSoft: "#64748b",
  cyan: "#06b6d4",
  blue: "#38bdf8",
  cobalt: "#2563eb",
  indigo: "#818cf8",
  green: "#10b981",
  rose: "#f43f5e",
};

export const KG_TO_LBS = 2.20462262185;
export const LBS_TO_KG = 1 / KG_TO_LBS;

export const MUSCLE_GROUPS = [
  "Empuje",
  "Pull",
  "Pierna",
  "Espalda",
  "Pecho",
  "Hombros",
  "Brazos",
  "Core",
  "General",
];

export function getExerciseGroups(ex) {
  if (Array.isArray(ex?.groups) && ex.groups.length > 0) {
    return ex.groups;
  }
  if (typeof ex?.group === "string" && ex.group.trim()) {
    return [ex.group.trim()];
  }
  return ["General"];
}

export function getExerciseUnit(ex, fallback = "kg") {
  return ex?.unit === "lbs" ? "lbs" : "kg";
}

export const DEFAULT_EXERCISES = [
  { id: "ex1", name: "Press banca", groups: ["Empuje", "Pecho"], group: "Empuje", favorite: true, unit: "kg" },
  { id: "ex2", name: "Sentadilla", groups: ["Pierna"], group: "Pierna", favorite: true, unit: "kg" },
  { id: "ex3", name: "Peso muerto", groups: ["Espalda", "Pull", "Pierna"], group: "Espalda", favorite: true, unit: "kg" },
  { id: "ex4", name: "Press militar", groups: ["Empuje", "Hombros"], group: "Hombros", favorite: true, unit: "kg" },
  { id: "ex5", name: "Dominadas", groups: ["Espalda", "Pull"], group: "Espalda", favorite: false, unit: "kg" },
  { id: "ex6", name: "Remo con barra", groups: ["Espalda", "Pull"], group: "Espalda", favorite: false, unit: "kg" },
  { id: "ex7", name: "Fondos en paralelas", groups: ["Empuje", "Pecho", "Brazos"], group: "Empuje", favorite: false, unit: "kg" },
  { id: "ex8", name: "Curl de bíceps", groups: ["Brazos", "Pull"], group: "Brazos", favorite: false, unit: "kg" },
  { id: "ex9", name: "Elevaciones laterales", groups: ["Hombros"], group: "Hombros", favorite: false, unit: "kg" },
  { id: "ex10", name: "Prensa de piernas", groups: ["Pierna"], group: "Pierna", favorite: false, unit: "kg" },
];

export const DEFAULT_ROUTINES = [
  {
    id: "rt_torso",
    name: "Torso Fuerza & Hipertrofia",
    description: "Empuje y tracción para desarrollo equilibrado de torso",
    exercises: [
      { exerciseId: "ex1", targetSets: 4, targetReps: "6-8" },
      { exerciseId: "ex6", targetSets: 4, targetReps: "8-10" },
      { exerciseId: "ex4", targetSets: 3, targetReps: "8-10" },
      { exerciseId: "ex5", targetSets: 3, targetReps: "8-10" },
      { exerciseId: "ex8", targetSets: 3, targetReps: "10-12" },
    ],
  },
  {
    id: "rt_pierna",
    name: "Pierna & Potencia",
    description: "Cadena anterior y posterior de tren inferior",
    exercises: [
      { exerciseId: "ex2", targetSets: 4, targetReps: "6-8" },
      { exerciseId: "ex10", targetSets: 3, targetReps: "10-12" },
      { exerciseId: "ex3", targetSets: 3, targetReps: "5-6" },
      { exerciseId: "ex9", targetSets: 3, targetReps: "12-15" },
    ],
  },
  {
    id: "rt_push",
    name: "Push & Hombros",
    description: "Foco en pectorales, deltoides y tríceps",
    exercises: [
      { exerciseId: "ex1", targetSets: 4, targetReps: "8-10" },
      { exerciseId: "ex4", targetSets: 4, targetReps: "8-10" },
      { exerciseId: "ex7", targetSets: 3, targetReps: "8-10" },
      { exerciseId: "ex9", targetSets: 3, targetReps: "12-15" },
    ],
  },
];

export const emptyGoal = {
  exerciseId: "",
  targetWeight: "",
  targetReps: "",
  unit: "kg",
  note: "",
};

export const REST_PRESETS = [45, 60, 90, 120, 180];

