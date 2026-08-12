import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Chart, ChartTip, Empty, ProgressBar, SectionTitle } from "../components/ui";
import { C } from "../lib/constants";
import { epley } from "../lib/utils";

function GoalRow({ goal, exercises, records }) {
  const r = records[goal.exerciseId];
  const current = r?.est1RM || 0;
  const target = epley(goal.targetWeight, goal.targetReps);
  const pct = Math.min(100, Math.round((current / target) * 100) || 0);

  return (
    <Card>
      <div className="row between">
        <div>
          <strong>{exercises.find((e) => e.id === goal.exerciseId)?.name || "Ejercicio"}</strong>
          <div className="muted">
            {goal.targetWeight} kg × {goal.targetReps} · objetivo 1RM {Math.round(target)} kg
          </div>
        </div>
      </div>
      <ProgressBar pct={pct} />
      <div className="row between smallText">
        <span>{Math.round(current)} kg actual</span>
        <span>{pct}%</span>
      </div>
    </Card>
  );
}

export default function ProgressTab({ weeklyVolume, goals, records, exercises, weights, onGoToSub }) {
  return (
    <div className="stack">
      <SectionTitle>Volumen semanal</SectionTitle>

      <Card>
        <Chart height={190}>
          <LineChart data={weeklyVolume}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} width={38} />
            <Tooltip content={<ChartTip suffix=" kg" />} />
            <Line
              type="monotone"
              dataKey="volume"
              stroke={C.yellow}
              strokeWidth={2}
              dot={{ fill: C.yellow, r: 3 }}
            />
          </LineChart>
        </Chart>
      </Card>

      <SectionTitle>Objetivos</SectionTitle>

      {goals.length ? (
        goals.slice(0, 4).map((g) => (
          <GoalRow key={g.id} goal={g} exercises={exercises} records={records} />
        ))
      ) : (
        <Empty
          title="Sin objetivos"
          text="Define una marca concreta y úsala como referencia."
          action={() => onGoToSub("goals")}
        />
      )}

      <SectionTitle>Peso corporal</SectionTitle>

      <Card>
        <div className="row between">
          <div>
            <div className="big">
              {weights[0]?.weight || "—"} <small>kg</small>
            </div>
            <div className="muted">Último registro</div>
          </div>
          <button className="secondary" onClick={() => onGoToSub("weight")}>
            Ver evolución
          </button>
        </div>
      </Card>
    </div>
  );
}
