import { useEffect, useState } from "react";
import { ArrowRight, History as HistoryIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getAttempts } from "../api";
import type { Attempt } from "../types";

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAttempts().then(setAttempts).catch((err) => setError(err instanceof Error ? err.message : "Could not load history.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-state"><Loader2 className="spin" /> Loading history...</div>;
  if (error) return <div className="container page narrow"><div className="error-state"><h1>Could not load history</h1><p>{error}</p><Link className="button secondary" to="/problems">Back to problems</Link></div></div>;

  return (
    <div className="container page">
      <div className="page-heading"><div><div className="eyebrow">YOUR WORK</div><h1>Attempt history</h1><p>Review what changed between attempts.</p></div></div>
      {attempts.length === 0 ? (
        <div className="empty-state"><HistoryIcon /><h2>No attempts yet</h2><p>Choose a problem and start your first design.</p><Link className="button primary" to="/problems">Browse problems</Link></div>
      ) : (
        <div className="history-list">{attempts.map((attempt) => (
          <article className="history-card" key={attempt.id}>
            <div><span className="muted">{new Date(attempt.updatedAt).toLocaleString()}</span><h2>{attempt.problemTitle}</h2><span className={`status ${attempt.status.toLowerCase()}`}>{attempt.status}</span></div>
            <Link className="button secondary" to={attempt.status === "COMPLETED" ? `/feedback/${attempt.id}` : `/practice/${attempt.id}`}>Open <ArrowRight size={16} /></Link>
          </article>
        ))}</div>
      )}
    </div>
  );
}
