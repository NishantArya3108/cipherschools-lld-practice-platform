import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAttempt, retryEvaluation } from "../api";
import type { Attempt, Evaluation, Problem } from "../types";

type FeedbackData = { attempt: Attempt; problem: Problem; evaluation: Evaluation | null };

export default function Feedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      if (!id) { setError("Attempt id is missing."); setLoading(false); return; }
      try {
        const result = await getAttempt(id);
        if (cancelled) return;
        setData(result);
        if (["DRAFT","SUBMITTED","EVALUATING"].includes(result.attempt.status)) {
          timer = window.setTimeout(load, 1500);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load evaluation.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, [id]);

  if (loading && !data) return <div className="center-state"><Loader2 className="spin" /> Loading evaluation...</div>;
  if (error && !data) return <div className="container page narrow"><div className="error-state"><h1>Could not load evaluation</h1><p>{error}</p><button className="button secondary" onClick={() => navigate("/history")}>Back to history</button></div></div>;
  if (!data) return null;

  const { attempt, problem, evaluation } = data;

  if (["SUBMITTED","EVALUATING"].includes(attempt.status)) {
    return <div className="container page narrow"><div className="evaluation-wait"><div className="loader-ring"><Loader2 className="spin" /></div><span className="eyebrow">EVALUATION IN PROGRESS</span><h1>Reviewing your design...</h1><p>Your submission is safely stored. Feedback will appear automatically.</p><div className="status-track"><span className="done">Submitted</span><span className="active">Evaluating</span><span>Feedback</span></div></div></div>;
  }

  if (attempt.status === "FAILED") {
    return <div className="container page narrow"><div className="error-state"><AlertTriangle /><h1>Evaluation failed</h1><p>{evaluation?.errorMessage || "Your design was saved, but evaluation failed."}</p><div className="actions"><button className="button primary" disabled={retrying} onClick={async () => { try { setRetrying(true); await retryEvaluation(attempt.id); window.location.reload(); } catch (err) { setError(err instanceof Error ? err.message : "Retry failed."); setRetrying(false); } }}>{retrying ? "Retrying..." : "Retry evaluation"}</button><Link className="button secondary" to={\`/practice/\${attempt.id}\`}>Return to attempt</Link></div>{error && <div className="notice">{error}</div>}</div></div>;
  }

  const result = evaluation?.result;
  if (!result) return <div className="container page narrow"><div className="error-state"><h1>No feedback available</h1><p>The attempt is saved, but no evaluation result is available.</p><Link className="button secondary" to={\`/practice/\${attempt.id}\`}>Return to attempt</Link></div></div>;

  return <div className="container page narrow">
    <div className="feedback-header"><div><span className="eyebrow">EVALUATION COMPLETE</span><h1>{problem.title}</h1></div><span className="success-pill"><CheckCircle2 size={16}/> Completed</span></div>
    <section className="summary-card"><h2>Review summary</h2><p>{result.summary}</p></section>
    <section className="panel"><h2>What is working</h2><ul className="feedback-list">{result.strengths.map((item) => <li key={item}><CheckCircle2 size={17}/> {item}</li>)}</ul></section>
    <section className="criteria-list"><h2>Design review</h2>{result.criteria.map((criterion) => <article className="criterion-card" key={criterion.name}><div className="criterion-top"><div><h3>{criterion.name}</h3><span className={\`status \${criterion.status.toLowerCase()}\`}>{criterion.status.replace("_"," ")}</span></div><span className="confidence">{criterion.confidence} confidence</span></div><div className="feedback-block"><strong>Evidence</strong><p>{criterion.evidence}</p></div>{criterion.concern && <div className="feedback-block warning"><strong>Concern</strong><p>{criterion.concern}</p></div>}<div className="feedback-block suggestion"><strong>Suggestion</strong><p>{criterion.suggestion}</p></div></article>)}</section>
    <section className="next-focus"><span className="eyebrow">NEXT ATTEMPT FOCUS</span><h2>Turn feedback into your next design.</h2><ol>{result.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol><Link className="button primary" to={\`/practice/\${attempt.id}\`}>Improve this design <ArrowRight size={17}/></Link></section>
    <Link className="button secondary" to="/history"><RefreshCw size={16}/> View attempt history</Link>
  </div>;
}
