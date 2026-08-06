---
title: Housekeeping: add .gitignore, .env.example, LICENSE, CI
body: |
  This PR adds repository hygiene and minimal CI to help contributors run and validate the project.

  Changes:
  - Add .gitignore to exclude node_modules, .next, out, .env*, logs, editor folders, and common artifact patterns.
  - Add .env.example documenting required environment variables (Firebase client keys + placeholders for server secrets).
  - Add LICENSE (MIT).
  - Add minimal GitHub Actions workflow (.github/workflows/ci.yml): npm ci → lint → typecheck → build.
  - Add scripts/cleanup_duplicates.sh to help move accidental duplicate files into artifacts/duplicates (dry-run first).
  - Add artifacts/README.md explaining artifact cleanup.

  No application code was modified in this change. The CI will run the existing build/test steps and surface compile-time errors to address next.

  Next steps after this PR is merged:
  1. CI will run and report build/type issues—fix them on focused branches.
  2. Add automated tests (Jest / React Testing Library / Firebase emulator) and increase CI coverage.
  3. Normalize repository structure (resolve tsconfig rootDir vs. layout) and remove duplicate artifacts once reviewed.

---

