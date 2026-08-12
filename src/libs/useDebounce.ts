import { useCallback, useEffect, useRef } from "react";

/**
 * Debounce that cannot resurrect a draft the submit action just deleted.
 *
 * Shared by LessonEditor and MentoringEditor. It lived, byte-identical, inside
 * both of them until the lint cleanup; the second copy's comment was a pointer
 * to the first. The bug documented below was found and fixed twice for that
 * reason, which is the argument for it living here.
 *
 * THE BUG THIS FIXES. `clientAction` removes the three localStorage keys on a
 * successful create/edit and then redirects — but the draft came back anyway,
 * so `/lesson/create` reopened the "저장된 초안이 있습니다" modal on the next
 * visit. Two defects in the old four-line version combined to guarantee it:
 *
 *  1. NO IDENTITY STABILITY. `fn` is an inline arrow at every call site, so it
 *     is a new function on every render; with `fn` in the useCallback deps the
 *     returned debouncer was new on every render too. `debounceMetaSave` is a
 *     dependency of a useEffect, so that effect re-ran after EVERY render and
 *     re-armed an 800ms timer each time — including the extra renders that
 *     submitting itself causes as `navigation.state` moves idle → submitting →
 *     loading. The last of those lands after the action has already cleared the
 *     keys.
 *  2. NO CLEANUP. The pending `setTimeout` was never cleared on unmount, so it
 *     survived the redirect and wrote to localStorage from a dead component.
 *
 * Net effect: every successful create re-created the meta key ~800ms after the
 * action deleted it, and `hasCached` in the route loader only needs ONE of the
 * three keys to be non-null.
 *
 * The fix keeps the deps to `[delay]` so the debouncer is referentially stable,
 * holds the newest `fn` in a ref so a stable identity does not mean a stale
 * closure, and clears any pending timer on unmount. The ref is assigned in an
 * effect, never during render, because assigning during render is the thing
 * `react-hooks/immutability` is actually there to catch.
 *
 * The "latest ref" split matters for the guard in the save bodies at the call
 * sites: ARGS are captured when the debounced call was made (the payload the
 * user typed), but the CLOSURE is the current one, so the timer sees today's
 * `isSubmitting` rather than its value 800ms ago.
 *
 * WHY THE GENERIC IS SHAPED LIKE THIS. It infers the parameter TUPLE rather
 * than constraining the function type. The obvious alternative,
 * `<T extends (...args: unknown[]) => void>`, rejects every real call site:
 * `strict` implies `strictFunctionTypes`, so a function type expression's
 * parameters are compared contravariantly, and `(markdown: string) => void` is
 * not assignable to `(...args: unknown[]) => void` — the check becomes
 * `unknown → string`. Inferring `Args` from the callback's own annotated
 * parameters sidesteps that, and each call site keeps its real argument type
 * instead of falling back to `unknown`.
 */
export function useDebounce<Args extends unknown[]>(fn: (...args: Args) => void, delay: number) {
  const timeout = useRef<number | null>(null);
  const latest = useRef(fn);

  useEffect(() => {
    latest.current = fn;
  });

  useEffect(() => () => {
    if (timeout.current !== null) window.clearTimeout(timeout.current);
  }, []);

  return useCallback((...args: Args) => {
    if (timeout.current !== null) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => latest.current(...args), delay);
  }, [delay]);
}
