import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Card, Group, Image, Pagination, Pill, SimpleGrid, Stack, Text, Title } from "@mantine/core";
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
      <MentoringBoardContent mentorings={mentorings} />
    </MainPageAppshell>
  );
}

function MentoringBoardContent({ mentorings }: { mentorings: MentoringBoard[] }) {
  const [page, setPage] = useState(1);
  const paginated = mentorings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Stack align="center" w="100%" p="xl">
      <Title>오프라인 멘토링</Title>
      {mentorings.length === 0 ? (
        <Text c="dimmed">등록된 멘토링이 없습니다.</Text>
      ) : (
        <>
          <SimpleGrid cols={2} w="80%">
            {paginated.map((m) => (
              <Card key={m._id} component={Link} to={`/mentoring/${m._id}`} withBorder>
                <Card.Section>
                  <Image src={m.image_url} h={160} />
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
