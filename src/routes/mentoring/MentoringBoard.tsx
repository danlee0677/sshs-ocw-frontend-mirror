import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Card, Container, Group, Image, Pagination, Pill, ScrollArea, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import z from "zod";
import { http } from "../../libs/http";
import { mentoringBoardSchema, type MentoringBoard } from "../../libs/types";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";

const PAGE_SIZE = 6;

export async function clientLoader() {
  const res = await http.get(`${import.meta.env.VITE_API_URL}/api/mentoring`);
  const parsed = z.array(mentoringBoardSchema).safeParse(res.data);
  
  if (!parsed.success) throw new Error("멘토링 목록을 불러오는 데 실패했습니다.");
  return { mentorings: parsed.data };
}

export default function MentoringBoardPage() {
  const { mentorings } = useLoaderData<typeof clientLoader>();
  return (
    <MainPageAppshell>
      <ScrollArea w="100%" h="100%">
        {/* Bare Container, no `size`: root.tsx sets the default to CONTENT_MAX_WIDTH
            (1200); size="lg" would silently mean 1140. Before this, the grid was
            `w="80%"` of an UNCAPPED viewport, so on a 1920px screen it ran to
            ~1536px while Home, Profile, SubjectViewer and SearchResult all stopped
            at 1200 — invisible on a laptop, obvious side by side on a wide screen.
            No h="100%": ScrollArea's viewport wrapper is `display: table` with no
            definite height, so a percentage height would resolve to `auto` anyway. */}
        <Container w="100%">
          <MentoringBoardContent mentorings={mentorings} />
        </Container>
      </ScrollArea>
    </MainPageAppshell>
  );
}

function MentoringBoardContent({ mentorings }: { mentorings: MentoringBoard[] }) {
  const [page, setPage] = useState(1);
  const paginated = mentorings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    /* p="xl" is 32px a side — 18% of a 360px screen. */
    <Stack align="center" w="100%" p={{ base: 'sm', sm: 'xl' }}>
      <Title fz={{ base: 'h2', sm: 'h1' }}>오프라인 멘토링</Title>
      {mentorings.length === 0 ? (
        <Text c="dimmed">등록된 멘토링이 없습니다.</Text>
      ) : (
        <>
          {/* Was cols={2} w="80%": two columns give each card ~150px on a phone.
              The width now comes from the Container above, so the 80% is gone —
              a percentage inside a capped Container is a gutter inside a gutter. */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" w="100%">
            {paginated.map((m) => (
              <Card key={m._id} component={Link} to={`/mentoring/${m._id}`} withBorder>
                <Card.Section>
                  {/* fit="cover": without it the intrinsic ratio wins and cards in
                      the same row get visibly different image blocks. */}
                  <Image src={m.image_url} h={160} fit="cover" />
                </Card.Section>
                <Title order={3} mt="sm">{m.title}</Title>
                <Text lineClamp={2} c="dimmed">{m.description}</Text>
                <Group mt="xs" gap="xs">
                  {m.tags.map((tag: string) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </Group>
              </Card>
            ))}
          </SimpleGrid>
          <Pagination
            total={Math.max(1, Math.ceil(mentorings.length / PAGE_SIZE))}
            value={page}
            onChange={setPage}
            mt="md"
          />
        </>
      )}
    </Stack>
  );
}
