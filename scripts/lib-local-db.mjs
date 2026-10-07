// Sdílená logika lokálního PostgreSQL bez Dockeru (jen pro vývoj). Data jsou v ./.local-db
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

export const LOCAL_DB_PORT = Number(process.env.LOCAL_DB_PORT ?? 5432);
const DB_NAME = "flauto";

/** Běží už něco na portu databáze? (např. db:local v jiném terminálu) */
export function isPortOpen(port = LOCAL_DB_PORT) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

/** Spustí lokální databázi (a při prvním spuštění ji vytvoří). Vrací funkci pro zastavení. */
export async function startLocalDb() {
  const databaseDir = path.resolve(".local-db");
  const pg = new EmbeddedPostgres({
    databaseDir,
    port: LOCAL_DB_PORT,
    user: "postgres",
    password: "postgres",
    persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: () => {},
  });

  if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
    console.log("Inicializuji lokální databázi…");
    await pg.initialise();
  }
  await pg.start();

  const client = pg.getPgClient();
  await client.connect();
  const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (!rowCount) await pg.createDatabase(DB_NAME);
  await client.end();

  console.log(`PostgreSQL běží: postgresql://postgres:postgres@localhost:${LOCAL_DB_PORT}/${DB_NAME}`);
  return () => pg.stop();
}
