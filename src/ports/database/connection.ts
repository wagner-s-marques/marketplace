import Sqlite from "better-sqlite3";
import { Migrator } from "./migrator.js";
import { normalize } from "../../domain/util/normalize.js";

export class Connection {
  readonly db: Sqlite.Database;

  constructor(dbPath: string) {
    this.db = new Sqlite(dbPath);
    this.db.pragma("foreign_keys = ON");
    this.db.function(
      "normalize",
      { deterministic: true, varargs: false },
      (s) => normalize(s as string | null),
    );
    new Migrator(this.db).run();
  }
}
