import { config } from "dotenv";
import postgres from "postgres";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

config();

const POSTGRES_CONFIG = {
  user: process.env["POSTGRES_USER"],
  password: process.env["POSTGRES_PASSWORD"],
  host: process.env["POSTGRES_HOST"],
  port: parseInt(`${process.env["POSTGRES_PORT"]}`),
  database: process.env["POSTGRES_DATABASE"],
};
const PostgresSession = connectPgSimple(session);
const sql = postgres(POSTGRES_CONFIG);

export class Database {
  constructor() {}

  async setup() {
    await sql`SET client_min_messages = "WARNING";`;
    await sql`CREATE TABLE IF NOT EXISTS "session" ("sid" varchar NOT NULL COLLATE "default" PRIMARY KEY NOT DEFERRABLE INITIALLY IMMEDIATE, "sess" json NOT NULL, "expire" timestamp(6) NOT NULL) WITH (OIDS=FALSE);`;
    await sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");`;
  }

  async teardown() {
    await sql.end();
  }

  get store() {
    return new PostgresSession({
      pool: new Pool(POSTGRES_CONFIG),
      tableName: "session",
    });
  }
}
