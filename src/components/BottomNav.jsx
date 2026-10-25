import { CalendarDays, Dumbbell, Layers, TrendingUp } from "lucide-react";

const NAV = [
  ["workout", "Entrenar", Dumbbell],
  ["activity", "Actividad", CalendarDays],
  ["progress", "Progreso", TrendingUp],
  ["catalog", "Catálogo", Layers],
];

export default function BottomNav({ tab, onSelect }) {
  return (
    <nav role="navigation" aria-label="Navegación principal">
      {NAV.map(([id, label, Icon]) => {
        const isActive = tab === id;
        return (
          <button
            key={id}
            className={isActive ? "nav active" : "nav"}
            onClick={() => onSelect(id)}
            aria-selected={isActive}
            aria-label={label}
          >
            <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
