// Vývoj jedním příkazem: spustí lokální databázi (pokud už neběží) a Next.js dev server.
// Spuštění: npm run dev:local
import { spawn } from "node:child_process";
import { isPortOpen, startLocalDb } from "./lib-local-db.mjs";

let stopDb = null;
if (await isPortOpen()) {
  console.log("Databáze už běží, používám ji.");
} else {
  stopDb = await startLocalDb();
}

const next = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { stdio: "inherit" });

let stopping = false;
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  if (!next.killed) next.kill("SIGTERM");
  if (stopDb) await stopDb().catch(() => {});
  process.exit(code);
}
next.on("exit", (code) => shutdown(code ?? 0));
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
