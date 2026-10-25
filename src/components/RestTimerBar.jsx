import { Pause, Play, RotateCcw, X } from "lucide-react";

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RestTimerBar({ timer, onToggle, onReset, onDismiss }) {
  if (!timer.duration) return null;

  const pct = Math.max(0, Math.min(100, (1 - timer.remaining / timer.duration) * 100));

  return (
    <div className="restBar">
      <div className="restRing">
        <svg viewBox="0 0 36 36">
          <path
            className="restTrack"
            d="M18 2.5 a15.5 15.5 0 0 1 0 31 a15.5 15.5 0 0 1 0 -31"
          />
          <path
            className="restProgress"
            strokeDasharray={`${pct}, 100`}
            d="M18 2.5 a15.5 15.5 0 0 1 0 31 a15.5 15.5 0 0 1 0 -31"
          />
        </svg>
        <span className="tabular">{fmt(timer.remaining)}</span>
      </div>

      <div className="restLabel">
        <strong>Temporizador</strong>
        <small>{timer.running ? "Descanso en curso" : "En pausa"}</small>
      </div>

      <div className="restActions">
        <button
          className={timer.running ? "iconBtn" : "iconBtn accent"}
          onClick={onToggle}
          aria-label={timer.running ? "Pausar" : "Reanudar"}
        >
          {timer.running ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="iconBtn" onClick={onReset} aria-label="Reiniciar">
          <RotateCcw size={15} />
        </button>
        <button className="iconBtn" onClick={onDismiss} aria-label="Cerrar">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
