import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/*
 * Load .env once for the whole server.
 *
 * .env wins over variables already set in the terminal, so a stale value from an old
 * `$env:EMAIL_PASS=...` / `export EMAIL_PASS=...` can never hide the one in .env.
 * PORT is the exception: if the host or process manager (pm2, systemd, Render) sets PORT,
 * that value is kept, so this app never grabs a port another app on the server uses.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hostPort = process.env.PORT;

dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

if (hostPort) {
  process.env.PORT = hostPort;
}
