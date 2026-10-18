"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildPreferenceResponse } = require("../src/controllers/preferences-controller");
const { renderWelcome } = require("../src/services/message-service");
const { formatLabel } = require("../src/services/label-service");

const packageJson = require("../package.json");

test("intentionally pinned versions remain available to Snyk", () => {
  assert.equal(packageJson.dependencies.lodash, "4.17.15");
  assert.equal(packageJson.dependencies.minimist, "1.2.5");
});

test("nested conversion calls lodash.zipObjectDeep through service chain", () => {
  const response = buildPreferenceResponse({
    field: "preferences.theme",
    value: "dark"
  });
  assert.deepEqual(response, {
    stored: false,
    preview: { preferences: { theme: "dark" } }
  });
});

test("unapproved prototype-related paths are rejected before lodash call", () => {
  assert.throws(
    () => buildPreferenceResponse({ field: "__proto__.example", value: "x" }),
    /allowlist/
  );
});

test("trusted lodash.template escapes interpolated HTML", () => {
  assert.equal(renderWelcome("<b>Lab</b>"), "Welcome, &lt;b&gt;Lab&lt;/b&gt;!");
});

test("safe lodash API is called", () => {
  assert.equal(formatLabel("sample_record"), "Sample Record");
});

test("minimist package is declared but not imported in application sources", () => {
  const src = path.join(__dirname, "..", "src");
  function walk(p) {
    return fs.readdirSync(p, { withFileTypes: true }).flatMap((entry) => {
      const child = path.join(p, entry.name);
      return entry.isDirectory() ? walk(child) : [child];
    });
  }
  const code = walk(src).filter(f => f.endsWith(".js"))
    .map(f => fs.readFileSync(f, "utf8")).join("\n");
  assert.equal(/require\(["']minimist["']\)/.test(code), false);
});
