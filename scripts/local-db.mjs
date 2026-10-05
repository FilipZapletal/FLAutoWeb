// Lokální PostgreSQL bez Dockeru (jen pro vývoj). Data jsou v ./.local-db
// Spuštění: npm run db:local  (běží, dokud ho neukončíte Ctrl+C)
import { existsSync } from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = path.resolve(".local-db");
const port = Number(process.env.LOCAL_DB_PORT ?? 5432);
const dbName = "flauto";

const pg = new EmbeddedPostgres({
  databaseDir,
  port,
  user: "postgres",
  password: "postgres",
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
  console.log("Inicializuji lokální databázi…");
  await pg.initialise();
}
await pg.start();

const client = pg.getPgClient();
await client.connect();
const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
if (!rowCount) await pg.createDatabase(dbName);
await client.end();

console.log(`PostgreSQL běží: postgresql://postgres:postgres@localhost:${port}/${dbName}`);
console.log("Ukončení: Ctrl+C");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
