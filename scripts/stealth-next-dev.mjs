import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const runtimeFile = path.join(process.cwd(), ".stealthql", "runtime.json");
const requestedPort = process.env.STEALTHQL_PORT ?? portFromUrl(process.env.STEALTHQL_URL) ?? "auto";
const requestedNextPort = process.env.NEXT_PORT ?? process.env.PORT ?? null;
const processes = [];
let shuttingDown = false;

fs.rmSync(runtimeFile, { force: true });
runPackageBin("stealthql", ["dev", "--port", requestedPort, "--auto-port", "--port-file", runtimeFile], "stealthql");
startNextWhenRuntimeIsReady().catch((error) => {
  console.error(error.message);
  shutdown(1);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function startNextWhenRuntimeIsReady() {
  const runtime = await waitForRuntimeFile(runtimeFile, 15000);
  const nextArgs = ["dev", ...(requestedNextPort ? ["-p", String(requestedNextPort)] : [])];
  console.log(`StealthQL runtime: ${runtime.url}`);
  if (requestedNextPort) {
    console.log(`Next dev server requested port: http://localhost:${requestedNextPort}`);
  } else {
    console.log("Next dev server: starting; Next will print the final URL.");
  }
  runPackageBin("next", nextArgs, "next", {
    env: {
      ...process.env,
      STEALTHQL_URL: runtime.url,
      STEALTHQL_PORT: String(runtime.port),
      ...(requestedNextPort ? { PORT: String(requestedNextPort) } : {})
    }
  });
}

function runPackageBin(packageName, args, name, options = {}) {
  return run(process.execPath, [resolvePackageBin(packageName), ...args], name, options);
}

function run(command, args, name, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    env: options.env ?? process.env
  });
  processes.push(child);
  child.on("exit", (code) => {
    if (!shuttingDown && code) {
      shutdown(code);
    }
  });
  child.on("error", (error) => {
    console.error(`Failed to start ${name}: ${error.message}`);
    shutdown(1);
  });
  return child;
}

async function waitForRuntimeFile(file, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (fs.existsSync(file)) {
      const payload = JSON.parse(fs.readFileSync(file, "utf8"));
      if (payload?.url && payload?.port) {
        return payload;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for StealthQL runtime to choose a port.");
}

function portFromUrl(value) {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).port || null;
  } catch {
    return null;
  }
}

function resolvePackageBin(packageName) {
  const packageRoot = resolvePackageRoot(packageName);
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  const bin = typeof packageJson.bin === "string" ? packageJson.bin : packageJson.bin?.[packageName];
  if (!bin) {
    throw new Error(`Package "${packageName}" does not declare a runnable bin.`);
  }
  return path.resolve(packageRoot, bin);
}

function resolvePackageRoot(packageName) {
  const directPackageJson = path.join(process.cwd(), "node_modules", ...packageName.split("/"), "package.json");
  if (fs.existsSync(directPackageJson)) {
    return path.dirname(directPackageJson);
  }

  try {
    return path.dirname(require.resolve(`${packageName}/package.json`, { paths: [process.cwd()] }));
  } catch {
    const entry = require.resolve(packageName, { paths: [process.cwd()] });
    return findPackageRoot(entry, packageName);
  }
}

function findPackageRoot(entry, packageName) {
  let current = path.dirname(entry);
  const root = path.parse(current).root;
  while (current && current !== root) {
    const packagePath = path.join(current, "package.json");
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      if (packageJson.name === packageName) {
        return current;
      }
    }
    current = path.dirname(current);
  }
  throw new Error(`Could not find package root for "${packageName}". Run npm install and try again.`);
}

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(Number(code) || 0);
}
