import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npm = isWindows ? "npm.cmd" : "npm";

const processes = [
  spawn(npm, ["run", "server"], { stdio: "inherit", shell: false }),
  spawn(npm, ["run", "dev"], { stdio: "inherit", shell: false }),
];

function stopAll() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
}

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});
