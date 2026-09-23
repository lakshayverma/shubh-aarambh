# Agent Documentation Invariant

> **Scope**: All AI agents and developers operating in this workspace.

## Automated Documentation Maintenance

1. **Continuous Documentation Sync**:
   Whenever you add or modify components, pillar managers, database stores, hooks, or utilities in `src/`:
   - You **must** update the corresponding documentation file in `docs/` (`docs/pillar-1-dates-and-events/` through `docs/pillar-7-e-invites/` or `docs/modules/`).
   - If introducing a new module or architectural subsystem, create a dedicated markdown specification under `docs/modules/` and register it in `scripts/update-docs.cjs`.

2. **Automated Lifecycle Hooks (`.agents/hooks.json`)**:
   - `PostToolUse` Hook: Automatically updates `docs/MODULES_CATALOG.md` when files in `src/` are edited.
   - `Stop` Hook: Automatically performs a final synchronization sweep before your turn concludes.
   - Verification command: Run `npm run docs:check` to ensure 0 drift.

3. **Shared Knowledge for Future Collaborators**:
   Keep documentation accurate, granular, and comprehensive so that teammates and future AI agents have immediate, canonical context on component contracts, data models, and performance constraints.
