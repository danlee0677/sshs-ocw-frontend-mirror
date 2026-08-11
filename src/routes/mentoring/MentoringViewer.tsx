import { useLoaderData, Link, type LoaderFunctionArgs, redirect } from 'react-router'
import { ScrollArea, Stack, Group, Flex, Container, Image, Title, Text, Badge, Button, Paper, SimpleGrid, Anchor, ActionIcon } from '@mantine/core'
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
      <ScrollArea w="100%" h="100%">
        {/* Was `<Stack w="70%" mx="auto">`, which was wrong at both ends: 70% of a
            360px phone is 252px (~12 Korean characters a line — the same number
            Prompt 12 fixed on LessonViewerBody), and 70% of a 1920px screen is
            1344px, past the 1200 cap every other content page stops at. A bare
            Container fixes both; no `size` prop, per the theme default. */}
        <Container w="100%" py="xl">
          <Stack w="100%">
            {/* Flex, not Group. Group already defaults to wrap="wrap", so it LOOKS
                like it stacks and does not: the Stack below carries flex={1} →
                `flex: 1 1 0%`, and a flex-basis of 0 means the item always "fits",
                so the line never breaks. At 320px that left a 180px image, a 32px
                gap and ~108px of text. Flex is also required because Group's
                align/justify are plain scalars and reject responsive objects. */}
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'center', sm: 'flex-start' }}
              gap={{ base: 'md', sm: 'xl' }}
            >
              <Image src={mentoring.image_url} w={{ base: 140, sm: 180 }} radius={8} />
              <Stack flex={1} gap="xs" miw={0}>
                {/* align="flex-start" so the icon column tops out with the title
                    rather than centring against a wrapped three-line one. */}
                <Group justify="space-between" align="flex-start" gap="xs">
                  <Title order={1} fz={{ base: 'h3', sm: 'h1' }}>{mentoring.title}</Title>
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
            </Flex>

            <MentoringViewerBody mentoring={mentoring} />

            {mentoring.files.length > 0 && (
              <Stack gap="xs">
                <Title order={4}>첨부 파일</Title>
                {/* Three file cards at 320px is ~100px each, and the filename
                    lineClamp={1} would clamp to a glyph or two. */}
                <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>
                  {mentoring.files.map((file, i) => (
                    <Anchor key={i} href={file.url} target="_blank" rel="noopener noreferrer" underline="never">
                      <Paper p="md" withBorder>
                        <Group gap="sm" wrap="nowrap">
                          {/* Was blue-6 — a token, so it passed the Color contract's
                              letter, but Prompt 3 shipped primaryShade { light: 6,
                              dark: 4 }, so every other accent steps LIGHTER in dark
                              and this one did not. --mantine-primary-color-filled
                              resolves through primaryShade and follows. It stays a
                              plain var(): light-dark() would not compile in a prop. */}
                          {/* flexShrink: 0 — index.css's fluid-media rule deliberately
                              excludes svg, so nothing else stops this icon collapsing
                              next to a long filename. */}
                          <IconFile size={32} color="var(--mantine-primary-color-filled)" style={{ flexShrink: 0 }} />
                          {/* miw={0}: a flex item will not shrink below its intrinsic
                              width, so lineClamp cannot engage without this. */}
                          <Text lineClamp={1} size="sm" miw={0}>{file.name}</Text>
                        </Group>
                      </Paper>
                    </Anchor>
                  ))}
                </SimpleGrid>
              </Stack>
            )}
          </Stack>
        </Container>
      </ScrollArea>
    </MainPageAppshell>
  )
}
