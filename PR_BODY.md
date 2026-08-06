# Housekeeping: add .gitignore, .env.example, LICENSE, CI

This PR centralizes non-functional repository hygiene: .gitignore, .env.example, LICENSE, a minimal CI workflow, and a cleanup script. No application code was changed in this branch.

Files added:
- .gitignore
- .env.example
- LICENSE (MIT)
- .github/workflows/ci.yml
- scripts/cleanup_duplicates.sh
- artifacts/README.md

Why:
- Prevent accidental commits of secrets and build artifacts.
- Provide a clear env var example for local development.
- Run initial CI checks to surface build/type errors early.

How to test locally:
1. git checkout housekeeping/repo-cleanup
2. npm ci
3. cp .env.example .env.local and fill in your Firebase project public keys
4. npm run dev

Next steps after merging:
- Run the CI workflow on main to surface build/type issues—fix them on focused branches.
- Add automated tests and Firebase emulator-based test flows.
- Normalize repository structure (resolve tsconfig rootDir mismatch) and remove duplicates once reviewed.
