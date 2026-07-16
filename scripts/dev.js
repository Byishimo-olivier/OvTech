import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const isProductionLike =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  Boolean(process.env.RENDER_EXTERNAL_URL) ||
  Boolean(process.env.PORT);

if (isProductionLike) {
  await import("../server/index.js");
} else {
  const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
  const child = spawn(process.execPath, [viteBin, "--host", "0.0.0.0"], {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}
