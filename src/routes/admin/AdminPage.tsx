import { useState } from "react";
import { useFetcher } from "react-router";
import { Title, TextInput, Button, Group, Container, Stack } from "@mantine/core";
import { http } from "../../libs/http";
import { userSchema } from "../../libs/types";
import { AxiosError } from "axios";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";

export async function clientLoader() {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const parsed = userSchema.safeParse(res.data);
    if (!parsed.success) throw new Response("Not Logged in", { status: 401 });
    if (!parsed.data.roles.includes("admin"))
      throw new Response("Forbidden", { status: 403 });
    return { user: parsed.data };
  } catch (err) {
    if (err instanceof Response) throw err;
    if (err instanceof AxiosError && err.status === 401)
      throw new Response("Not Logged in", { status: 401 });
    throw err;
  }
}

export default function AdminPage() {
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>();
  const isLoading = fetcher.state !== "idle";
  const [formKey, setFormKey] = useState(0);

  // `formKey` remounts the uncontrolled form to clear it after a SUCCESSFUL
  // submit. This was a useEffect calling setFormKey synchronously — a genuine
  // cascading render, and the `react-hooks/set-state-in-effect` error in the
  // lint baseline.
  //
  // Adjusted DURING RENDER, not in an effect: the React-documented derived
  // state pattern, the same one Defect B shipped in SearchResult. React
  // discards this render and re-runs before committing, so the intermediate
  // state is never painted. Comparing against the PREVIOUS `fetcher.data` is
  // what confines it to an actual transition — keying off `.ok` alone would
  // re-fire on every unrelated re-render while the last result is still in
  // hand, remounting the form under the user's cursor.
  const [prevData, setPrevData] = useState(fetcher.data);
  if (fetcher.state === "idle" && fetcher.data !== prevData) {
    setPrevData(fetcher.data);
    if (fetcher.data?.ok) setFormKey((k) => k + 1);
  }

  return (
    <MainPageAppshell>
      {/* Was `<Box p="md" w="100%">` — content at 100% of an UNCAPPED
        * viewport, the last page in the app without a cap. Bare
        * <Container>, no `size` prop: the theme default is
        * CONTENT_MAX_WIDTH (1200); `size="lg"` would silently mean 1140.
        * `py`, not `p` — the Container's own `px: 'md'` supplies the
        * horizontal half, and leaving `p` would double it. `justify="center"`
        * dropped from the Stack: with content-sized children and no definite
        * height it centres nothing. */}
      <Container w="100%" py="md">
        <Stack w="100%">
          <Title order={2} mb="lg">
            관리자 페이지
          </Title>

          <fetcher.Form key={formKey} method="post" action="/action/admin/roles">
            {/* `wrap="wrap"` is Mantine's default, stated explicitly because
              * the default alone does not survive a `flex` on a child: the
              * `flex={1}` below resolves to `flex: 1 1 0%`, and a flex-basis
              * of 0 means the LINE NEVER BREAKS — the item shrinks toward
              * zero instead of wrapping. That is the MentoringViewer defect
              * from Prompt 16. `miw={200}` is what makes the wrap actually
              * happen, so the two ship together. */}
            <Group align="flex-start" wrap="wrap">
              <TextInput
                name="userId"
                placeholder="사용자 ID"
                maxLength={64}
                error={fetcher.data?.error}
                flex={1}
                miw={200}
              />
              <Button
                type="submit"
                name="intent"
                value="grant"
                loading={isLoading}
                w={{ base: '100%', xs: 'auto' }}
              >
                Creator 부여
              </Button>
              <Button
                type="submit"
                name="intent"
                value="revoke"
                loading={isLoading}
                color="red"
                variant="light"
                w={{ base: '100%', xs: 'auto' }}
              >
                Creator 제거
              </Button>
            </Group>
          </fetcher.Form>
        </Stack>
      </Container>
    </MainPageAppshell>
  );
}
