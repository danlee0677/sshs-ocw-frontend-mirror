import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css'
import { ColorSchemeScript, createTheme, localStorageColorSchemeManager, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import { http } from "./libs/http";
import { Notifications } from '@mantine/notifications'
import { userSchema } from "./libs/types";
import type { RootContext } from "./libs/useUserContext";
import ErrorPage from './error/ErrorPage';
import LoadingPage from './loading/LoadingPage';
import { BREAKPOINTS, COLOR_SCHEME_STORAGE_KEY, CONTENT_MAX_WIDTH } from './libs/styles';

// Mantine persists the scheme itself. Do NOT hand-roll a cookie, a context, or a
// useEffect that syncs to localStorage — each one reintroduces the flash that
// ColorSchemeScript exists to prevent.
const colorSchemeManager = localStorageColorSchemeManager({
  key: COLOR_SCHEME_STORAGE_KEY,
});

const theme = createTheme({
  fontFamily: 'Pretendard, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  breakpoints: { ...BREAKPOINTS },
  // Mantine's default primary shade is tuned for light surfaces and is too dark
  // to read against a dark one. Setting it here fixes every Button, Anchor, Tabs
  // indicator and filled variant at once, instead of per-component later.
  primaryShade: { light: 6, dark: 4 },
  components: {
    Container: {
      defaultProps: { size: CONTENT_MAX_WIDTH, px: 'md' },
    },
  },
});

export function Layout({ children }: { children: React.ReactNode; }) {
  return (
    // lang="en"이었습니다. 화면의 모든 글자가 한국어인데 브라우저에는
    // 영어 문서라고 알려주고 있어서, 스크린리더가 영어 발음 규칙으로
    // 한국어를 읽으려 했습니다. 브라우저 번역과 검색엔진 색인에도 영향이 있습니다.
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <title>SSHS TIPS</title>
        {/* Placement is load-bearing. This emits a small blocking inline script
            that reads localStorage and stamps data-mantine-color-scheme onto
            <html> BEFORE first paint. Rendered after the stylesheet <Links />,
            or omitted, every dark-mode user gets a white flash on every load. */}
        <ColorSchemeScript
          defaultColorScheme='light'
          localStorageKey={COLOR_SCHEME_STORAGE_KEY}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* `defaultColorScheme='light'` is deliberate FOR THE DURATION of the
            migration, not a preference: ~90 light-assuming hardcoded colors are
            still spread across the CSS modules, so 'auto' would hand every
            OS-dark visitor a half-broken app for the whole project. Dark stays
            opt-in via the toggle, so the people seeing it are the ones testing
            it. Flip to 'auto' in Prompt 24, once the sweep is done.

            The storage key MUST match ColorSchemeScript's, hence the shared
            constant. MantineProvider has no `localStorageKey` prop — the key is
            configured through a colorSchemeManager, defined above. */}
        <MantineProvider
          theme={theme}
          defaultColorScheme='light'
          colorSchemeManager={colorSchemeManager}
        >
          <Notifications
            position='bottom-right'
            styles={{ root: { maxWidth: 'min(400px, calc(100vw - 32px))' } }}
          />
          <ModalsProvider>
            {children}
          </ModalsProvider>
        </MantineProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function clientLoader() {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`)
    const parsed = userSchema.safeParse(res.data)
    if (!parsed.success) throw new Error();
    return { user: parsed.data }
  } catch {
    // Deliberately swallows everything — network error, malformed response,
    // schema mismatch — and reports "logged out". Not logged: an anonymous
    // visitor 401s here on EVERY page load, and http.ts already logs the failed
    // refresh, so a console.error would be duplicated noise on the normal path.
    return { user: null }
  }
}

export function HydrateFallback() {
  return <LoadingPage />;
}

export default function Root() {
  const { user } = useLoaderData<typeof clientLoader>();

  return (
    <Outlet context={{ user } satisfies RootContext} />
  );
}

export function ErrorBoundary() {
  return (
    <ErrorPage />
  )
}