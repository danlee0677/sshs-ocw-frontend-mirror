import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// LINT BASELINE — see RESPONSIVE_PLAN.md, Prompt 0.
//
// Before this config: 88 errors. 48 of those came from React Router's generated
// route types under .react-router/, and 22 from react-refresh not understanding
// that a route module legitimately exports both a component and a clientLoader.
// Neither was a real defect; together they made "the build is green" useless as
// a quality gate.
//
// Baseline after this config: 19 errors, 0 warnings (measured, not estimated).
//   6  @typescript-eslint/no-explicit-any          both editors      (Prompts 19, 21)
//   5  @typescript-eslint/no-unused-vars
//   4  react-hooks/immutability                    both editors      (Prompts 19, 21)
//   2  react-hooks/set-state-in-effect             SearchResult.tsx  (Prompt 15)
//   1  @typescript-eslint/no-unsafe-function-type  NewUser.tsx:6     (Prompt 17)
//   1  react-refresh/only-export-components        root.tsx:81
//
// That last one is `useUserContext` — a hook exported from a route module, so
// it is a real Fast Refresh flag rather than a framework convention, and it is
// deliberately NOT in the allow-list below. Moving it to its own file would
// silence it; that is not worth doing mid-migration since every route imports it.
//
// These are genuine and are left deliberately unfixed here — each is scheduled
// in a later prompt. Prompt 24 compares against this number, so the criterion is
// "no NEW errors" rather than an unreachable green build.
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
