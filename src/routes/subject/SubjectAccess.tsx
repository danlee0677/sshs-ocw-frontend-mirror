import { useState } from "react";
import { useLoaderData, useFetcher, type LoaderFunctionArgs } from "react-router";
import { Title, Table, TextInput, Button, Group, ActionIcon, Text, Stack, Container, } from "@mantine/core";
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
      } catch {
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
      {/* `miw` ships with `flex` deliberately: flex={1} is `flex: 1 1 0%`, and
          a flex-basis of 0 means the line never breaks — the input would shrink
          to a sliver instead of the button wrapping below it. */}
      <Group align="flex-start" wrap="wrap">
        <TextInput
          placeholder="이전할 사용자 ID"
          maxLength={64}
          value={toUserId}
          onChange={(e) => setToUserId(e.currentTarget.value)}
          error={fetcher.data?.error}
          flex={1}
          miw={200}
        />
        <Button
          color="red"
          loading={isTransferring}
          disabled={!toUserId.trim()}
          onClick={handleTransfer}
          w={{ base: '100%', xs: 'auto' }}
        >
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
      {/* Was `<Stack align="center" p="md"><Stack w="80%">` — 80% of an
        * UNCAPPED viewport, character-for-character the defect the follow-up
        * pass fixed on SearchResult and SubjectViewer and Prompt 16 fixed on
        * both mentoring pages. Bare <Container>, no `size` prop; `py`, not
        * `p`, because the Container supplies `px` itself. */}
      <Container w="100%" py="md">
        <Stack w="100%">
          <Title order={2} mb="lg">
            권한 관리
          </Title>

          {/* minWidth 480, not the 320 the plan suggested: four columns, one
            * of which holds a 24-character Mongo ObjectId AND a copy button
            * in the same cell. 320 would still clip. Compare OrderTable's
            * 420 and SearchResult's 340 — the number tracks the content. */}
          <Table.ScrollContainer minWidth={480}>
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
                  {/* was `canManage ? 3 : 2` — off by one against this table's
                      own header, which is 4 columns when canManage and 3
                      otherwise, so the empty-state row under-spanned and its
                      centred text sat off-centre. MentoringAccess, which is
                      otherwise byte-identical, already had it right. */}
                  <Table.Td colSpan={canManage ? 4 : 3}>
                    <Text c="dimmed" fz="sm" ta="center">
                      권한 정보가 없습니다.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          </Table.ScrollContainer>

          {canManage && (
            <addFetcher.Form
              method="post"
              action="/action/subject/access"
            >
              <input type="hidden" name="subjectId" value={subjectId} />
              <Group mt="lg" align="flex-start" wrap="wrap">
                <TextInput
                  name="userId"
                  placeholder="추가할 사용자 ID"
                  maxLength={64}
                  defaultValue=""
                  error={addFetcher.data?.error}
                  flex={1}
                  miw={200}
                />
                <Button type="submit" loading={isAdding} w={{ base: '100%', xs: 'auto' }}>
                  편집자 추가
                </Button>
              </Group>
            </addFetcher.Form>
          )}

          {userRole === "owner" && <TransferOwnershipSection subjectId={subjectId} />}
        </Stack>
      </Container>
    </MainPageAppshell>
  );
}
