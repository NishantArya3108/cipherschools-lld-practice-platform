import { useEffect, useState } from "react";
import { Plus, Save, Send, Trash2, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttempt, saveDraft, submitAttempt } from "../api";
import type { Attempt, ClassDefinition, Problem, Relationship } from "../types";

const emptyClass = (): ClassDefinition => ({
  name: "",
  responsibilities: [""],
  methods: [""]
});

export default function Practice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [requirementsUnderstanding, setRequirementsUnderstanding] = useState("");
  const [classes, setClasses] = useState<ClassDefinition[]>([emptyClass()]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!id) return;
    getAttempt(id).then((data) => {
      setAttempt(data.attempt);
      setProblem(data.problem);
      setRequirementsUnderstanding(data.attempt.requirementsUnderstanding);
      setClasses(data.attempt.classes.length ? data.attempt.classes : [emptyClass()]);
      setRelationships(data.attempt.relationships);
      setExplanation(data.attempt.explanation);
    }).finally(() => setLoading(false));
  }, [id]);

  async function persist() {
    if (!id) return;
    setSaving(true);
    setMessage("");
    try {
      const updated = await saveDraft(id, {
        requirementsUnderstanding,
        classes: classes.filter((c) => c.name.trim()),
        relationships,
        explanation
      });
      setAttempt(updated);
      setMessage("Draft saved.");
    } catch {
      setMessage("Could not save draft.");
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    if (!id) return;
    setSubmitting(true);
    try {
      await persist();
      await submitAttempt(id);
      navigate(`/feedback/${id}`);
    } catch {
      setMessage("Submission failed. Please fix the form and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateClass(index: number, patch: Partial<ClassDefinition>) {
    setClasses((current) =>
      current.map((item, i) => i === index ? { ...item, ...patch } : item)
    );
  }

  function updateList(
    index: number,
    field: "responsibilities" | "methods",
    value: string
  ) {
    updateClass(index, { [field]: value.split("\n")} as Partial<ClassDefinition>);
  }

  function addClass() {
    setClasses((current) => [...current, emptyClass()]);
  }

  function removeClass(index: number) {
    setClasses((current) => current.filter((_, i) => i !== index));
  }

  function addRelationship() {
    setRelationships((current) => [...current, { from: "", type: "uses", to: "" }]);
  }

  if (loading || !attempt || !problem) {
    return <div className="center-state"><Loader2 className="spin" /> Loading workspace...</div>;
  }

  return (
    <div className="practice-layout">
      <aside className="problem-sidebar">
        <span className="eyebrow">PRACTICE</span>
        <h2>{problem.title}</h2>
        <span className="badge">{problem.difficulty}</span>

        <h3>Requirements</h3>
        <ul className="compact-list">
          {problem.requirements.map((r) => <li key={r}>{r}</li>)}
        </ul>

        <h3>Constraints</h3>
        <ul className="compact-list">
          {(problem.constraints ?? []).map((r) => (
  <li key={r}>{r}</li>
))}
        </ul>
      </aside>

      <section className="workspace">
        <div className="workspace-header">
          <div>
            <span className="muted">Attempt {attempt.id.slice(0, 8)}</span>
            <h1>Design your solution</h1>
          </div>
          <div className="actions">
            <button className="button secondary" onClick={persist} disabled={saving || submitting}>
              <Save size={16} /> {saving ? "Saving..." : "Save draft"}
            </button>
            <button className="button primary" onClick={submit} disabled={submitting || saving}>
              <Send size={16} /> {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        {message && <div className="notice">{message}</div>}

        <section className="editor-panel">
          <label>1. Requirements understanding</label>
          <p className="field-help">In your own words, explain what the system must do.</p>
          <textarea
            value={requirementsUnderstanding}
            onChange={(e) => setRequirementsUnderstanding(e.target.value)}
            placeholder="Example: The system needs to manage vehicles, spots, tickets and pricing while allowing pricing rules to change independently."
          />
        </section>

        <section className="editor-panel">
          <div className="section-title-row">
            <div>
              <label>2. Classes & responsibilities</label>
              <p className="field-help">Define the objects and what each one owns.</p>
            </div>
            <button className="small-button" onClick={addClass}><Plus size={15} /> Add class</button>
          </div>

          <div className="class-list">
            {classes.map((item, index) => (
              <div className="class-editor" key={index}>
                <div className="class-editor-header">
                  <strong>Class {index + 1}</strong>
                  {classes.length > 1 && (
                    <button className="icon-button danger" onClick={() => removeClass(index)}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <input
                  value={item.name}
                  onChange={(e) => updateClass(index, { name: e.target.value })}
                  placeholder="Class name, e.g. ParkingLot"
                />

                <div className="two-col">
                  <textarea
                    value={item.responsibilities.join("\n")}
                    onChange={(e) => updateList(index, "responsibilities", e.target.value)}
                    placeholder={"Responsibilities\nOne per line"}
                  />
                  <textarea
                    value={item.methods.join("\n")}
                    onChange={(e) => updateList(index, "methods", e.target.value)}
                    placeholder={"Methods\nOne per line"}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="editor-panel">
          <div className="section-title-row">
            <div>
              <label>3. Relationships</label>
              <p className="field-help">Show how your objects collaborate.</p>
            </div>
            <button className="small-button" onClick={addRelationship}><Plus size={15} /> Add relationship</button>
          </div>

          {relationships.length === 0 && (
            <div className="empty-box">No relationships yet. Add at least one if your design has object collaboration.</div>
          )}

          <div className="relationship-list">
            {relationships.map((r, index) => (
              <div className="relationship-row" key={index}>
                <input
                  value={r.from}
                  onChange={(e) => setRelationships((current) => current.map((x, i) => i === index ? {...x, from: e.target.value} : x))}
                  placeholder="From class"
                />
                <select
                  value={r.type}
                  onChange={(e) => setRelationships((current) => current.map((x, i) => i === index ? {...x, type: e.target.value} : x))}
                >
                  <option>uses</option>
                  <option>contains</option>
                  <option>composition</option>
                  <option>aggregation</option>
                  <option>inherits</option>
                  <option>implements</option>
                </select>
                <input
                  value={r.to}
                  onChange={(e) => setRelationships((current) => current.map((x, i) => i === index ? {...x, to: e.target.value} : x))}
                  placeholder="To class"
                />
                <button className="icon-button danger" onClick={() => setRelationships((current) => current.filter((_, i) => i !== index))}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="editor-panel">
          <label>4. Design explanation</label>
          <p className="field-help">Explain important trade-offs. Why did you separate these responsibilities?</p>
          <textarea
            className="large-textarea"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Example: Pricing is represented separately because pricing rules may change without changing parking allocation."
          />
        </section>
      </section>
    </div>
  );
}
