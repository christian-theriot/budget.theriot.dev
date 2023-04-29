import { Database } from ".";
import { config } from "dotenv";
import postgres from "postgres";

config();

const POSTGRES_CONFIG = {
  user: process.env["POSTGRES_USER"],
  password: process.env["POSTGRES_PASSWORD"],
  host: process.env["POSTGRES_HOST"],
  port: parseInt(`${process.env["POSTGRES_PORT"]}`),
  database: process.env["POSTGRES_DATABASE"],
};
const sql = postgres(POSTGRES_CONFIG);

describe("Database Service", () => {
  let db: Database;

  beforeAll(() => {
    db = new Database();
  });

  afterAll(async () => {
    await db.teardown();
  });

  it("can setup a new database", async () => {
    await db.setup();

    const [{ exists }] =
      await sql`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename='session');`;

    expect(exists).toBeTruthy();

    await sql.end();
  });

  it("has a store getter", () => {
    const store = db.store;

    expect(store).toBeDefined();

    store.close();
  });
});
