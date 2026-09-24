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

export type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  requirements: string[];
  constraints: string[];
  concepts: string[];
  createdAt?: string;
};

export type Attempt = {
  id: string;
  problemId: string;
  status: "DRAFT" | "SUBMITTED" | "EVALUATING" | "COMPLETED" | "FAILED" | string;
  requirementsUnderstanding: string;
  classes: ClassDefinition[];
  relationships: Relationship[];
  explanation: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  problemTitle?: string;
};

export type Evaluation = {
  id: string;
  status: string;
  result: {
    summary: string;
    criteria: {
      name: string;
      status: "GOOD" | "NEEDS_IMPROVEMENT" | "MISSING";
      evidence: string;
      concern: string;
      suggestion: string;
      confidence: "HIGH" | "MEDIUM" | "LOW";
    }[];
    strengths: string[];
    nextSteps: string[];
  } | null;
  errorMessage?: string;
};
