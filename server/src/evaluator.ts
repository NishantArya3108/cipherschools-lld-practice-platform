import type {
  ClassDefinition,
  EvaluationResult,
  Relationship,
  SubmissionContent
} from "./types.js";

export interface Evaluator {
  evaluate(
    problem: {
      title: string;
      requirements: string[];
      constraints: string[];
      concepts: string[];
    },
    submission: SubmissionContent
  ): Promise<EvaluationResult>;
}

function structuralIssues(submission: SubmissionContent): string[] {
  const issues: string[] = [];

  if (!submission.requirementsUnderstanding.trim()) {
    issues.push("Requirements understanding is empty.");
  }

  if (submission.classes.length === 0) {
    issues.push("At least one class should be defined.");
  }

  if (!submission.explanation.trim()) {
    issues.push("Design explanation is empty.");
  }

  const names = submission.classes.map((c) => c.name.trim().toLowerCase());
  const duplicates = names.filter((name, index) => name && names.indexOf(name) !== index);

  if (duplicates.length > 0) {
    issues.push("Duplicate class names were found.");
  }

  const classNames = new Set(submission.classes.map((c) => c.name.trim()));

  for (const relationship of submission.relationships) {
    if (!classNames.has(relationship.from) || !classNames.has(relationship.to)) {
      issues.push(
        `Relationship "${relationship.from} → ${relationship.to}" references an unknown class.`
      );
    }
  }

  return issues;
}

export class RuleBasedEvaluator implements Evaluator {
  async evaluate(
    problem: {
      title: string;
      requirements: string[];
      constraints: string[];
      concepts: string[];
    },
    submission: SubmissionContent
  ): Promise<EvaluationResult> {
    const issues = structuralIssues(submission);
    const responsibilities = submission.classes.flatMap(
      (c) => c.responsibilities
    );

    const criteria = [
      {
        name: "Requirement Understanding",
        status: submission.requirementsUnderstanding.trim() ? "GOOD" : "MISSING",
        evidence: submission.requirementsUnderstanding.trim()
          ? "The learner provided a requirements interpretation."
          : "No requirements interpretation was provided.",
        concern: submission.requirementsUnderstanding.trim()
          ? ""
          : "The evaluator cannot verify how the learner interpreted the problem.",
        suggestion: "State the main actors, behaviours and assumptions before modelling classes.",
        confidence: "HIGH"
      },
      {
        name: "Class Responsibilities",
        status:
          submission.classes.length > 0 && responsibilities.length > 0
            ? "GOOD"
            : "NEEDS_IMPROVEMENT",
        evidence: `${submission.classes.length} classes and ${responsibilities.length} responsibilities were provided.`,
        concern:
          responsibilities.length === 0
            ? "Classes have no explicit responsibilities."
            : "",
        suggestion:
          "Keep each class focused on one cohesive responsibility and move changing behaviour behind abstractions.",
        confidence: "HIGH"
      },
      {
        name: "Relationships",
        status:
          submission.relationships.length > 0 && issues.length === 0
            ? "GOOD"
            : "NEEDS_IMPROVEMENT",
        evidence: `${submission.relationships.length} relationships were submitted.`,
        concern:
          issues.length > 0
            ? issues.join(" ")
            : "Relationships are structurally valid.",
        suggestion:
          "Use relationships to make ownership and collaboration explicit rather than putting all behaviour in one class.",
        confidence: "HIGH"
      },
      {
        name: "Extensibility",
        status: "NEEDS_IMPROVEMENT",
        evidence: `The problem highlights concepts such as ${problem.concepts.join(", ")}.`,
        concern:
          "Extensibility cannot be fully determined from structure alone.",
        suggestion:
          "Explain one likely requirement change and which abstraction would isolate it.",
        confidence: "MEDIUM"
      },
      {
        name: "Explanation Quality",
        status: submission.explanation.trim() ? "GOOD" : "MISSING",
        evidence: submission.explanation.trim()
          ? "The learner explained design decisions."
          : "No explanation was submitted.",
        concern: submission.explanation.trim()
          ? ""
          : "The evaluator cannot distinguish intentional design choices from accidental structure.",
        suggestion:
          "Explain why important abstractions exist and what trade-off they make.",
        confidence: "HIGH"
      }
    ] as EvaluationResult["criteria"];

    return {
      summary:
        issues.length === 0
          ? `The ${problem.title} submission contains enough structural evidence for design review. The next improvement should focus on explaining trade-offs and change isolation.`
          : `The ${problem.title} submission needs a few structural fixes before deeper design feedback can be trusted.`,
      criteria,
      strengths: [
        submission.classes.length > 0
          ? "The submission contains explicit classes."
          : "No class structure was provided.",
        submission.relationships.length > 0
          ? "The learner represented object relationships."
          : "Add relationships to make collaboration clearer.",
        submission.explanation.trim()
          ? "The learner included design reasoning."
          : "Add design reasoning."
      ],
      nextSteps: [
        "Identify one responsibility that may change independently.",
        "Explain why each important abstraction exists.",
        "Review coupling between the central domain objects."
      ]
    };
  }
}

export class AIEvaluator implements Evaluator {
  constructor(private readonly fallback: Evaluator) {}

  async evaluate(
    problem: {
      title: string;
      requirements: string[];
      constraints: string[];
      concepts: string[];
    },
    submission: SubmissionContent
  ): Promise<EvaluationResult> {
    const url = process.env.AI_API_URL;
    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;

    if (!url || !key || !model) {
      return this.fallback.evaluate(problem, submission);
    }

    const prompt = `
You are evaluating an LLD practice submission.

There can be multiple valid designs. Do not assume one canonical answer.

Problem:
${JSON.stringify(problem, null, 2)}

Submission:
${JSON.stringify(submission, null, 2)}

Evaluate:
1. Requirement Understanding
2. Class Responsibilities
3. Coupling/Cohesion
4. Encapsulation/Interfaces
5. Abstraction/Pattern Usage
6. Extensibility
7. Edge Cases
8. Explanation Quality

Return ONLY valid JSON:
{
  "summary": "string",
  "criteria": [
    {
      "name": "string",
      "status": "GOOD|NEEDS_IMPROVEMENT|MISSING",
      "evidence": "specific evidence from submission",
      "concern": "string",
      "suggestion": "concrete suggestion",
      "confidence": "HIGH|MEDIUM|LOW"
    }
  ],
  "strengths": ["string"],
  "nextSteps": ["string"]
}

Do not invent evidence that is not present in the submission.
`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Return only valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`AI provider returned ${response.status}`);
      }

      const data = (await response.json()) as any;
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.output_text ??
        "";

      const parsed = JSON.parse(content);
      return parsed as EvaluationResult;
    } catch {
      return this.fallback.evaluate(problem, submission);
    }
  }
}
