import { useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Chart, ChartTip, SubHeader } from "../components/ui";
import { C } from "../lib/constants";
import { fmtDate, fmtShort } from "../lib/utils";

export default function Weight({ weights, onAddWeight, onBack }) {
  const [value, setValue] = useState("");
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));

  function handleAdd() {
    const v = Number(value);
    if (v > 0) {
      onAddWeight(v);
      setValue("");
    }
  }

  return (
    <div>
      <SubHeader title="PESO CORPORAL" onBack={onBack} />

      <div className="stack">
        <Card>
          <div className="big">
            {weights[0]?.weight || "—"} <small>kg</small>
          </div>
          <div className="muted">Último registro</div>

          <div className="inline top">
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder="Nuevo peso"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className="primary compact" onClick={handleAdd}>
              REGISTRAR
            </button>
          </div>
        </Card>

        {sorted.length > 1 && (
          <Card>
            <Chart height={210}>
              <LineChart data={sorted.map((w) => ({ ...w, label: fmtShort(w.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<ChartTip suffix=" kg" />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={C.yellow}
                  strokeWidth={2}
                  dot={{ fill: C.yellow, r: 3 }}
                />
              </LineChart>
            </Chart>
          </Card>
        )}

        {weights.slice(0, 8).map((w) => (
          <Card key={w.id}>
            <div className="row between">
              <span>{fmtDate(w.date)}</span>
              <strong>{w.weight} kg</strong>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
