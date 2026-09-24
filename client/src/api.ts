import axios from "axios";
import type { Attempt, Evaluation, Problem, ClassDefinition, Relationship } from "./types";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000
});

function unwrap<T>(response: { data: unknown }): T {
  const body = response.data as any;
  return (body?.data ?? body) as T;
}

export async function getProblems(): Promise<Problem[]> {
  const problems = unwrap<unknown[]>(await api.get("/problems"));
  if (!Array.isArray(problems)) throw new Error("Invalid problems response from server");
  return problems as Problem[];
}

export async function getProblem(id: string): Promise<Problem> {
  const problem = unwrap<Problem>(await api.get(`/problems/${id}`));
  if (!problem || typeof problem !== "object") throw new Error("Invalid problem response from server");
  return problem;
}

export async function createAttempt(problemId: string): Promise<Attempt> {
  const attempt = unwrap<Attempt>(await api.post("/attempts", { problemId }));
  if (!attempt?.id) throw new Error("Invalid attempt response from server");
  return attempt;
}

export async function getAttempt(id: string): Promise<{
  attempt: Attempt;
  problem: Problem;
  evaluation: Evaluation | null;
}> {
  return unwrap(await api.get(`/attempts/${id}`));
}

export async function saveDraft(id: string, payload: {
  requirementsUnderstanding: string;
  classes: ClassDefinition[];
  relationships: Relationship[];
  explanation: string;
}): Promise<Attempt> {
  return unwrap(await api.put(`/attempts/${id}/draft`, payload));
}

export async function submitAttempt(id: string): Promise<Attempt> {
  return unwrap(await api.post(`/attempts/${id}/submit`));
}

export async function getAttempts(): Promise<Attempt[]> {
  const attempts = unwrap<unknown[]>(await api.get("/attempts"));
  if (!Array.isArray(attempts)) throw new Error("Invalid attempts response from server");
  return attempts as Attempt[];
}

export async function retryEvaluation(id: string): Promise<void> {
  await api.post(`/attempts/${id}/retry`);
}
