# Project Rules

> **Read this file fully before doing anything.** These rules take priority over your default behavior. If a request conflicts with these rules, pause and ask before proceeding.

---

## 1. Before You Start

- Read this file, then skim the project structure (`README`, config files, folder layout) before writing or changing any code.
- Understand the task before acting. If the request is ambiguous, underspecified, or could be interpreted multiple ways, **ask a clarifying question first** instead of guessing.
- State a short plan before making non-trivial changes, and wait for confirmation on anything large or risky.

## 2. Scope Discipline

- Do **only** what was asked. Do not refactor, rename, reformat, or "improve" unrelated code unless explicitly requested.
- Do not add features, dependencies, or files that weren't asked for.
- If you notice a separate problem while working, mention it — don't silently fix it.
- Keep changes as small and focused as possible. Prefer the minimal diff that solves the problem.

## 3. Safety & Destructive Actions

- **Always ask before:** deleting files, dropping/altering databases, running migrations, force-pushing, rewriting git history, changing any utility files, models, fields, and especially ALWAYS ask before runing any command in the terminal which wud remove/delete any file or extension.
- Never run commands you don't understand or can't explain.
- Never touch secrets, `.env` files, credentials, or keys. Don't print them, commit them, or move them.
- Do not run commands that reach outside this project directory unless explicitly told to.

## 4. Code Standards

- Match the existing style, conventions, and patterns already in the codebase. Consistency beats personal preference.
- While writing the controllers, use the utility functions, apiError.ts, apiResponse.ts, and asyncHandler.ts wherever needed, accordingly.
- Abide to the prisma models created and use the field names as mentioned in Prisma models
- Follow the project's linter/formatter config. Don't override or disable rules to make errors go away.
- Write clear names and add comments only where intent isn't obvious. Don't over-comment.
- No dead code, commented-out blocks, or `console.log`/debug leftovers in final changes.
- Maintain the file and folder structure as it is..Keep it as simple and clean as possible. You may ask to create a file and folder as well to maintain cleanliness in the code

## 5. Dependencies

- Do not add a new dependency without flagging it first, with a one-line reason why it's needed.
- Prefer the standard library and existing project dependencies over new packages.
- Never upgrade or downgrade existing dependencies unless that's the actual task.

## 6. Testing & Verification

- Run the existing tests before and after your changes. Don't consider a task done until it builds and tests pass.
- Add or update tests for any new behavior or bug fix.
- Never delete or skip a failing test to make the suite pass — fix the cause or report it.
- If you can't run something, say so clearly rather than assuming it works.

## 7. Git & Commits

- Make focused commits with clear, descriptive messages.
- Do not commit unless asked, and never `git push` without explicit confirmation.
- Never commit secrets, large binaries, or generated/build artifacts.

## 8. Communication

- If you're blocked, unsure, or lack information, stop and ask — do not fabricate answers, file contents, or command output.
- When you finish, give a short summary of what changed and why, and note anything the user should review or do next.
- Flag any assumptions you had to make.

## 9. Hard Stops — Always Ask First

- Deleting or overwriting files
- Anything touching production
- Adding dependencies
- Rewriting git history / force-pushing
- Bulk changes across many files
- Anything not clearly covered by the current task

---

*Adjust these rules to fit your project. Add project-specific sections below (build commands, architecture notes, domain rules, etc.).*