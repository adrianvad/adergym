import { Dumbbell, Flame, Moon, Sun } from "lucide-react";

export default function Header({ sessionCount, theme, onToggleTheme }) {
  const isLight = theme === "light";

  return (
    <header>
      <div>
        <div className="row" style={{ gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 2px 10px rgba(6, 182, 212, 0.4)",
            }}
          >
            <Dumbbell size={16} strokeWidth={2.5} />
          </div>
          <span className="brandWordmark">IRON LOG</span>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="themeToggleBtn"
            onClick={onToggleTheme}
            aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            title={isLight ? "Modo oscuro" : "Modo claro"}
          >
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <span className="sessionsBadge tabular">
            <Flame size={13} style={{ color: "var(--cyan)" }} />
            <span>{sessionCount} {sessionCount === 1 ? "sesión" : "sesiones"}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
