#!/usr/bin/env node
/**
 * Vivah Planner — Automated Module & Section Documentation Synchronizer
 * Scans src/ codebase, aggregates module metrics, verifies documentation coverage,
 * and maintains docs/MODULES_CATALOG.md.
 *
 * Usage:
 *   node scripts/update-docs.cjs         # Regenerate and write catalog
 *   node scripts/update-docs.cjs --check # Check if docs are in sync (for CI/CD)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const CATALOG_PATH = path.join(DOCS_DIR, 'MODULES_CATALOG.md');

const isCheckOnly = process.argv.includes('--check');

// Module definition registry
const MODULE_SPECS = [
  {
    id: 'pillar1',
    name: 'Pillar 1: Dates & Ceremonies Calendar',
    tier: 'Tier 3 (Domain Pillar)',
    srcDirs: ['src/components/pillar1', 'src/components/CreateWeddingModal.tsx'],
    docPath: 'docs/pillar-1-dates-and-events/README.md',
    description: '3-step wizard, Muhurat timer, week calendar view, ritual cards, ceremony auto-prefill, .ics export',
  },
  {
    id: 'pillar2',
    name: 'Pillar 2: Family Hierarchy & Tree',
    tier: 'Tier 3 (Domain Pillar)',
    srcDirs: ['src/components/pillar2'],
    docPath: 'docs/pillar-2-family-information/README.md',
    description: 'Genealogical tree graph via React Flow, 4 generation tiers, bilateral branching, PNG export',
  },
  {
    id: 'pillar3',
    name: 'Pillar 3: Unified Guests & Multi-Event RSVPs',
    tier: 'Tier 3 (Domain Pillar)',
    srcDirs: ['src/components/pillar3'],
    docPath: 'docs/pillar-3-guest-list/README.md',
    description: 'Unified hub, spreadsheet-style member RSVP rows, ceremony tooltips, Core Family 1-click crown, 2000+ pagination',
  },
  {
    id: 'pillar4',
    name: 'Pillar 4: Accommodations & Room Allocation',
    tier: 'Tier 3 (Domain Pillar)',
    srcDirs: ['src/components/pillar4'],
    docPath: 'docs/pillar-4-accommodations/README.md',
    description: 'Multi-hotel management, room category cards, individual guest name chips, interconnecting rooms, rooming list',
  },
  {
    id: 'pillar5',
    name: 'Pillar 5: Travel & Fleet Logistics',
    tier: 'Tier 3 (Domain Pillar)',
    srcDirs: ['src/components/pillar5'],
    docPath: 'docs/pillar-5-travel-arrangements/README.md',
    description: '15-85% drag-and-drop fleet planner, vehicle chassis matrices (Sedans, SUVs, Vans 12/14/16), RHD/LHD steering, boot slots',
  },
  {
    id: 'pillar6',
    name: 'Pillar 6: Seating Charts & Floor Plan Studio',
    tier: 'Tier 3 (Domain Pillar)',
    srcDirs: ['src/components/pillar6'],
    docPath: 'docs/pillar-6-seating-charts/README.md',
    description: 'React Flow 60fps floor plan, Royal Diwan, Round/Banquet tables, proximity auto-snap (<170px), 2x PNG floor plan export',
  },
  {
    id: 'pillar7',
    name: 'Pillar 7: Festive E-Invites Studio',
    tier: 'Tier 3 (Domain Pillar)',
    srcDirs: ['src/components/pillar7', 'src/components/PublicInviteView.tsx'],
    docPath: 'docs/pillar-7-e-invites/README.md',
    description: '3-column designer, 4 cohorts, RGBA watermark pattern engine, unclipped full-bleed PNG export, WhatsApp blast',
  },
  {
    id: 'common',
    name: 'Common UI Primitives',
    tier: 'Tier 1 (Agnostic Primitives)',
    srcDirs: ['src/components/common'],
    docPath: 'docs/modules/common-primitives.md',
    description: 'Universal primitives: <NestedScreen> (2-tier drawer/modal), <Tooltip>, <CustomSelect>, <CustomToggle>',
  },
  {
    id: 'tags',
    name: 'Tagging & Categorization System',
    tier: 'Tier 2 (Cross-Cutting Domain)',
    srcDirs: ['src/components/tags', 'src/utils/tagUtils.ts'],
    docPath: 'docs/modules/tags-system.md',
    description: 'TagBadge, TagSelector, TagManagerModal (2-level drawer), syncMemberTags bidirectional sync',
  },
  {
    id: 'shell',
    name: 'App Shell & Global Navigation',
    tier: 'Tier 4 (Global Shell)',
    srcDirs: [
      'src/components/Navbar.tsx',
      'src/components/WeddingDashboard.tsx',
      'src/components/WeddingCommandCenter.tsx',
      'src/components/InstallPwaBanner.tsx',
      'src/components/OfflineStatusIndicator.tsx',
      'src/components/ThemeSelectorModal.tsx',
      'src/components/WeddingSettingsModal.tsx',
      'src/App.tsx',
    ],
    docPath: 'docs/modules/app-shell-navigation.md',
    description: 'Unified top navigation bar, wedding switcher dropdown, offline network indicator, PWA installer banner',
  },
  {
    id: 'database',
    name: 'Offline Database & Persistence',
    tier: 'Storage Layer (IndexedDB)',
    srcDirs: ['src/db'],
    docPath: 'docs/modules/offline-database.md',
    description: 'VivahDatabase (Dexie.js v4), 17 indexed stores, canonical schema.ts, sampleData.ts, JSON backup & restore',
  },
  {
    id: 'theming',
    name: 'Theming & Visual Styling',
    tier: 'Global Styling Engine',
    srcDirs: ['src/context/ThemeContext.tsx', 'src/context/WeddingContext.tsx', 'src/index.css'],
    docPath: 'docs/modules/theming-system.md',
    description: '5 curated cultural palettes, dynamic CSS custom properties (:root & [data-theme]), per-wedding custom colors',
  },
];

function getFilesRecursively(targetPath) {
  const fullPath = path.resolve(ROOT_DIR, targetPath);
  if (!fs.existsSync(fullPath)) return [];
  const stat = fs.statSync(fullPath);
  if (!stat.isDirectory()) return [fullPath];

  let results = [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFilesRecursively(entryPath));
    } else if (/\.(tsx?|css|jsx?)$/.test(entry.name)) {
      results.push(entryPath);
    }
  }
  return results;
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function extractExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exports = [];
    const exportRegex = /export\s+(?:const|function|interface|class|type)\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    return exports;
  } catch {
    return [];
  }
}

function analyzeModules() {
  const analyzed = [];
  let totalFiles = 0;
  let totalLoc = 0;

  for (const mod of MODULE_SPECS) {
    const allFiles = new Set();
    for (const srcPath of mod.srcDirs) {
      const files = getFilesRecursively(srcPath);
      files.forEach(f => allFiles.add(f));
    }

    const fileList = Array.from(allFiles);
    let modLoc = 0;
    const allExports = new Set();

    fileList.forEach(file => {
      modLoc += countLines(file);
      extractExports(file).forEach(exp => allExports.add(exp));
    });

    const docFullPath = path.resolve(ROOT_DIR, mod.docPath);
    const hasDoc = fs.existsSync(docFullPath);

    analyzed.push({
      ...mod,
      fileCount: fileList.length,
      loc: modLoc,
      exports: Array.from(allExports).slice(0, 6), // top 6 exports
      hasDoc,
      docRelative: path.relative(DOCS_DIR, docFullPath).replace(/\\/g, '/'),
    });

    totalFiles += fileList.length;
    totalLoc += modLoc;
  }

  return { analyzed, totalFiles, totalLoc };
}

function generateMarkdown({ analyzed, totalFiles, totalLoc }) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  let md = `# Vivah Planner — Live Module & Section Catalog\n\n`;
  md += `> **Generated**: \`${timestamp}\`  \n`;
  md += `> **Automated Hook**: \`scripts/update-docs.cjs\`  \n`;
  md += `> **Total Measured Modules**: \`${analyzed.length}\` | **Total Source Files**: \`${totalFiles}\` | **Total Lines of Code**: \`${totalLoc.toLocaleString()}\`  \n\n`;
  md += `---\n\n`;

  md += `## 📋 Module Inventory & Documentation Mapping\n\n`;
  md += `| Module / Section | Tier | Files | LOC | Primary Exports / Interfaces | Documentation Link | Status |\n`;
  md += `|---|---|---|---|---|---|---|\n`;

  for (const mod of analyzed) {
    const status = mod.hasDoc ? '✅ Documented' : '⚠️ Missing Doc';
    const exportsStr = mod.exports.length > 0 ? mod.exports.map(e => `\`${e}\``).join(', ') : '*(Internal)*';
    const docLink = mod.hasDoc ? `[View Documentation](./${mod.docRelative})` : '*None*';
    md += `| **${mod.name}**<br><small>${mod.description}</small> | \`${mod.tier}\` | \`${mod.fileCount}\` | \`${mod.loc.toLocaleString()}\` | ${exportsStr} | ${docLink} | ${status} |\n`;
  }

  md += `\n---\n\n`;
  md += `## 🛠️ Verification & Synchronization Commands\n\n`;
  md += `- **Update Catalog Manually**: \`npm run docs:update\`\n`;
  md += `- **Verify in CI/CD**: \`npm run docs:check\`\n`;
  md += `- **Re-install Git Pre-Commit Hook**: \`npm run hooks:install\`\n`;

  return md;
}

function run() {
  console.log('🔍 Scanning Vivah Planner codebase modules and sections...');
  const { analyzed, totalFiles, totalLoc } = analyzeModules();

  const newMarkdown = generateMarkdown({ analyzed, totalFiles, totalLoc });

  if (isCheckOnly) {
    if (!fs.existsSync(CATALOG_PATH)) {
      console.error(`❌ docs/MODULES_CATALOG.md does not exist. Run 'npm run docs:update' to generate.`);
      process.exit(1);
    }
    const existing = fs.readFileSync(CATALOG_PATH, 'utf8');
    // Normalize timestamps for comparison
    const normalize = str => str.replace(/> \*\*Generated\*\*: `[^`]+`/, '');
    if (normalize(existing) !== normalize(newMarkdown)) {
      console.error(`❌ Documentation drift detected in docs/MODULES_CATALOG.md. Run 'npm run docs:update' to synchronize.`);
      process.exit(1);
    }
    console.log(`✅ Documentation is fully up-to-date across all ${analyzed.length} modules!`);
    process.exit(0);
  }

  fs.writeFileSync(CATALOG_PATH, newMarkdown, 'utf8');
  console.log(`✅ Successfully updated docs/MODULES_CATALOG.md (${analyzed.length} modules, ${totalFiles} files, ${totalLoc.toLocaleString()} LOC).`);

  // Check for any missing documentation files
  const missing = analyzed.filter(m => !m.hasDoc);
  if (missing.length > 0) {
    console.warn(`⚠️ Warning: ${missing.length} module(s) lack documentation:`);
    missing.forEach(m => console.warn(`   - ${m.name} -> expected ${m.docPath}`));
  } else {
    console.log(`🌟 100% of all ${analyzed.length} modules and sections have active documentation!`);
  }
}

run();
