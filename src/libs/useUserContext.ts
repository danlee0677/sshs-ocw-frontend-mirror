import { useOutletContext } from "react-router";
import type { User } from "./types";

/**
 * The context root.tsx hands to every route through `<Outlet context={…} />`.
 *
 * Declared here rather than in root.tsx so the hook below and its type travel
 * together, and so the dependency points from the route module to this one
 * instead of the other way round — see the note on `useUserContext`.
 */
export type RootContext = { user: User | null };

/**
 * The current user, as resolved by root.tsx's `clientLoader` (`/api/auth/verify`).
 * `null` means logged out, including when the verify call failed.
 *
 * Lives in its own module rather than in root.tsx, for the same reason
 * `useAppLogo` does: a hook exported from a file that also exports components
 * trips `react-refresh/only-export-components`, and unlike `clientLoader` that
 * is a genuine Fast Refresh flag rather than a React Router convention, so it is
 * deliberately outside eslint.config.js's allow-list. It also stopped ten files
 * from importing root.tsx — and with it the whole
 * MantineProvider/ColorSchemeScript module graph — to reach three lines of hook.
 */
export function useUserContext() {
  return useOutletContext<RootContext>();
}
