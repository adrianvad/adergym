import { CheckCircle2, Trophy } from "lucide-react";

export default function Toast({ message }) {
  if (!message) return null;
  const isPR = message.includes("PR") || message.includes("🏆");
  return (
    <div className="toast" role="status" aria-live="polite">
      {isPR ? (
        <Trophy size={16} style={{ color: "var(--accent)" }} />
      ) : (
        <CheckCircle2 size={16} style={{ color: "var(--green)" }} />
      )}
      <span>{message.replace("🏆 ", "")}</span>
    </div>
  );
}
