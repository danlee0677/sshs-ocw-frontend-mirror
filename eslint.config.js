import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// LINT BASELINE: 0 errors, 0 warnings (measured — `npx eslint src --ext .ts,.tsx`).
//
// `npm run lint` had never been green on this branch. It started at 88 errors,
// of which 48 came from React Router's generated route types under
// .react-router/ and 22 from react-refresh not understanding that a route module
// legitimately exports both a component and a clientLoader. Neither was a real
// defect; together they made "the build is green" useless as a quality gate.
// Ignoring the generated code and allow-listing the framework's export names
// (both below) brought it to 19, and the responsive migration's five phases
// worked that down to 8. Those last 8 were then fixed rather than suppressed:
// `useDebounce`'s `any` constraint became an inferred parameter tuple, the
// TipTap draft payloads became `JSONContent`, root.tsx dropped an unused catch
// binding, and `useUserContext` moved to src/libs/useUserContext.ts.
//
// There are no deliberately-unfixed errors left and no blanket disables, so the
// criterion is simply zero. If this number ever moves, something regressed.
//
// One standing gotcha, learned the hard way: `tsc --noEmit` exits 0 on some
// syntax errors that only ESLint catches (a JSX comment placed directly inside
// `return (` parses as an empty object literal). Run lint BEFORE trusting a
// green build — "npm run build passed" is not on its own evidence that a file is
// well-formed.
export default defineConfig([
  // .react-router/ holds generated route types; build/ and dist/ hold output.
  // Linting generated code is pure noise.
  globalIgnores(['dist', 'build', '.react-router']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // React Router v7 route modules export a component AND route-level
      // handlers. That is the framework's required convention, not a Fast
      // Refresh defect, but reactRefresh.configs.vite has no way to know it.
      // Allow-listing the framework's export names keeps the rule useful for
      // genuine component files.
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: [
            'clientLoader',
            'clientAction',
            'loader',
            'action',
            'ErrorBoundary',
            'HydrateFallback',
            'meta',
            'links',
            'headers',
            'shouldRevalidate',
          ],
        },
      ],
    },
  },
])
