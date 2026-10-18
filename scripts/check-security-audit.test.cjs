const { test } = require("node:test");
const assert = require("node:assert/strict");
const { evaluateAudit } = require("./check-security-audit.cjs");
const braces = {
  module_name: "braces", severity: "high", patched_versions: "<0.0.0",
  url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm"
};
const report = (...advisories) => [...advisories.map(advisory => ({ type: "auditAdvisory", data: { advisory } })),
  { type: "auditSummary", data: {} }].map(row => JSON.stringify(row)).join("\n");

test("network and incomplete audit output cannot pass", () => {
  assert.throws(() => evaluateAudit(""));
  assert.throws(() => evaluateAudit(JSON.stringify({ type: "error" }) + "\n" + report()));
});
test("an unknown critical vulnerability blocks CI", () => {
  assert.equal(evaluateAudit(report({ ...braces, severity: "critical", url: "https://example.test/new" })).blocked.length, 1);
});
test("the unpatched advisory stays visible and duplicate paths are deduplicated", () => {
  const result = evaluateAudit(report(braces, braces));
  assert.equal(result.remaining.length, 1);
  assert.equal(result.blocked.length, 0);
});
test("a newly available braces patch must be applied", () => {
  assert.equal(evaluateAudit(report({ ...braces, patched_versions: ">=3.0.4" })).blocked.length, 1);
});
