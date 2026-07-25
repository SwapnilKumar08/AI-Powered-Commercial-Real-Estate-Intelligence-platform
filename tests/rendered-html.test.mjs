import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("contains the complete Landmark AI product workspace", async () => {
  const workspace = await readFile(
    new URL("../app/components/CREWorkspace.tsx", import.meta.url),
    "utf8",
  );
  assert.match(workspace, /Landmark <strong>AI/);
  assert.match(workspace, /See the market before it moves/);
  assert.match(workspace, /Deal radar/);
  assert.match(workspace, /Hybrid RAG workspace/);
  assert.match(workspace, /ConvLSTM/);
  assert.match(workspace, /PredRNN/);
  assert.match(workspace, /Responsible outreach/);
  assert.doesNotMatch(workspace, /codex-preview|Your site is taking shape|loading skeleton/i);
});

test("contains production metadata and removes the temporary preview", async () => {
  const [layout, page, packageJson] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Commercial real estate intelligence/);
  assert.match(layout, /og\.png/);
  assert.match(page, /CREWorkspace/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", root)));
  await Promise.all(
    ["ask", "documents", "forecast", "graph", "outreach"].map((route) =>
      access(new URL(`app/api/${route}/route.ts`, root)),
    ),
  );
});
