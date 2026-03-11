import { useLoaderData, useFetcher, type LoaderFunctionArgs } from "react-router";
import { Title, Table, TextInput, Button, Group, ActionIcon, Text, ScrollArea, Stack, } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { http } from "../../libs/http";
import { permissionCheckSchema, permissionRecordSchema, userSchema, type PermissionRecord, } from "../../libs/types";
import { AxiosError } from "axios";
import z from "zod";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const userParsed = userSchema.safeParse(userRes.data);
    if (!userParsed.success) throw new Response("Not Logged in", { status: 401 });

    const subjectId = params.subjectId;

    const permCheckRes = await http.get(
      `${import.meta.env.VITE_API_URL}/api/permission/check/${subjectId}`
    );
    const permCheckParsed = permissionCheckSchema.safeParse(permCheckRes.data);
    if (!permCheckParsed.success || !permCheckParsed.data.canEdit)
      throw new Response("No permission to manage this subject", { status: 403 });

    const permListRes = await http.get(
      `${import.meta.env.VITE_API_URL}/api/permission/subject/${subjectId}`
    );

    const permListParsed = z.array(permissionRecordSchema).safeParse(permListRes.data);
    if (!permListParsed.success) throw new Error("Failed to parse permission list from server");

    return {
      permissions: permListParsed.data,
      userRole: permCheckParsed.data.role,
      subjectId: subjectId as string,
    };
  } catch (err) {
    if (err instanceof Response) throw err;
    if (err instanceof AxiosError && err.status === 401)
      throw new Response("Not Logged in", { status: 401 });
    throw err;
  }
}

function RemoveButton({ permissionId }: { permissionId: string }) {
  const fetcher = useFetcher();
  const isRemoving = fetcher.state !== "idle";

  return (
    <ActionIcon
      variant="subtle"
      color="red"
      loading={isRemoving}
      onClick={() =>
        fetcher.submit(
          { permissionId },
          { method: "delete", action: "/action/subject/access" }
        )
      }
    >
      <IconTrash size={16} />
    </ActionIcon>
  );
}

export default function SubjectAccess() {
  const { permissions, userRole, subjectId } = useLoaderData<typeof clientLoader>();
  const addFetcher = useFetcher<{ error?: string; ok?: boolean }>();
  const isAdding = addFetcher.state !== "idle";

  const canManage = userRole === "admin" || userRole === "owner";

  return (
    <MainPageAppshell>
      <ScrollArea w="100%" h="100%">
        <Stack align="center" p="md">
          <Stack w="80%">
            <Title order={2} mb="lg">
              권한 관리
            </Title>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>사용자</Table.Th>
                  <Table.Th>역할</Table.Th>
                  {canManage && <Table.Th w={48} />}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {permissions.map((p: PermissionRecord) => (
                  <Table.Tr key={p._id}>
                    <Table.Td>{p.username ?? p.userId}</Table.Td>
                    <Table.Td>{p.role === "owner" ? "소유자" : "편집자"}</Table.Td>
                    {canManage && (
                      <Table.Td>
                        {p.role === "editor" && <RemoveButton permissionId={p._id} />}
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
                {permissions.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={canManage ? 3 : 2}>
                      <Text c="dimmed" fz="sm" ta="center">
                        권한 정보가 없습니다.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>

            {canManage && (
              <addFetcher.Form
                method="post"
                action="/action/subject/access"
              >
                <input type="hidden" name="subjectId" value={subjectId} />
                <Group mt="lg" align="flex-start">
                  <TextInput
                    name="userId"
                    placeholder="추가할 사용자 ID"
                    maxLength={64}
                    defaultValue=""
                    error={addFetcher.data?.error}
                  />
                  <Button type="submit" loading={isAdding}>
                    편집자 추가
                  </Button>
                </Group>
              </addFetcher.Form>
            )}
          </Stack>
        </Stack>
      </ScrollArea>
    </MainPageAppshell>
  );
}
