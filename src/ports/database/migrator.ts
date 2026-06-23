import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type Sqlite from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

export class Migrator {
  constructor(private readonly db: Sqlite.Database) {}

  run(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const appliedRows = this.db
      .prepare("SELECT name FROM _migrations")
      .all() as Array<{ name: string }>;
    const applied = new Set(appliedRows.map((r) => r.name));

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
      console.log(`Applying migration: ${file}`);
      const apply = this.db.transaction(() => {
        this.db.exec(sql);
        this.db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
      });
      apply();
    }
  }
}
