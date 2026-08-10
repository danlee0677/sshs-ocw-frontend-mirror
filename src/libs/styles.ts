import type { CSSProperties } from 'react';
import type { StyleProp } from '@mantine/core';

export const linkStyle = {
  textDecoration: 'none',
  color: 'inherit'
}

/**
 * Mantine's default breakpoints, restated so the theme (root.tsx), the CSS
 * modules (postcss.config.cjs → postcss-simple-vars) and TypeScript all read
 * the same numbers. Keep in sync with postcss.config.cjs.
 */
export const BREAKPOINTS = {
  xs: '36em',
  sm: '48em',
  md: '62em',
  lg: '75em',
  xl: '88em',
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Media queries for `useMediaQuery`, derived from BREAKPOINTS so they cannot drift.
 *
 * HOW `useMediaQuery` ACTUALLY BEHAVES. It does not return `undefined` — the
 * installed Mantine v8 hook ends with `return matches || false`, and its declared
 * type is `boolean`. The real mechanism is the `getInitialValueInEffect` option,
 * which DEFAULTS TO `true` and defers the first real read to a `useEffect`. So the
 * fallback value paints and then snaps to the true one. Hydration is not involved:
 * this app is a SPA (`react-router.config.ts` sets `ssr: false`, there is no
 * entry.server.tsx, the built index.html reports `"isSpaMode":true`), and only
 * root.tsx appears in the prerendered shell.
 *
 * PREFER `visibleFrom` / `hiddenFrom` and responsive prop objects for anything
 * CSS can express. Mantine bakes those media-query classes into a
 * `<style data-mantine-styles="classes">` block in index.html itself, so they
 * apply before any JS loads — which is a stronger guarantee than any hook.
 *
 * NEVER use a media query to decide whether a control is RENDERED. Note the
 * reason is about unmounting, not about rendering mode: unmounting a field
 * inside `<Form method="get">` stops it being submitted, silently changing what
 * the form does. Render both variants and let CSS hide one.
 *
 * WHEN JS GENUINELY MUST BRANCH ON WIDTH — computing a value, not showing or
 * hiding something — use:
 *
 *     useMediaQuery(MOBILE_QUERY, false, { getInitialValueInEffect: false })
 *
 * which reads `window.matchMedia` synchronously on first render: correct value,
 * no flash. In SPA mode this is safe for any component below root.tsx, since
 * none of them appear in the prerendered shell. Reach for it only when CSS
 * cannot express the change.
 */
export const MOBILE_QUERY = `(max-width: ${BREAKPOINTS.sm})` as const;
export const TABLET_QUERY = `(max-width: ${BREAKPOINTS.md})` as const;

/**
 * `min-width` companions to the two above. Use THESE, not the negation of a
 * max-width query, whenever the JS result has to agree with a Mantine
 * breakpoint — `visibleFrom` / `hiddenFrom` and `AppShell`'s `navbar.breakpoint`
 * are all `min-width`.
 *
 * The two forms are NOT complements. At exactly 48em both `(max-width: 48em)`
 * and `(min-width: 48em)` match, so a max-width query reports "mobile" on the
 * first width at which Mantine has already switched to desktop. AppShell widens
 * the gap: `assignNavbarVariables` collapses the navbar at
 * `breakpoint - 0.1em`, i.e. 47.9em. Keying anything off MOBILE_QUERY that must
 * line up with the navbar therefore double-counts 768px exactly — you get the
 * mobile header and the desktop navbar at the same time.
 */
export const FROM_SM_QUERY = `(min-width: ${BREAKPOINTS.sm})` as const;
export const FROM_MD_QUERY = `(min-width: ${BREAKPOINTS.md})` as const;
export const FROM_LG_QUERY = `(min-width: ${BREAKPOINTS.lg})` as const;

/**
 * Single source of truth for appshell header height (px). The appshells
 * currently disagree — TSX passes `8dvh`, the CSS module hardcodes 56px.
 */
export const HEADER_HEIGHT = 56;

/**
 * Max content width in px. Shared by CONTENT_WIDTH below and the theme's
 * `Container` default size, so both mechanisms cap at the same place.
 */
export const CONTENT_MAX_WIDTH = 1200;

/** Standard responsive page-content width; replaces ad-hoc `w='80%'`. */
export const CONTENT_WIDTH: StyleProp<CSSProperties['width']> = {
  base: '100%',
  sm: '95%',
  md: '90%',
  lg: `${CONTENT_MAX_WIDTH}px`,
};

/** Flex `direction` helper: stack on mobile, row from `sm` up. */
export const STACK_TO_ROW: StyleProp<CSSProperties['flexDirection']> = {
  base: 'column',
  sm: 'row',
};

/**
 * localStorage key for the color scheme. ONE constant, consumed by both
 * `<ColorSchemeScript />` and `<MantineProvider>` in root.tsx.
 *
 * If those two ever disagree, the pre-hydration script reads a different key
 * than React writes, so the toggle appears to work and then resets on reload —
 * the single most common dark-mode bug. Never inline this string.
 */
export const COLOR_SCHEME_STORAGE_KEY = 'sshs-ocw-color-scheme';

/**
 * GitHub-style streak heatmap ramp, indexed by activity bucket (0 = no activity).
 *
 * The light ramp is the existing one, moved here from Profile.tsx. It carries its
 * meaning almost entirely in HUE (yellow → orange → salmon → pink) while holding
 * lightness nearly flat at ~67-73%. That works on white and fails on dark twice
 * over: the `gray-3` empty cell becomes a glowing near-white block covering a
 * whole year, and the four warm stops converge to the same apparent brightness,
 * so the ramp stops communicating magnitude at all.
 *
 * The dark ramp holds the same four hues (40°/29°/8°/343° against the light
 * ramp's 45°/26°/1°/343°) but makes LUMINANCE carry the ordering, stepping in
 * even increments — relative luma ≈ 92 → 125 → 158 → 188. Desaturate it to
 * grayscale and the five stops still read as five distinct steps, which is the
 * test that matters.
 */
export const STREAK_COLORS = {
  light: [
    'var(--mantine-color-gray-3)',
    '#FFD459',
    '#FFAA69',
    '#FF7C79',
    '#FF5F84',
  ],
  dark: [
    // One shade above the page background, so empty cells recede instead of glowing.
    'var(--mantine-color-dark-6)',
    '#7A5A1A',
    '#B87333',
    '#F08A7A',
    '#FFA8C0',
  ],
} as const;

/**
 * Pick the streak ramp for the resolved scheme.
 *
 * Callers must pass the result of `useComputedColorScheme()`, NOT
 * `useMantineColorScheme().colorScheme` — the latter can be the literal string
 * `'auto'`, which is not a scheme and would silently fall through to the light
 * ramp for every auto user.
 */
export function getStreakColors(scheme: 'light' | 'dark'): readonly string[] {
  return STREAK_COLORS[scheme];
}
