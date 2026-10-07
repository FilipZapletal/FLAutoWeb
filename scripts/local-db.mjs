// Lokální PostgreSQL bez Dockeru. Spuštění: npm run db:local (běží do Ctrl+C)
import { isPortOpen, LOCAL_DB_PORT, startLocalDb } from "./lib-local-db.mjs";

if (await isPortOpen()) {
  console.log(`Na portu ${LOCAL_DB_PORT} už databáze běží.`);
  process.exit(0);
}

const stop = await startLocalDb();
console.log("Ukončení: Ctrl+C");

const shutdown = async () => {
  await stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
setInterval(() => {}, 1 << 30);
