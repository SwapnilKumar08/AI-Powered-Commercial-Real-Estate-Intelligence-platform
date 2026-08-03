import { mkdir, rename, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "app", "api");
const stashDir = path.join(root, ".pages-build", "api");

async function runNextBuild() {
  await mkdir(path.dirname(stashDir), { recursive: true });

  let apiMoved = false;

  try {
    await rename(apiDir, stashDir);
    apiMoved = true;

    await new Promise((resolve, reject) => {
      const child = spawn(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["next", "build"],
        {
          cwd: root,
          env: {
            ...process.env,
            GITHUB_PAGES: "true",
          },
          stdio: "inherit",
        },
      );

      child.on("exit", (code, signal) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(
            signal
              ? `next build exited from signal ${signal}`
              : `next build exited with code ${code ?? "unknown"}`,
          ),
        );
      });
      child.on("error", reject);
    });

    await writeFile(path.join(root, "out", ".nojekyll"), "");
  } finally {
    if (apiMoved) {
      await rename(stashDir, apiDir);
    }
  }
}

runNextBuild().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});