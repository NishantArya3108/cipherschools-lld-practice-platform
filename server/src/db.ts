import "dotenv/config";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbFile = process.env.DB_FILE || "./data/lld-forge.db";
const resolved = path.resolve(dbFile);

fs.mkdirSync(path.dirname(resolved), { recursive: true });

export const db = new Database(resolved);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  constraints TEXT NOT NULL,
  concepts TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL,
  status TEXT NOT NULL,
  requirements_understanding TEXT NOT NULL DEFAULT '',
  classes_json TEXT NOT NULL DEFAULT '[]',
  relationships_json TEXT NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  submitted_at TEXT,
  FOREIGN KEY(problem_id) REFERENCES problems(id)
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  result_json TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(attempt_id) REFERENCES attempts(id)
);
`);

export function now() {
  return new Date().toISOString();
}
