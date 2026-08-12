import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, SubHeader } from "../components/ui";
import { isoToday } from "../lib/utils";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function CalendarView({ logs, streak, onBack }) {
  const [month, setMonth] = useState(new Date(isoToday() + "T00:00:00"));

  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const start = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  const active = new Set(logs.map((l) => l.date));
  const monthPrefix = `${y}-${String(m + 1).padStart(2, "0")}-`;
  const trainedThisMonth = [...active].filter((d) => d.startsWith(monthPrefix)).length;

  return (
    <div>
      <SubHeader title="CALENDARIO" onBack={onBack} />

      <div className="calendarTop">
        <button className="iconBtn" onClick={() => setMonth(new Date(y, m - 1, 1))}>
          <ChevronLeft />
        </button>
        <strong>{month.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}</strong>
        <button className="iconBtn" onClick={() => setMonth(new Date(y, m + 1, 1))}>
          <ChevronRight />
        </button>
      </div>

      <div className="weekdays">
        {WEEKDAYS.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>

      <div className="calendar">
        {cells.map((d, i) => (
          <div key={i} className={d ? (active.has(d) ? "day trained" : "day") : "day empty"}>
            {d && (
              <>
                <span>{Number(d.slice(-2))}</span>
                {active.has(d) && <i />}
              </>
            )}
          </div>
        ))}
      </div>

      <Card>
        <div className="row between">
          <span className="muted">Días entrenados</span>
          <strong>{trainedThisMonth}</strong>
        </div>
        <div className="row between">
          <span className="muted">Racha actual</span>
          <strong>{streak} semanas</strong>
        </div>
      </Card>
    </div>
  );
}
