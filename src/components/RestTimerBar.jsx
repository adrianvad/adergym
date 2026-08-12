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
            d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
          />
          <path
            className="restProgress"
            strokeDasharray={`${pct}, 100`}
            d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
          />
        </svg>
        <span>{fmt(timer.remaining)}</span>
      </div>

      <div className="restLabel">
        <strong>Descanso</strong>
        <small>{timer.running ? "en curso…" : "en pausa"}</small>
      </div>

      <div className="restActions">
        <button className="iconBtn" onClick={onToggle}>
          {timer.running ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button className="iconBtn" onClick={onReset}>
          <RotateCcw size={16} />
        </button>
        <button className="iconBtn" onClick={onDismiss}>
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
