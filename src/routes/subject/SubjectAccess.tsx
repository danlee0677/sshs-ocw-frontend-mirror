import { useState } from "react";
import { useLoaderData, useFetcher, type LoaderFunctionArgs } from "react-router";
import { Title, Table, TextInput, Button, Group, ActionIcon, Text, ScrollArea, Stack, } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCopy, IconCopyCheck, IconTrash } from "@tabler/icons-react";
import { http } from "../../libs/http";
import { permissionCheckSchema, permissionRecordSchema, userSchema, type PermissionRecord, } from "../../libs/types";
import { AxiosError } from "axios";
import z from "zod";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { notifications } from "@mantine/notifications";

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
      throw new Response("No permission to manage this subject", { status: 403 })

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

function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if ('clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        notifications.show({
          title: "복사되었습니다!",
          message: "사용자 식별자를 복사했습니다!",
          autoClose: 3000,
          position: "bottom-center",
        })
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (error) {
        notifications.show({
          title: "복사 실패!",
          message: "사용자 식별자 복사를 실패하였습니다.",
          autoClose: 5000,
          position: "bottom-center"
        })
      }
    } else {
      notifications.show({
        title: "클립보드 미지원",
        message: "클립보드를 지원하지 않는 브라우저입니다.",
        autoClose: 5000,
        position: "bottom-center",
      })
    }
  };

  return (
    <Button onClick={handleCopy} style={{ backgroundColor: 'transparent', border: 'none', padding: 0, boxShadow: 'none', color: 'inherit', outline: 'none' }}>
      {isCopied ? <IconCopyCheck size={20} /> : <IconCopy size={20} />}
    </Button>
  );
};


function TransferOwnershipSection({ subjectId }: { subjectId: string }) {
  const [toUserId, setToUserId] = useState("");
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>();
  const isTransferring = fetcher.state !== "idle";

  function handleTransfer() {
    modals.openConfirmModal({
      title: "소유권 이전",
      children: (
        <Text size="sm">
          소유권을 <strong>{toUserId}</strong>에게 이전하면 되돌릴 수 없습니다.
          계속하시겠습니까?
        </Text>
      ),
      labels: { confirm: "이전", cancel: "취소" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        fetcher.submit(
          { subjectId, to: toUserId },
          { method: "patch", action: "/action/subject/access" }
        );
      },
    });
  }

  return (
    <Stack mt="xl">
      <Title order={4}>소유권 이전</Title>
      <Group align="flex-start">
        <TextInput
          placeholder="이전할 사용자 ID"
          maxLength={64}
          value={toUserId}
          onChange={(e) => setToUserId(e.currentTarget.value)}
          error={fetcher.data?.error}
        />
        <Button color="red" loading={isTransferring} disabled={!toUserId.trim()} onClick={handleTransfer}>
          소유권 이전
        </Button>
      </Group>
    </Stack>
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
                  <Table.Th>사용자 ID</Table.Th>
                  <Table.Th>역할</Table.Th>
                  {canManage && <Table.Th w={48} />}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {permissions.map((p: PermissionRecord) => (
                  <Table.Tr key={p._id}>
                    <Table.Td>{p.username}</Table.Td>
                    <Table.Td>
                      <Group p="0" gap="5">
                        {p.userId}
                        <CopyButton text={p.userId} />
                      </Group>
                    </Table.Td>
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

            {userRole === "owner" && <TransferOwnershipSection subjectId={subjectId} />}
          </Stack>
        </Stack>
      </ScrollArea>
    </MainPageAppshell>
  );
}
