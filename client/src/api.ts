import axios from "axios";
import type { Attempt, Evaluation, Problem, ClassDefinition, Relationship } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export async function getProblems(): Promise<Problem[]> {
  const response = await api.get("/problems");
  return response.data.data;
}

export async function getProblem(id: string): Promise<Problem> {
  const response = await api.get(`/problems/${id}`);
  return response.data.data;
}

export async function createAttempt(problemId: string): Promise<Attempt> {
  const response = await api.post("/attempts", { problemId });
  return response.data.data;
}

export async function getAttempt(id: string) {
  const response = await api.get(`/attempts/${id}`);
  return response.data.data as {
    attempt: Attempt;
    problem: Problem;
    evaluation: Evaluation | null;
  };
}

export async function saveDraft(
  id: string,
  payload: {
    requirementsUnderstanding: string;
    classes: ClassDefinition[];
    relationships: Relationship[];
    explanation: string;
  }
): Promise<Attempt> {
  const response = await api.put(`/attempts/${id}/draft`, payload);
  return response.data.data;
}

export async function submitAttempt(id: string): Promise<Attempt> {
  const response = await api.post(`/attempts/${id}/submit`);
  return response.data.data;
}

export async function getAttempts(): Promise<Attempt[]> {
  const response = await api.get("/attempts");
  return response.data.data;
}
