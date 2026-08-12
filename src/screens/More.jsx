import { CalendarDays, Circle, Download, Scale, Target, Trophy } from "lucide-react";
import { MenuButton } from "../components/ui";

export default function More({ onGoToSub }) {
  return (
    <div className="stack">
      <MenuButton
        icon={<Target />}
        title="Objetivos"
        text="Metas de peso y repeticiones"
        onClick={() => onGoToSub("goals")}
      />
      <MenuButton
        icon={<CalendarDays />}
        title="Calendario"
        text="Rachas y días entrenados"
        onClick={() => onGoToSub("calendar")}
      />
      <MenuButton
        icon={<Trophy />}
        title="Récords reales"
        text="Peso máximo, reps máximas y 1RM"
        onClick={() => onGoToSub("records")}
      />
      <MenuButton
        icon={<Scale />}
        title="Peso corporal"
        text="Evolución y registros"
        onClick={() => onGoToSub("weight")}
      />
      <MenuButton
        icon={<Circle />}
        title="Calculadora de discos"
        text="Cuánto cargar por lado según el peso objetivo"
        onClick={() => onGoToSub("plates")}
      />
      <MenuButton
        icon={<Download />}
        title="Datos"
        text="Exportar o importar una copia"
        onClick={() => onGoToSub("data")}
      />
    </div>
  );
}
