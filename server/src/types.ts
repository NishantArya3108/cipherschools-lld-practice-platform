export type AttemptStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "EVALUATING"
  | "COMPLETED"
  | "FAILED";

export type ClassDefinition = {
  name: string;
  responsibilities: string[];
  methods: string[];
};

export type Relationship = {
  from: string;
  type: string;
  to: string;
};

export type SubmissionContent = {
  requirementsUnderstanding: string;
  classes: ClassDefinition[];
  relationships: Relationship[];
  explanation: string;
};

export type CriterionResult = {
  name: string;
  status: "GOOD" | "NEEDS_IMPROVEMENT" | "MISSING";
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type EvaluationResult = {
  summary: string;
  criteria: CriterionResult[];
  strengths: string[];
  nextSteps: string[];
};
