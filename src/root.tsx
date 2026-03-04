import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css'
import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useOutletContext } from "react-router";
import { http } from "./libs/http";
import { Notifications } from '@mantine/notifications'
import { userSchema, type User } from "./libs/types";
import ErrorPage from './error/ErrorPage';

const theme = createTheme({
  fontFamily: 'Pretendard, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
});

export function Layout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>SSHS TIPS</title>
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
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

type RootContext = { user: User | null };

export async function clientLoader() {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`)
    const parsed = userSchema.safeParse(res.data)
    if (!parsed.success) throw new Error();
    return { user: parsed.data }
  } catch (err) {
    return { user: null }
  }
}

export default function Root() {
  const { user } = useLoaderData<typeof clientLoader>();

  return (
    <Outlet context={{ user } satisfies RootContext} />
  );
}

export function useUserContext() {
  return useOutletContext<RootContext>();
}

export function ErrorBoundary() {
  return (
    <ErrorPage />
  )
}