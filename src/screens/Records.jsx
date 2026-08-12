import { Card, Empty, MiniStat, SubHeader } from "../components/ui";

export default function Records({ records, exercises, onBack }) {
  const entries = Object.entries(records).sort((a, b) => b[1].est1RM - a[1].est1RM);

  return (
    <div>
      <SubHeader title="RÉCORDS" onBack={onBack} />

      <div className="stack small">
        {entries.map(([id, r]) => (
          <Card key={id}>
            <div className="row between">
              <div>
                <strong>{exercises.find((e) => e.id === id)?.name || "Ejercicio"}</strong>
                <div className="muted">
                  Peso máx: {r.maxWeight} kg · Reps máx: {r.maxReps}
                </div>
              </div>
              <div className="recordBig">
                {Math.round(r.est1RM)}
                <small> kg 1RM</small>
              </div>
            </div>

            <div className="recordGrid">
              <MiniStat label="Mayor peso" value={`${r.maxWeight} kg`} />
              <MiniStat label="Más reps" value={r.maxReps} />
              <MiniStat label="1RM est." value={`${Math.round(r.est1RM)} kg`} />
            </div>
          </Card>
        ))}

        {!entries.length && (
          <Empty title="Aún no hay récords" text="Registra series para empezar a construirlos." />
        )}
      </div>
    </div>
  );
}
