import { Dumbbell, Flame, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Chart, ChartTip, Empty, MiniStat, SectionTitle, Stat } from "../components/ui";
import { C } from "../lib/constants";

export default function Summary({
  logs,
  streak,
  thisWeek,
  weeklyVolume,
  volDelta,
  totalVolume,
  totalSets,
  latestWeight,
  recentPRs,
  exercises,
  onGoToRegister,
}) {
  if (!logs.length) {
    return (
      <div className="stack">
        <Empty
          title="Tu progreso empieza aquí"
          text="Registra tu primer entrenamiento y IRON LOG empezará a construir tus estadísticas."
          action={onGoToRegister}
        />
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="statGrid">
        <Stat icon={<Flame />} value={streak} label="Semanas seguidas" />
        <Stat icon={<Dumbbell />} value={logs.length} label="Sesiones" />
        <Stat icon={<TrendingUp />} value={thisWeek.toLocaleString("es-PE")} label="Kg esta semana" />
      </div>

      {volDelta !== null && (
        <div className={volDelta >= 0 ? "delta up" : "delta down"}>
          {volDelta >= 0 ? "+" : ""}
          {volDelta}% vs. semana pasada
        </div>
      )}

      <SectionTitle>Volumen — últimas 8 semanas</SectionTitle>

      <Card>
        <Chart height={175}>
          <BarChart data={weeklyVolume}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} width={38} />
            <Tooltip content={<ChartTip suffix=" kg" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="volume" fill={C.rust} radius={[5, 5, 5, 5]} />
          </BarChart>
        </Chart>
      </Card>

      <div className="statGrid three">
        <MiniStat label="Volumen total" value={`${Math.round(totalVolume).toLocaleString("es-PE")} kg`} />
        <MiniStat label="Series totales" value={totalSets} />
        <MiniStat label="Peso actual" value={latestWeight ? `${latestWeight} kg` : "—"} />
      </div>

      {recentPRs.length > 0 && (
        <>
          <SectionTitle>Mejores marcas</SectionTitle>
          <div className="stack small">
            {recentPRs.slice(0, 3).map((r) => (
              <Card key={r.exerciseId}>
                <div className="row between">
                  <div className="row">
                    <div>
                      <strong>{exercises.find((e) => e.id === r.exerciseId)?.name}</strong>
                      <div className="muted">
                        {r.estWeight} kg × {r.estReps}
                      </div>
                    </div>
                  </div>
                  <div className="recordBig">
                    {Math.round(r.est1RM)}
                    <small> kg</small>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
