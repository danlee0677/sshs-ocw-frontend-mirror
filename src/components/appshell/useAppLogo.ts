import { useComputedColorScheme } from '@mantine/core';
import logoLight from '@/assets/app-logo.png';
import logoDark from '@/assets/app-logo-dark.png';

/**
 * Returns the app logo matching the CURRENT color scheme.
 *
 * `useComputedColorScheme`, never `useMantineColorScheme().colorScheme`: the
 * latter returns the literal string `'auto'` when the user has picked auto, which
 * is not a scheme and would silently fall through to the light logo on a dark
 * page. Only the computed value resolves what is actually on screen. This is the
 * same trap documented in ColorSchemeToggle.tsx.
 *
 * `getInitialValueInEffect: false` reads synchronously on first render, so the
 * logo does not paint light and then snap to dark. Safe here because this app is
 * a SPA and neither appshell appears in the prerendered shell — only root.tsx
 * does. A CSS swap (rendering both images and hiding one per scheme) would also
 * work and would apply pre-JS, but it costs a second image download and the
 * appshells already depend on JS to render at all.
 *
 * Lives in its own module rather than alongside a component: a hook exported from
 * a file that also exports components trips `react-refresh/only-export-components`.
 * `src/libs/useUserContext.ts` exists for the same reason — it used to be exported
 * from root.tsx and was the last such error in the lint baseline before it was
 * moved out.
 */
export function useAppLogo(): string {
  const scheme = useComputedColorScheme('light', { getInitialValueInEffect: false });
  return scheme === 'dark' ? logoDark : logoLight;
}
