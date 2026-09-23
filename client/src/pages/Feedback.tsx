import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getAttempt } from "../api";

export default function Feedback() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: number | undefined;

    async function load() {
      if (!id) return;
      try {
        const result = await getAttempt(id);
        setData(result);
        if (["DRAFT", "SUBMITTED", "EVALUATING"].includes(result.attempt.status)) {
          timer = window.setTimeout(load, 1500);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [id]);

  if (loading || !data) {
    return <div className="center-state"><Loader2 className="spin" /> Loading evaluation...</div>;
  }

  const { attempt, problem, evaluation } = data;

  if (["SUBMITTED", "EVALUATING"].includes(attempt.status)) {
    return (
      <div className="container page narrow">
        <div className="evaluation-wait">
          <div className="loader-ring"><Loader2 className="spin" /></div>
          <span className="eyebrow">EVALUATION IN PROGRESS</span>
          <h1>Reviewing your design...</h1>
          <p>Your submission is safely stored. Feedback will appear automatically.</p>
          <div className="status-track">
            <span className="done">Submitted</span>
            <span className="active">Evaluating</span>
            <span>Feedback</span>
          </div>
        </div>
      </div>
    );
  }

  if (attempt.status === "FAILED") {
    return (
      <div className="container page narrow">
        <div className="error-state">
          <AlertTriangle />
          <h1>Evaluation failed</h1>
          <p>Your design was saved. You can retry the evaluation without losing it.</p>
          <Link className="button primary" to={`/practice/${attempt.id}`}>Return to attempt</Link>
        </div>
      </div>
    );
  }

  const result = evaluation?.result;

  return (
    <div className="container page narrow">
      <div className="feedback-header">
        <div>
          <span className="eyebrow">EVALUATION COMPLETE</span>
          <h1>{problem.title}</h1>
        </div>
        <span className="success-pill"><CheckCircle2 size={16} /> Completed</span>
      </div>

      <section className="summary-card">
        <h2>Review summary</h2>
        <p>{result?.summary}</p>
      </section>

      <section className="panel">
        <h2>What is working</h2>
        <ul className="feedback-list">
          {result?.strengths.map((item: string) => <li key={item}><CheckCircle2 size={17} /> {item}</li>)}
        </ul>
      </section>

      <section className="criteria-list">
        <h2>Design review</h2>
        {result?.criteria.map((criterion: any) => (
          <article className="criterion-card" key={criterion.name}>
            <div className="criterion-top">
              <div>
                <h3>{criterion.name}</h3>
                <span className={`status ${criterion.status.toLowerCase()}`}>{criterion.status.replace("_", " ")}</span>
              </div>
              <span className="confidence">{criterion.confidence} confidence</span>
            </div>

            <div className="feedback-block">
              <strong>Evidence</strong>
              <p>{criterion.evidence}</p>
            </div>

            {criterion.concern && (
              <div className="feedback-block warning">
                <strong>Concern</strong>
                <p>{criterion.concern}</p>
              </div>
            )}

            <div className="feedback-block suggestion">
              <strong>Suggestion</strong>
              <p>{criterion.suggestion}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="next-focus">
        <span className="eyebrow">NEXT ATTEMPT FOCUS</span>
        <h2>Turn feedback into your next design.</h2>
        <ol>
          {result?.nextSteps.map((step: string) => <li key={step}>{step}</li>)}
        </ol>
        <Link className="button primary" to={`/practice/${attempt.id}`}>
          Improve this design <ArrowRight size={17} />
        </Link>
      </section>

      <Link className="button secondary" to="/history">
        <RefreshCw size={16} /> View attempt history
      </Link>
    </div>
  );
}
