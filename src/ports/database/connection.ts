import Sqlite from "better-sqlite3";
import { Migrator } from "./migrator.js";

export class Connection {
  readonly db: Sqlite.Database;

  constructor(dbPath: string) {
    this.db = new Sqlite(dbPath);
    this.db.pragma("foreign_keys = ON");
    new Migrator(this.db).run();
  }
}
