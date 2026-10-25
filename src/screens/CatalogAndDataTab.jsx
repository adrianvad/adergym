import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Database,
  Download,
  Dumbbell,
  Edit3,
  Layers,
  Moon,
  Play,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { Card, SectionTitle } from "../components/ui";
import { MUSCLE_GROUPS, getExerciseGroups } from "../lib/constants";
import ExerciseModal from "../components/ExerciseModal";
import RoutineModal from "../components/RoutineModal";

export default function CatalogAndDataTab({
  exercises,
  routines = [],
  logs,
  goals,
  weights,
  theme,
  unitPref = "kg",
  onSetTheme,
  onSetUnitPref,
  onSaveExercise,
  onToggleFavorite,
  onSaveRoutine,
  onDeleteRoutine,
  onDuplicateRoutine,
  onStartRoutine,
  onExport,
  onImport,
}) {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [editingEx, setEditingEx] = useState(null);
  const [isCreatingEx, setIsCreatingEx] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);

  // Filter exercises by category and query
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const groups = getExerciseGroups(ex);
      const matchG = selectedGroup === "Todos" || groups.includes(selectedGroup);
      const matchQ = ex.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchG && matchQ;
    });
  }, [exercises, selectedGroup, query]);

  return (
    <div className="stack">
      {/* 1. Global Unit Preference Card */}
      <Card>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <Scale size={16} style={{ color: "var(--cyan)" }} />
            <SectionTitle style={{ margin: 0 }}>Sistema de unidades</SectionTitle>
          </div>
          <span
            className="tabular"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--cyan)",
              background: "rgba(6, 182, 212, 0.1)",
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            1 kg = 2.205 lbs
          </span>
        </div>

        <div className="two" style={{ gap: 10 }}>
          <button
            type="button"
            className={unitPref === "kg" ? "themeCard active" : "themeCard"}
            onClick={() => onSetUnitPref("kg")}
          >
            <div className="row between fullWidth">
              <strong style={{ fontSize: 15 }}>Kilogramos (kg)</strong>
              {unitPref === "kg" && (
                <Check size={16} style={{ color: "var(--cyan)" }} strokeWidth={3} />
              )}
            </div>
            <small className="muted" style={{ fontSize: 11, textAlign: "left", marginTop: 4 }}>
              Estándar métrico internacional. Incrementos comunes de 1.25 / 2.5 kg.
            </small>
          </button>

          <button
            type="button"
            className={unitPref === "lbs" ? "themeCard active" : "themeCard"}
            onClick={() => onSetUnitPref("lbs")}
          >
            <div className="row between fullWidth">
              <strong style={{ fontSize: 15 }}>Libras (lbs)</strong>
              {unitPref === "lbs" && (
                <Check size={16} style={{ color: "var(--cyan)" }} strokeWidth={3} />
              )}
            </div>
            <small className="muted" style={{ fontSize: 11, textAlign: "left", marginTop: 4 }}>
              Sistema imperial. Incrementos comunes de 2.5 / 5 lbs.
            </small>
          </button>
        </div>

        <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>
          Las métricas, récords y volúmenes se presentarán en tu unidad preferida sin alterar el
          valor físico original de las series almacenadas.
        </div>
      </Card>

      {/* 2. Routines and Workout Templates Section */}
      <Card>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <Layers size={16} style={{ color: "var(--cyan)" }} />
              <SectionTitle style={{ margin: 0 }}>Rutinas y plantillas</SectionTitle>
              <span className="badgeCount">{routines.length}</span>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Planifica secuencias de ejercicios y objetivos para entrenar
            </div>
          </div>
          <button
            type="button"
            className="primary compact"
            onClick={() => setIsCreatingRoutine(true)}
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Nueva rutina</span>
          </button>
        </div>

        <div className="stack small">
          {routines.map((rt) => {
            return (
              <div key={rt.id} className="routineCard">
                <div className="routineCardHeader">
                  <div className="routineCardInfo">
                    <strong className="routineCardTitle">{rt.name}</strong>
                    {rt.description && (
                      <p className="routineCardDesc">{rt.description}</p>
                    )}
                  </div>

                  <div className="routineCardActions">
                    <button
                      type="button"
                      className="primary compact"
                      onClick={() => onStartRoutine(rt)}
                      title="Iniciar entrenamiento con esta rutina"
                      style={{ padding: "5px 10px", fontSize: 11, gap: 4, whiteSpace: "nowrap" }}
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Entrenar</span>
                    </button>
                    <button
                      type="button"
                      className="iconBtn"
                      onClick={() => onDuplicateRoutine(rt.id)}
                      title="Duplicar rutina"
                      aria-label="Duplicar"
                      style={{ padding: 6, borderRadius: 8, flexShrink: 0 }}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      className="iconBtn"
                      onClick={() => setEditingRoutine(rt)}
                      title="Editar rutina"
                      aria-label="Editar"
                      style={{ padding: 6, borderRadius: 8, flexShrink: 0 }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      className="iconBtn"
                      onClick={() => onDeleteRoutine(rt.id)}
                      title="Eliminar rutina"
                      aria-label="Eliminar"
                      style={{ padding: 6, borderRadius: 8, flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {rt.exercises?.length > 0 && (
                  <div className="routineExercisesList">
                    {rt.exercises.map((item, idx) => {
                      const ex = exercises.find((e) => e.id === item.exerciseId);
                      return (
                        <span key={idx} className="routineExerciseChip">
                          <span
                            className="routineExerciseName"
                            title={ex?.name || "Ejercicio"}
                          >
                            {ex?.name || "Ejercicio"}
                          </span>
                          <span
                            className="muted tabular"
                            style={{ flexShrink: 0, fontSize: 10 }}
                          >
                            {item.targetSets}×{item.targetReps}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {!routines.length && (
            <div className="muted" style={{ textAlign: "center", padding: "16px 0", fontSize: 13 }}>
              No tienes rutinas creadas aún. Crea una para estructurar tus entrenamientos.
            </div>
          )}
        </div>
      </Card>

      {/* 3. Exercise Catalog Section */}
      <Card>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <Dumbbell size={16} style={{ color: "var(--cyan)" }} />
              <SectionTitle style={{ margin: 0 }}>Catálogo de ejercicios</SectionTitle>
              <span className="badgeCount">{exercises.length}</span>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Administra nombres, categorías múltiples y unidades predeterminadas
            </div>
          </div>
          <button
            type="button"
            className="primary compact"
            onClick={() => setIsCreatingEx(true)}
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Nuevo</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="searchRow" style={{ marginBottom: 10 }}>
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre de ejercicio…"
          />
        </div>

        {/* Muscle Group Filter Rail */}
        <div className="chips scrollX" style={{ marginBottom: 12 }}>
          {["Todos", ...MUSCLE_GROUPS].map((g) => (
            <button
              key={g}
              type="button"
              className={selectedGroup === g ? "chip small active" : "chip small"}
              onClick={() => setSelectedGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Exercises List */}
        <div className="stack small" style={{ maxHeight: 360, overflowY: "auto", padding: 2 }}>
          {filteredExercises.map((ex) => {
            const usageCount = logs.filter((l) => l.exerciseId === ex.id).length;
            const groups = getExerciseGroups(ex);
            const unit = ex.unit === "lbs" ? "lbs" : "kg";

            return (
              <div
                key={ex.id}
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <button
                    type="button"
                    className="plain"
                    onClick={() => onToggleFavorite(ex.id)}
                    aria-label={ex.favorite ? "Quitar de favoritos" : "Marcar favorito"}
                    title={ex.favorite ? "Quitar de favoritos" : "Marcar favorito"}
                    style={{ padding: 4 }}
                  >
                    <Star
                      size={18}
                      style={{
                        color: ex.favorite ? "var(--cyan)" : "var(--dim-soft)",
                        fill: ex.favorite ? "var(--cyan)" : "none",
                      }}
                    />
                  </button>
                  <div>
                    <div className="row" style={{ gap: 6, alignItems: "center" }}>
                      <strong style={{ fontSize: 14 }}>{ex.name}</strong>
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

                    <div className="row wrap" style={{ gap: 5, marginTop: 4 }}>
                      {groups.map((g) => (
                        <span
                          key={g}
                          className="chip small"
                          style={{
                            padding: "1px 7px",
                            fontSize: 10,
                            background: "var(--surface-inset)",
                            borderColor: "var(--border)",
                          }}
                        >
                          {g}
                        </span>
                      ))}
                      <span
                        className="muted tabular"
                        style={{ fontSize: 11, alignSelf: "center", marginLeft: 2 }}
                      >
                        · {usageCount} {usageCount === 1 ? "sesión" : "sesiones"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => setEditingEx(ex)}
                  aria-label="Editar ejercicio"
                  title="Editar nombre, categorías y unidad"
                  style={{ padding: 6, borderRadius: 8 }}
                >
                  <Edit3 size={14} />
                </button>
              </div>
            );
          })}

          {filteredExercises.length === 0 && (
            <div className="muted" style={{ textAlign: "center", padding: "16px 0" }}>
              No hay ejercicios que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </Card>

      {/* 4. Appearance / Theme Selector Card */}
      <Card>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} style={{ color: "var(--cyan)" }} />
          <SectionTitle style={{ margin: 0 }}>Apariencia</SectionTitle>
        </div>

        <div className="two" style={{ gap: 10 }}>
          <button
            type="button"
            className={theme === "dark" ? "themeCard active" : "themeCard"}
            onClick={() => onSetTheme("dark")}
          >
            <div className="themePreview dark">
              <div className="tpBar" />
              <div className="tpBlock" />
            </div>
            <div className="row between fullWidth" style={{ marginTop: 8 }}>
              <div className="row" style={{ gap: 6 }}>
                <Moon size={14} />
                <strong>Modo Oscuro</strong>
              </div>
              {theme === "dark" && (
                <Check size={14} style={{ color: "var(--cyan)" }} strokeWidth={3} />
              )}
            </div>
            <small className="muted" style={{ fontSize: 11, textAlign: "left" }}>
              Obsidiana profunda de alto contraste
            </small>
          </button>

          <button
            type="button"
            className={theme === "light" ? "themeCard active" : "themeCard"}
            onClick={() => onSetTheme("light")}
          >
            <div className="themePreview light">
              <div className="tpBar" />
              <div className="tpBlock" />
            </div>
            <div className="row between fullWidth" style={{ marginTop: 8 }}>
              <div className="row" style={{ gap: 6 }}>
                <Sun size={14} />
                <strong>Modo Claro</strong>
              </div>
              {theme === "light" && (
                <Check size={14} style={{ color: "var(--cyan)" }} strokeWidth={3} />
              )}
            </div>
            <small className="muted" style={{ fontSize: 11, textAlign: "left" }}>
              Cerámica Apple limpia y luminosa
            </small>
          </button>
        </div>
      </Card>

      {/* 5. Backup and Data Management */}
      <Card>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <Database size={16} style={{ color: "var(--cyan)" }} />
          <SectionTitle style={{ margin: 0 }}>Copia de seguridad y datos</SectionTitle>
        </div>

        <div className="two" style={{ gap: 8 }}>
          <div className="mini">
            <span>Sesiones guardadas</span>
            <strong className="tabular">{logs.length}</strong>
          </div>
          <div className="mini">
            <span>Rutinas activas</span>
            <strong className="tabular">{routines.length}</strong>
          </div>
          <div className="mini">
            <span>Objetivos fijados</span>
            <strong className="tabular">{goals.length}</strong>
          </div>
          <div className="mini">
            <span>Ejercicios catálogo</span>
            <strong className="tabular">{exercises.length}</strong>
          </div>
        </div>

        <div className="two" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="secondary full"
            onClick={onExport}
            style={{ padding: 12 }}
          >
            <Download size={15} />
            <span>Exportar JSON (v3)</span>
          </button>
          <label className="secondary full fileBtn" style={{ padding: 12 }}>
            <Upload size={15} />
            <span>Importar JSON</span>
            <input type="file" accept=".json,application/json" onChange={onImport} />
          </label>
        </div>

        <div className="warning" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 6, marginBottom: 2 }}>
            <ShieldCheck size={14} style={{ color: "var(--cyan)" }} />
            <strong style={{ color: "var(--text)", fontSize: 12 }}>Privacidad 100% local</strong>
          </div>
          Tus datos se guardan exclusivamente en el almacenamiento local de tu navegador. Exporta
          copias periódicas para conservarlas permanentemente.
        </div>
      </Card>

      {/* Modal for Creating or Editing Exercise */}
      {(isCreatingEx || editingEx) && (
        <ExerciseModal
          exercise={editingEx}
          onSave={onSaveExercise}
          onClose={() => {
            setIsCreatingEx(false);
            setEditingEx(null);
          }}
        />
      )}

      {/* Modal for Creating or Editing Routine */}
      {(isCreatingRoutine || editingRoutine) && (
        <RoutineModal
          routine={editingRoutine}
          exercises={exercises}
          onSave={onSaveRoutine}
          onClose={() => {
            setIsCreatingRoutine(false);
            setEditingRoutine(null);
          }}
        />
      )}
    </div>
  );
}
