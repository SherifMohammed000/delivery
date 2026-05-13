<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Specific Skills & Fixes

- **Firebase Admin PEM Pattern**: When initializing `admin.credential.cert()`, always map fields manually (`privateKey`, `clientEmail`, `projectId`). Ensure `privateKey` has literal `\n` characters replaced with actual newlines: `.replace(/\\n/g, '\n')`.
- **Component-First Rule**: NEVER build large pages directly. Always create sub-components in `src/components/...` first, then assemble them in the page file.

# Incremental Development Rules

- Always work incrementally.
- **MANDATORY**: Ask the user for the next step before creating any implementation plans or starting large tasks.
- Ensure each step is verified before moving to the next.

# Context Gathering Rules

- **MANDATORY**: Before proposing any ideas, architectures, or implementation plans, you MUST read the following project documentation if they exist:
  - `prodocs/roadmap.md`
  - `prodocs/backlog.md`
  - `prodocs/README.md`
- Use these documents as the source of truth for scope, prioritization, and technical direction.
