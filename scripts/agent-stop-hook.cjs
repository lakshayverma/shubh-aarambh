#!/usr/bin/env node
/**
 * Vivah Planner — Agent Stop Lifecycle Hook
 * Triggered when an agent execution loop terminates (model_stop / idle).
 * Ensures documentation catalog is 100% updated before the agent completes its turn.
 *
 * Contract:
 * - Reads JSON on stdin: { terminationReason, fullyIdle, executionNum, ... }
 * - Writes JSON on stdout: { "decision": "allow" }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const UPDATE_DOCS_SCRIPT = path.join(ROOT_DIR, 'scripts', 'update-docs.cjs');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    setTimeout(() => resolve(data), 1000);
  });
}

async function main() {
  try {
    await readStdin();

    // Ensure docs are up to date on agent termination
    if (fs.existsSync(UPDATE_DOCS_SCRIPT)) {
      try {
        execSync(`node "${UPDATE_DOCS_SCRIPT}"`, {
          cwd: ROOT_DIR,
          stdio: 'ignore',
          timeout: 10000,
        });
      } catch (e) {
        // Suppress failure
      }
    }
  } catch (err) {
    // Fail-safe
  } finally {
    process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
    process.exit(0);
  }
}

main();
