import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Title, TextInput, Button, Group, Box, ScrollArea, Stack } from "@mantine/core";
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

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      setFormKey((k) => k + 1);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <MainPageAppshell>
      <ScrollArea w="100%" h="100%">
        <Box p="md" w="100%">
          <Stack justify="center" w="100%">
            <Title order={2} mb="lg">
              관리자 페이지
            </Title>

            <fetcher.Form key={formKey} method="post" action="/action/admin/roles">
              <Group align="flex-start">
                <TextInput
                  name="userId"
                  placeholder="사용자 ID"
                  maxLength={64}
                  error={fetcher.data?.error}
                />
                <Button type="submit" name="intent" value="grant" loading={isLoading}>
                  Creator 부여
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="revoke"
                  loading={isLoading}
                  color="red"
                  variant="light"
                >
                  Creator 제거
                </Button>
              </Group>
            </fetcher.Form>
          </Stack>
        </Box>
      </ScrollArea>
    </MainPageAppshell>
  );
}
