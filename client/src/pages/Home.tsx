import { ArrowRight, BrainCircuit, History, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container">
      <section className="hero">
        <div className="eyebrow">LOW-LEVEL DESIGN PRACTICE</div>
        <h1>Practice design.<br /><span>Understand why.</span></h1>
        <p>
          Design classes, relationships and responsibilities for real LLD
          problems. Submit your reasoning and receive structured feedback you
          can use on the next attempt.
        </p>
        <div className="hero-actions">
          <Link className="button primary" to="/problems">
            Start practicing <ArrowRight size={17} />
          </Link>
          <Link className="button secondary" to="/history">
            View history
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <BrainCircuit />
          <h3>Design, not guess</h3>
          <p>Capture requirements, classes, responsibilities and relationships.</p>
        </article>
        <article className="feature-card">
          <ShieldCheck />
          <h3>Explainable feedback</h3>
          <p>Separate deterministic checks from judgment-heavy design feedback.</p>
        </article>
        <article className="feature-card">
          <History />
          <h3>Improve over attempts</h3>
          <p>Review previous work and carry concrete next steps into the next attempt.</p>
        </article>
      </section>
    </div>
  );
}
