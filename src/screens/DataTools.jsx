import { Download, Upload } from "lucide-react";
import { Card, SubHeader } from "../components/ui";

export default function DataTools({ onExport, onImport, onBack }) {
  return (
    <div>
      <SubHeader title="DATOS" onBack={onBack} />

      <div className="stack">
        <Card>
          <div className="menuIcon">
            <Download />
          </div>
          <strong>Exportar copia</strong>
          <p className="muted">
            Guarda ejercicios, entrenamientos, objetivos y peso en un archivo JSON.
          </p>
          <button className="secondary full" onClick={onExport}>
            EXPORTAR DATOS
          </button>
        </Card>

        <Card>
          <div className="menuIcon">
            <Upload />
          </div>
          <strong>Importar copia</strong>
          <p className="muted">Restaura una copia anterior de IRON LOG en este dispositivo.</p>
          <label className="secondary full fileBtn">
            IMPORTAR DATOS
            <input type="file" accept=".json,application/json" onChange={onImport} />
          </label>
        </Card>

        <div className="warning">
          Tus datos se guardan localmente en este navegador. Exporta una copia de vez en cuando
          para no perderlos si borras los datos del navegador.
        </div>
      </div>
    </div>
  );
}
