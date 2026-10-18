import fs from "node:fs";
import path from "node:path";

// Normalize the common single-project npm Snyk OSS CLI JSON structure.
// `snyk test` returns 1 when vulnerabilities are present, by design.
const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/normalize-snyk.mjs <input.json> <output.json>");
  process.exit(2);
}
const raw = JSON.parse(fs.readFileSync(input, "utf8"));
const documents = Array.isArray(raw) ? raw : [raw];
const findings = [];
for (const document of documents) {
  if (document.ok === false && !Array.isArray(document.vulnerabilities)) {
    throw new Error("Input appears to be a Snyk error, not scan findings");
  }
  if (!Array.isArray(document.vulnerabilities)) {
    throw new Error("Expected a Snyk OSS vulnerabilities array");
  }
  for (const v of document.vulnerabilities) {
    findings.push({
      id: v.id ?? null,
      cves: v.identifiers?.CVE ?? [],
      severity: v.severity ?? null,
      title: v.title ?? null,
      package: v.packageName ?? null,
      version: v.version ?? null,
      dependencyPath: v.from ?? [],
      description: String(v.description ?? "").slice(0, 2500),
      source: document.source ?? "SNYK_CLI_JSON"
    });
  }
}
const result = {
  format: "snyk-reachability-mvp/v1",
  source: raw.source ?? "SNYK_CLI_JSON",
  findingCount: findings.length,
  findings
};
fs.mkdirSync(path.dirname(path.resolve(output)), {recursive:true});
fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
console.log(`Normalized ${findings.length} findings into ${output}`);
