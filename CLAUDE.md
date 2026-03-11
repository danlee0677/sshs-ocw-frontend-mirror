# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # TypeScript check + React Router build
npm run lint      # ESLint validation
npm run preview   # Preview production build
```

No test runner is configured.

## Architecture

**SSHS OCW (Open CourseWare)** — a content platform for Seoul Science High School built with React Router v7 (SSR/CSR hybrid), Mantine UI, and TipTap rich text editing.

### Routing

Routes are defined in [src/routes.ts](src/routes.ts) and use React Router v7's file-based config. All route modules live in `src/routes/`. Action-only routes (no UI) follow the pattern `action.[resource].[verb].ts` and use the path prefix `/action/`.

### Authentication & User Context

The root loader in [src/root.tsx](src/root.tsx) calls `/api/auth/verify` on every page load and passes the `User | null` result to all child routes via `useOutletContext`. To access user data in any route, import and call `useUserContext()` from `src/root.tsx`.

Authentication uses short-lived access tokens (in-memory) plus httpOnly refresh token cookies. The Axios instance in [src/libs/http.ts](src/libs/http.ts) handles 401 responses by calling `/api/auth/refresh` and retrying the original request once.

### HTTP Client

Always use the `http` instance from `src/libs/http.ts` (never plain `axios`) for API calls — it attaches the Bearer token and handles token refresh automatically. The API base URL comes from `VITE_API_URL` (`.env.development`: `http://localhost:3001`).

### Authorization & Permissions

The app has two layers of authorization:

**Global roles** (stored in `User.roles[]`):
- `admin` — full access to all subjects, can grant `teacher_certified` and manage global roles
- `creator` — can create new subjects; automatically becomes `owner` of subjects they create

**Per-subject permissions** (stored on the backend as `PermissionModel`):
- `owner` — can edit/delete the subject and manage editor permissions
- `editor` — can edit the subject and create/delete its lessons

To check if the current user can edit a subject, call `GET /api/permission/check/:subjectId` which returns `{ canEdit: boolean, role: 'admin' | 'owner' | 'editor' | null }`. The `canEdit` flag is true for `admin`, `owner`, and `editor` roles.

**Permission management UI**: `subject/:subjectId/access` ([src/routes/subject/SubjectAccess.tsx](src/routes/subject/SubjectAccess.tsx)) — lists permission records and lets `admin`/`owner` users add or remove `editor` permissions. Mutations go through the action-only route `/action/subject/access` ([src/routes/subject/action.subject.access.ts](src/routes/subject/action.subject.access.ts)).

**Permission API endpoints used by the frontend:**
- `GET /api/permission/check/:subjectId` — returns `{ canEdit, role }` for the current user
- `GET /api/permission/subject/:subjectId` — lists all permission records for a subject (admin/owner only)
- `POST /api/permission` — grants `editor` role to a user (`{ userId, subjectId, role: 'editor' }`)
- `DELETE /api/permission/:permissionId` — revokes an `editor` record

**Zod schemas** for permissions are in [src/libs/types.ts](src/libs/types.ts):
- `permissionCheckSchema` — validates `/api/permission/check` response
- `permissionRecordSchema` / `PermissionRecord` — validates individual permission entries

### Data Patterns

- **Loaders**: fetch data for the page (use `clientLoader` — all data fetching is client-side)
- **Actions**: handle form submissions; form action targets are separate `/action/*` routes
- **`useFetcher`**: used for mutations that don't navigate (e.g., toggling visibility, adding/removing editors)
- **Zod**: all API responses are validated with schemas in [src/libs/types.ts](src/libs/types.ts); use `z.infer<typeof schema>` for derived types

### Rich Text / Lesson Editor

TipTap editor (`src/components/lesson/`) supports Markdown mode toggle, KaTeX math, YouTube embeds, code blocks, tables, and collapsible details. Content is stored in `localStorage` during editing and compiled to Markdown on submit.

### UI & Styling

- **Mantine v8** for all UI components, modals (`ModalsProvider` in root), and layout (`AppShell`)
- **CSS Modules** for component-scoped styles (co-located `.module.css` files)
- Path alias `@` maps to `src/`
