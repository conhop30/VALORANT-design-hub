const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", ".devlogs");
const LOG_FILE = path.join(LOG_DIR, "test-report.log");
const COVERAGE_SUMMARY_FILE = path.join(__dirname, "..", "coverage", "coverage-summary.json");

// Below this statement-coverage %, a file gets flagged as "could use a test".
const COVERAGE_OK_THRESHOLD = 80;

/**
 * Dev-only Jest reporter (see jest.config.js `reporters`). Writes a plain-text
 * snapshot to .devlogs/test-report.log on every run — including every rerun
 * under `jest --watch`, since Jest calls reporters on each cycle, not just
 * once. Never imported by app code, so it never ships in a build; it only
 * runs when something on the machine invokes Jest directly (`npm test`,
 * `npm run test:watch`, `npm run dev`).
 *
 * Coverage isn't available on the `results` object here — Jest's own
 * coverage reporter (which writes coverage/coverage-summary.json, see the
 * `json-summary` entry in coverageReporters) runs *after* custom reporters,
 * for every Jest version checked. So the coverage section below reads
 * whatever coverage-summary.json is currently on disk, which is the
 * *previous* run's coverage in `--watch` mode — it's one cycle stale on the
 * first save after a change, then catches up next cycle. Fine for a
 * glanceable dev log; not worth fighting Jest's reporter ordering for.
 */
function readCoverageSummary() {
  try {
    const raw = fs.readFileSync(COVERAGE_SUMMARY_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

class DevTestReporter {
  onRunComplete(_contexts, results) {
    const lines = [];
    lines.push("VALORANT Design Hub — test report");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");
    lines.push(
      `Suites: ${results.numPassedTestSuites} passed, ${results.numFailedTestSuites} failed, ${results.numTotalTestSuites} total`
    );
    lines.push(
      `Tests:  ${results.numPassedTests} passed, ${results.numFailedTests} failed, ${results.numPendingTests} skipped, ${results.numTotalTests} total`
    );
    lines.push("");

    const hasFailures = results.numFailedTests > 0 || results.numFailedTestSuites > 0;
    if (hasFailures) {
      lines.push("FAILING");
      lines.push("-------");
      for (const suite of results.testResults) {
        const file = path.relative(process.cwd(), suite.testFilePath);
        if (suite.testExecError) {
          lines.push(`  [${file}] failed to run: ${suite.testExecError.message}`);
          continue;
        }
        for (const test of suite.testResults) {
          if (test.status !== "failed") continue;
          const message = (test.failureMessages[0] || "").split("\n")[0];
          lines.push(`  [${file}] ${test.fullName}`);
          lines.push(`    ${message}`);
        }
      }
      lines.push("");
    } else {
      lines.push("All tests passing.");
      lines.push("");
    }

    const coverageSummary = readCoverageSummary();
    if (coverageSummary) {
      const gaps = [];
      for (const [filePath, summary] of Object.entries(coverageSummary)) {
        if (filePath === "total") continue;
        if (summary.statements.pct < COVERAGE_OK_THRESHOLD) {
          gaps.push({
            file: path.relative(process.cwd(), filePath),
            pct: summary.statements.pct,
          });
        }
      }
      gaps.sort((a, b) => a.pct - b.pct);

      lines.push(`COULD USE A TEST (statement coverage below ${COVERAGE_OK_THRESHOLD}%)`);
      lines.push("-".repeat(56));
      if (gaps.length === 0) {
        lines.push("  None — everything in the tracked coverage scope is well covered.");
      } else {
        for (const gap of gaps) {
          lines.push(`  ${gap.pct.toFixed(0).padStart(3)}%  ${gap.file}`);
        }
      }
      lines.push("");
    }

    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(LOG_FILE, lines.join("\n"), "utf8");
  }
}

module.exports = DevTestReporter;
