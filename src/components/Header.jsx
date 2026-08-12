import { Flame } from "lucide-react";

export default function Header({ sessionCount }) {
  return (
    <header>
      <div>
        <h1 className="display">IRON LOG</h1>
        <span className="sessions">
          <Flame size={14} /> {sessionCount} SESIONES
        </span>
      </div>
    </header>
  );
}
