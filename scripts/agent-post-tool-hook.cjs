#!/usr/bin/env node
/**
 * Vivah Planner — Agent PostToolUse Lifecycle Hook
 * Triggered after an agent executes write_to_file or replace_file_content.
 * If a file in src/ was modified, updates docs/MODULES_CATALOG.md automatically.
 *
 * Contract:
 * - Reads JSON on stdin: { toolCall: { name, args: { TargetFile } }, stepIdx, ... }
 * - Writes JSON on stdout: {}
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
    // In case stdin is empty or closed immediately
    setTimeout(() => resolve(data), 1000);
  });
}

async function main() {
  try {
    const rawInput = await readStdin();
    let payload = {};
    if (rawInput && rawInput.trim()) {
      try {
        payload = JSON.parse(rawInput);
      } catch (err) {
        // Ignore parse error, proceed safely
      }
    }

    const toolCall = payload.toolCall;
    const targetFile = toolCall?.args?.TargetFile;

    // Only trigger docs update if a file in src/ was created or modified
    let shouldUpdate = false;
    if (targetFile && typeof targetFile === 'string') {
      const normalized = path.resolve(targetFile);
      const srcPath = path.resolve(ROOT_DIR, 'src');
      if (normalized.startsWith(srcPath)) {
        shouldUpdate = true;
      }
    } else {
      // If target file is unknown or absent, run check anyway
      shouldUpdate = true;
    }

    if (shouldUpdate && fs.existsSync(UPDATE_DOCS_SCRIPT)) {
      try {
        execSync(`node "${UPDATE_DOCS_SCRIPT}"`, {
          cwd: ROOT_DIR,
          stdio: 'ignore',
          timeout: 10000,
        });
      } catch (e) {
        // Suppress failure so we don't block the agent loop
      }
    }
  } catch (err) {
    // Fail-safe: hooks must not crash the agent
  } finally {
    // PostToolUse contract expects {}
    process.stdout.write(JSON.stringify({}) + '\n');
    process.exit(0);
  }
}

main();
