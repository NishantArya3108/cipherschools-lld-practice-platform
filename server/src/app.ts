import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { db, now } from "./db.js";
import { AIEvaluator, RuleBasedEvaluator } from "./evaluator.js";
import type { SubmissionContent } from "./types.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const evaluator = new AIEvaluator(new RuleBasedEvaluator());

function parseProblem(row: any) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    difficulty: row.difficulty,
    description: row.description,
    requirements: JSON.parse(row.requirements),
    constraints: JSON.parse(row.constraints),
    concepts: JSON.parse(row.concepts),
    createdAt: row.created_at
  };
}

function parseAttempt(row: any) {
  if (!row) return null;

  return {
    id: row.id,
    problemId: row.problem_id,
    status: row.status,
    requirementsUnderstanding: row.requirements_understanding,
    classes: JSON.parse(row.classes_json),
    relationships: JSON.parse(row.relationships_json),
    explanation: row.explanation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at
  };
}

function getAttempt(id: string) {
  return db
    .prepare("SELECT * FROM attempts WHERE id = ?")
    .get(id) as any;
}

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "LLD Forge API is running" });
});

app.get("/api/problems", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM problems ORDER BY created_at DESC")
    .all();

  res.json({ success: true, data: rows.map(parseProblem) });
});

app.get("/api/problems/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM problems WHERE id = ?")
    .get(req.params.id);

  if (!row) {
    return res.status(404).json({
      success: false,
      message: "Problem not found"
    });
  }

  return res.json({ success: true, data: parseProblem(row) });
});

app.post("/api/attempts", (req, res) => {
  const { problemId } = req.body ?? {};

  if (!problemId) {
    return res.status(400).json({
      success: false,
      message: "problemId is required"
    });
  }

  const problem = db
    .prepare("SELECT id FROM problems WHERE id = ?")
    .get(problemId);

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: "Problem not found"
    });
  }

  const id = randomUUID();
  const timestamp = now();

  db.prepare(`
    INSERT INTO attempts
    (id, problem_id, status, requirements_understanding, classes_json,
     relationships_json, explanation, created_at, updated_at)
    VALUES (?, ?, 'DRAFT', '', '[]', '[]', '', ?, ?)
  `).run(id, problemId, timestamp, timestamp);

  return res.status(201).json({
    success: true,
    data: parseAttempt(getAttempt(id))
  });
});

app.get("/api/attempts", (_req, res) => {
  const rows = db
    .prepare(`
      SELECT a.*, p.title as problem_title
      FROM attempts a
      JOIN problems p ON p.id = a.problem_id
      ORDER BY a.updated_at DESC
    `)
    .all() as any[];

  return res.json({
    success: true,
    data: rows.map((row) => ({
      ...parseAttempt(row),
      problemTitle: row.problem_title
    }))
  });
});

app.get("/api/attempts/:id", (req, res) => {
  const row = getAttempt(req.params.id);

  if (!row) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found"
    });
  }

  const problem = db
    .prepare("SELECT * FROM problems WHERE id = ?")
    .get(row.problem_id);

  const evaluation = db
    .prepare("SELECT * FROM evaluations WHERE attempt_id = ?")
    .get(row.id) as any;

  return res.json({
    success: true,
    data: {
      attempt: parseAttempt(row),
      problem: parseProblem(problem),
      evaluation: evaluation
        ? {
            id: evaluation.id,
            status: evaluation.status,
            result: evaluation.result_json
              ? JSON.parse(evaluation.result_json)
              : null,
            errorMessage: evaluation.error_message
          }
        : null
    }
  });
});

app.put("/api/attempts/:id/draft", (req, res) => {
  const row = getAttempt(req.params.id);

  if (!row) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found"
    });
  }

  if (row.status !== "DRAFT") {
    return res.status(409).json({
      success: false,
      message: "Only draft attempts can be edited"
    });
  }

  const body = req.body as Partial<SubmissionContent>;

  const requirementsUnderstanding =
    typeof body.requirementsUnderstanding === "string"
      ? body.requirementsUnderstanding
      : row.requirements_understanding;

  const classes = Array.isArray(body.classes)
    ? body.classes
    : JSON.parse(row.classes_json);

  const relationships = Array.isArray(body.relationships)
    ? body.relationships
    : JSON.parse(row.relationships_json);

  const explanation =
    typeof body.explanation === "string"
      ? body.explanation
      : row.explanation;

  db.prepare(`
    UPDATE attempts
    SET requirements_understanding = ?,
        classes_json = ?,
        relationships_json = ?,
        explanation = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    requirementsUnderstanding,
    JSON.stringify(classes),
    JSON.stringify(relationships),
    explanation,
    now(),
    req.params.id
  );

  return res.json({
    success: true,
    data: parseAttempt(getAttempt(req.params.id))
  });
});

app.post("/api/attempts/:id/submit", (req, res) => {
  const row = getAttempt(req.params.id);

  if (!row) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found"
    });
  }

  if (row.status !== "DRAFT") {
    return res.status(409).json({
      success: false,
      message: `Attempt is already ${row.status}`
    });
  }

  const submission: SubmissionContent = {
    requirementsUnderstanding: row.requirements_understanding,
    classes: JSON.parse(row.classes_json),
    relationships: JSON.parse(row.relationships_json),
    explanation: row.explanation
  };

  const problemRow = db
    .prepare("SELECT * FROM problems WHERE id = ?")
    .get(row.problem_id) as any;

  const timestamp = now();

  db.prepare(`
    UPDATE attempts
    SET status = 'SUBMITTED', submitted_at = ?, updated_at = ?
    WHERE id = ?
  `).run(timestamp, timestamp, row.id);

  db.prepare(`
    INSERT OR REPLACE INTO evaluations
    (id, attempt_id, status, result_json, error_message, created_at, updated_at)
    VALUES (?, ?, 'EVALUATING', NULL, NULL, ?, ?)
  `).run(randomUUID(), row.id, timestamp, timestamp);

  // The submission has already been persisted. Evaluation failure cannot lose it.
  setImmediate(async () => {
    try {
      db.prepare(`
        UPDATE attempts SET status = 'EVALUATING', updated_at = ? WHERE id = ?
      `).run(now(), row.id);

      const result = await evaluator.evaluate(
        {
          title: problemRow.title,
          requirements: JSON.parse(problemRow.requirements),
          constraints: JSON.parse(problemRow.constraints),
          concepts: JSON.parse(problemRow.concepts)
        },
        submission
      );

      db.prepare(`
        UPDATE evaluations
        SET status = 'COMPLETED', result_json = ?, updated_at = ?
        WHERE attempt_id = ?
      `).run(JSON.stringify(result), now(), row.id);

      db.prepare(`
        UPDATE attempts SET status = 'COMPLETED', updated_at = ? WHERE id = ?
      `).run(now(), row.id);
    } catch (error) {
      db.prepare(`
        UPDATE evaluations
        SET status = 'FAILED', error_message = ?, updated_at = ?
        WHERE attempt_id = ?
      `).run(String(error), now(), row.id);

      db.prepare(`
        UPDATE attempts SET status = 'FAILED', updated_at = ? WHERE id = ?
      `).run(now(), row.id);
    }
  });

  return res.json({
    success: true,
    message: "Submission saved. Evaluation started.",
    data: parseAttempt(getAttempt(row.id))
  });
});

app.post("/api/attempts/:id/retry", (req, res) => {
  const row = getAttempt(req.params.id);

  if (!row) {
    return res.status(404).json({ success: false, message: "Attempt not found" });
  }

  if (row.status !== "FAILED") {
    return res.status(409).json({
      success: false,
      message: "Only failed evaluations can be retried"
    });
  }

  const problemRow = db.prepare("SELECT * FROM problems WHERE id = ?").get(row.problem_id) as any;
  const submission: SubmissionContent = {
    requirementsUnderstanding: row.requirements_understanding,
    classes: JSON.parse(row.classes_json),
    relationships: JSON.parse(row.relationships_json),
    explanation: row.explanation
  };

  db.prepare("UPDATE attempts SET status = 'EVALUATING', updated_at = ? WHERE id = ?").run(now(), row.id);
  db.prepare("UPDATE evaluations SET status = 'EVALUATING', error_message = NULL, updated_at = ? WHERE attempt_id = ?").run(now(), row.id);

  setImmediate(async () => {
    try {
      const result = await evaluator.evaluate(
        {
          title: problemRow.title,
          requirements: JSON.parse(problemRow.requirements),
          constraints: JSON.parse(problemRow.constraints),
          concepts: JSON.parse(problemRow.concepts)
        },
        submission
      );

      db.prepare("UPDATE evaluations SET status = 'COMPLETED', result_json = ?, error_message = NULL, updated_at = ? WHERE attempt_id = ?")
        .run(JSON.stringify(result), now(), row.id);
      db.prepare("UPDATE attempts SET status = 'COMPLETED', updated_at = ? WHERE id = ?")
        .run(now(), row.id);
    } catch (error) {
      db.prepare("UPDATE evaluations SET status = 'FAILED', error_message = ?, updated_at = ? WHERE attempt_id = ?")
        .run(String(error), now(), row.id);
      db.prepare("UPDATE attempts SET status = 'FAILED', updated_at = ? WHERE id = ?")
        .run(now(), row.id);
    }
  });

  return res.json({ success: true, message: "Evaluation retry started." });
});

export default app;
