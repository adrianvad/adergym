import { Activity, CalendarDays, Dumbbell, Settings2, TrendingUp } from "lucide-react";

const NAV = [
  ["summary", "Resumen", Activity],
  ["register", "Registrar", Dumbbell],
  ["history", "Historial", CalendarDays],
  ["progress", "Progreso", TrendingUp],
  ["more", "Más", Settings2],
];

export default function BottomNav({ tab, sub, onSelect }) {
  return (
    <nav>
      {NAV.map(([id, label, Icon]) => (
        <button
          key={id}
          className={tab === id && !sub ? "nav active" : "nav"}
          onClick={() => onSelect(id)}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
