import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getProblems } from "../api";
import type { Problem } from "../types";

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProblems().then(setProblems).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="center-state"><Loader2 className="spin" /> Loading problems...</div>;
  }

  return (
    <div className="container page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PROBLEM LIBRARY</div>
          <h1>Choose a design challenge</h1>
          <p>Start small. Build a design you can explain.</p>
        </div>
      </div>

      <div className="problem-grid">
        {problems.map((problem) => (
          <article className="problem-card" key={problem.id}>
            <div className="problem-card-top">
              <span className="badge">{problem.difficulty}</span>
              <span className="muted">{problem.concepts.slice(0, 2).join(" · ")}</span>
            </div>
            <h2>{problem.title}</h2>
            <p>{problem.description}</p>
            <Link className="text-link" to={`/problems/${problem.id}`}>
              View problem <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
