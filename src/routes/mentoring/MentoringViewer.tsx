import { useLoaderData, Link, type LoaderFunctionArgs, redirect } from 'react-router'
import { ScrollArea, Stack, Group, Image, Title, Text, Badge, Button, Paper, SimpleGrid, Anchor, ActionIcon } from '@mantine/core'
import { IconFile, IconKey, IconPencil } from '@tabler/icons-react'
import MainPageAppshell from '../../components/appshell/MainPageAppshell'
import MentoringViewerBody from '../../components/mentoring/MentoringViewerBody'
import { mentoringResponseSchema, permissionCheckSchema, type Mentoring } from '../../libs/types'
import { http } from '../../libs/http'
import { tryParseJSON } from '../../libs/utils'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const [mentoringRes, permRes] = await Promise.all([
    http.get(`${import.meta.env.VITE_API_URL}/api/mentoring/${params.mentoringId}`),
    http.get(`${import.meta.env.VITE_API_URL}/api/permission/check/${params.mentoringId}`).catch(() => ({ data: { canEdit: false, role: null } })),
  ])
  console.log(mentoringRes.data)
  const raw = mentoringResponseSchema.safeParse(mentoringRes.data)
  console.log(raw.success)
  if (!raw.success) throw redirect('/');
  const mentoring: Mentoring = {
    ...raw.data,
    content: tryParseJSON<object>(raw.data.content) ?? {},
  }
  const permission = permissionCheckSchema.parse(permRes.data)
  return { mentoring, canEdit: permission.canEdit, role: permission.role }
}


export default function MentoringViewer() {
  const { mentoring, canEdit, role } = useLoaderData<typeof clientLoader>()

  return (
    <MainPageAppshell>
      <ScrollArea h="100%">
        <Stack w="70%" mx="auto" py="xl">
          <Group align="flex-start" gap="xl">
            <Image src={mentoring.image_url} w={180} radius={8} />
            <Stack flex={1} gap="xs">
              <Group justify="space-between">
                <Title order={1}>{mentoring.title}</Title>
                <Stack gap="xs" align="center">
                  {canEdit && (
                    <ActionIcon variant="subtle" size="lg" component={Link} to={`/mentoring/${mentoring._id}/edit`}>
                      <IconPencil />
                    </ActionIcon>
                  )}
                  {(role === "admin" || role === "owner") && (
                    <ActionIcon variant="subtle" size="lg" component={Link} to={`/mentoring/${mentoring._id}/access`}>
                      <IconKey />
                    </ActionIcon>
                  )}
                </Stack>
              </Group>
              <Text c="dimmed">{mentoring.description}</Text>
              <Group gap="xs">
                {mentoring.tags.map(tag => (
                  <Badge key={tag} variant="light">{tag}</Badge>
                ))}
              </Group>
              <Text size="sm">멘토: {mentoring.createdBy.join(', ')}</Text>
              <Text size="xs" c="dimmed">생성: {mentoring.createdAt.toLocaleDateString('ko-KR')}</Text>
              <Text size="xs" c="dimmed">수정: {mentoring.updatedAt.toLocaleDateString('ko-KR')}</Text>
              {mentoring.registration && (
                <Button
                  component="a"
                  href={mentoring.registration}
                  target="_blank"
                  rel="noopener noreferrer"
                  w="fit-content"
                >
                  수강 신청
                </Button>
              )}
            </Stack>
          </Group>

          <MentoringViewerBody mentoring={mentoring} />

          {mentoring.files.length > 0 && (
            <Stack gap="xs">
              <Title order={4}>첨부 파일</Title>
              <SimpleGrid cols={3}>
                {mentoring.files.map((file, i) => (
                  <Anchor key={i} href={file.url} target="_blank" rel="noopener noreferrer" underline="never">
                    <Paper p="md" withBorder>
                      <Group gap="sm">
                        <IconFile size={32} color="var(--mantine-color-blue-6)" />
                        <Text lineClamp={1} size="sm">{file.name}</Text>
                      </Group>
                    </Paper>
                  </Anchor>
                ))}
              </SimpleGrid>
            </Stack>
          )}
        </Stack>
      </ScrollArea>
    </MainPageAppshell>
  )
}
