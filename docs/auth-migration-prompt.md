# Auth + Permission Migration Prompt (Nuxt 4)

Use this prompt with Codex/AI to implement the migration safely.

```text
You are working in a Nuxt 4.3 + TypeScript project.

Goal:
Migrate auth + route permission behavior from legacy Firebase/Vuex code to secure Nuxt 4 patterns.

Legacy references (read first):
- backup/authenticaltion.js
- backup/routeHelper.js
- backup/user.js
- backup/register.js
- backup/menu.js

Current app context:
- Auth pages:
  - app/pages/(auth)/login.vue
  - app/pages/(auth)/sign-up.vue
  - app/pages/(auth)/forgot-password.vue
  - app/pages/(auth)/reset-password.vue
- Home page:
  - app/pages/index.vue
- Layouts:
  - app/layouts/guest.vue
  - app/layouts/default.vue

What to implement:
1) Auth architecture
- Keep Firebase as identity provider for sign-in/sign-up/reset.
- Do not store access/refresh tokens in client-readable cookies.
- Add server endpoint to verify Firebase ID token and issue HttpOnly app session cookie.
- Add logout endpoint to clear session cookie.
- Add session/me endpoint for middleware checks.

2) Route middleware
- Add Nuxt route middleware for:
  - Guest-only pages (redirect logged-in users away from /login, /sign-up, /forgot-password, /reset-password).
  - Protected pages (redirect unauthenticated users to /login).
- Ensure compatibility with i18n prefixed routes.

3) Module permission model (from brandConfig.permission_menu)
- Build safe route->MODULE_ID mapping using backup/menu.js structure.
- Null-safe behavior when route is not mapped.
- Deny access gracefully (no crash) when module is missing from permission_menu.
- Do not trust localStorage as source of truth for authorization.

4) Login integration
- Update login form submit flow to:
  - authenticate with Firebase,
  - send ID token to server session endpoint,
  - navigate to app home on success,
  - show error feedback on failure.

Constraints:
- Keep changes minimal and task-focused.
- Preserve Nuxt 4 conventions and existing file structure.
- Avoid unrelated refactors.
- Keep TypeScript strict and readable.

Output requirements:
- Show exact files created/updated.
- Explain auth/session flow briefly.
- Include any env vars needed.
- Run lint and report results.
```
