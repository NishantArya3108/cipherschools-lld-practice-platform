import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createAttempt, getProblem } from "../api";
import type { Problem } from "../types";

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (id) getProblem(id).then(setProblem).finally(() => setLoading(false));
  }, [id]);

  async function start() {
    if (!id) return;
    setStarting(true);
    try {
      const attempt = await createAttempt(id);
      navigate(`/practice/${attempt.id}`);
    } finally {
      setStarting(false);
    }
  }

  if (loading || !problem) {
    return <div className="center-state"><Loader2 className="spin" /> Loading...</div>;
  }

  return (
    <div className="container page narrow">
      <Link to="/problems" className="back-link">← All problems</Link>

      <div className="detail-header">
        <span className="badge">{problem.difficulty}</span>
        <h1>{problem.title}</h1>
        <p>{problem.description}</p>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2>Requirements</h2>
          <ul className="check-list">
            {problem.requirements.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="panel">
          <h2>Constraints</h2>
          <ul className="bullet-list">
            {problem.constraints.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="panel">
        <h2>Concepts to think about</h2>
        <div className="chips">
          {problem.concepts.map((concept) => <span className="chip" key={concept}>{concept}</span>)}
        </div>
      </section>

      <button className="button primary large" onClick={start} disabled={starting}>
        {starting ? "Starting..." : "Start attempt"} <ArrowRight size={17} />
      </button>
    </div>
  );
}
