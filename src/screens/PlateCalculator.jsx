import { useMemo, useState } from "react";
import { Card, Field, SubHeader } from "../components/ui";
import { DEFAULT_BAR_WEIGHT } from "../lib/constants";
import { calculatePlates } from "../lib/utils";

const PLATE_COLORS = {
  25: "#C1502E",
  20: "#E3B23C",
  15: "#7FA66B",
  10: "#5B8FBF",
  5: "#F2EFE9",
  2.5: "#9AA0AA",
  1.25: "#57575F",
};

export default function PlateCalculator({ onBack }) {
  const [target, setTarget] = useState("");
  const [bar, setBar] = useState(String(DEFAULT_BAR_WEIGHT));

  const result = useMemo(() => {
    const t = Number(target);
    const b = Number(bar) || 0;
    if (!t || t <= b) return null;
    return calculatePlates(t, b);
  }, [target, bar]);

  return (
    <div>
      <SubHeader title="CALCULADORA DE DISCOS" onBack={onBack} />

      <div className="stack">
        <Card>
          <div className="two">
            <Field label="Peso objetivo (kg)">
              <input
                type="number"
                inputMode="decimal"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="100"
              />
            </Field>
            <Field label="Peso de la barra (kg)">
              <input
                type="number"
                inputMode="decimal"
                value={bar}
                onChange={(e) => setBar(e.target.value)}
                placeholder="20"
              />
            </Field>
          </div>
        </Card>

        {target && !result && (
          <div className="warning">
            El peso objetivo debe ser mayor al peso de la barra.
          </div>
        )}

        {result && (
          <Card>
            <div className="muted" style={{ marginBottom: 10 }}>
              Discos por lado ({result.perSide} kg de cada lado)
            </div>

            {result.breakdown.length ? (
              <div className="plateStack">
                {result.breakdown.map(({ plate, count }) => (
                  <div className="plateRow" key={plate}>
                    <span
                      className="plateSwatch"
                      style={{ background: PLATE_COLORS[plate] || "#9AA0AA" }}
                    />
                    <span>{plate} kg</span>
                    <strong>× {count}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted">Solo la barra, sin discos.</div>
            )}

            <div className="row between" style={{ marginTop: 14 }}>
              <span className="muted">Peso total cargado</span>
              <strong>{result.achieved} kg</strong>
            </div>

            {result.remainder > 0 && (
              <div className="smallText" style={{ marginTop: 6 }}>
                No se puede alcanzar el objetivo exacto con discos de 1.25 kg o más — faltan{" "}
                {result.remainder} kg por lado.
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
