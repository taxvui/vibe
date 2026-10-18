const fs = require("node:fs");

const UNPATCHED_BRACES = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";

function evaluateAudit(text) {
  const rows = text.trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
  if (!rows.some(row => row.type === "auditSummary") || rows.some(row => row.type === "error")) {
    throw new Error("Audit did not complete successfully; no security result can be inferred.");
  }
  const advisories = new Map();
  for (const row of rows) {
    if (row.type === "auditAdvisory") advisories.set(row.data.advisory.url, row.data.advisory);
  }
  const remaining = [...advisories.values()];
  const blocked = remaining.filter(advisory => {
    if (!["high", "critical"].includes(advisory.severity)) return false;
    // Keep reporting this advisory. Permit it only while upstream has no patched version.
    return !(advisory.url === UNPATCHED_BRACES && advisory.module_name === "braces" &&
      advisory.severity === "high" && advisory.patched_versions === "<0.0.0");
  });
  return { remaining, blocked };
}

if (require.main === module) {
  try {
    const result = evaluateAudit(fs.readFileSync(process.argv[2], "utf8"));
    console.log(`${result.remaining.length} distinct advisories remain.`);
    for (const advisory of result.remaining) {
      console.log(`${advisory.severity}: ${advisory.module_name} — ${advisory.url} (patched: ${advisory.patched_versions})`);
    }
    if (result.blocked.length) {
      console.error("Unresolved high or critical advisories require an update.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { evaluateAudit };
