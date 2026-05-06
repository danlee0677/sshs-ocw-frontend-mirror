import { Box, Button, Flex, Group, Image, Pagination, ScrollArea, Select, Space, Stack, Table, Text, Title } from "@mantine/core";
import { recentViewSchema, streakSchema, type Streak, type User } from "../../libs/types";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { useUserContext } from "../../root";
import { http } from "../../libs/http";
import classes from "./Profile.module.css"
import { useState } from "react";
import { calculateCurrentStreak, calculateMaxStreak, PLACEHOLDER_USER } from "../../libs/utils";
import z from "zod";
import { linkStyle } from "../../libs/styles";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";
import { StreakBody } from "../../components/streak/StreakBody";
import { CustomBadge } from "../../components/badge/custombadge";

const SubjectResponseSchema = z.array(z.object({
  title: z.string(),
  _id: z.string(),
  description: z.string(),
  image_url: z.string(),
}))

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const pageUserId = params.pageUserId;
    if (!pageUserId) throw new Response("Cannot find user id to display", { status: 404 });

    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/user/${pageUserId}`);
    const userParsed = z.object({
      username: z.string(),
      pfp_url: z.string(),
      description: z.string(),
    }).safeParse(userRes.data);

    if (!userParsed.success) throw new Error("Failed to parse user from server");

    const retUser: User = {
      ...PLACEHOLDER_USER,
      _id: pageUserId,
      pfp_url: userParsed.data.pfp_url,
      username: userParsed.data.username,
      description: userParsed.data.description,
    }

    const [likedRes, progressRes, streakRes] = await Promise.all([
      http.get(`${import.meta.env.VITE_API_URL}/api/subjects/liked/${pageUserId}`),
      http.get(`${import.meta.env.VITE_API_URL}/api/progress/${pageUserId}`),
      http.get(`${import.meta.env.VITE_API_URL}/api/streak/${pageUserId}`)
    ])

    const likedParsed = SubjectResponseSchema.safeParse(likedRes.data);
    if (!likedParsed.success) throw new Response("Failed to parse liked subjects from server", { status: 400 });

    const progressParsed = z.array(recentViewSchema).safeParse(progressRes.data);
    if (!progressParsed.success) throw new Response("Failed to parse progress from server", { status: 400 });

    const streakParsed = z.array(streakSchema).safeParse(streakRes.data);
    if (!streakParsed.success)
      throw new Response("Failed to get streak from server", { status: 400 });

    return { pageUser: retUser, viewed: progressParsed.data, likedSubjects: likedParsed.data, streak: streakParsed.data };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw err;
  }
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

export default function Profile() {
  const { pageUser, viewed, likedSubjects, streak } = useLoaderData<typeof clientLoader>();
  const { user } = useUserContext();

  const [likedSubjectPage, setLikedSubjectPage] = useState(1);
  const [viewedPage, setViewedPage] = useState<number>(1);

  const likedSubjectPageCnt = 5; // show this amount of subjects for a page(liked subjects)
  const viewedPageCnt = 5;

  const currentYear = new Date().getFullYear();
  const earliestYear = streak.length > 0 ? Math.min(...streak.map(s => s.year)) : currentYear;
  const yearOptions = Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => String(earliestYear + i));

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const displayStreak: Streak = streak.find(s => s.year === selectedYear) ?? {
    userId: pageUser._id,
    days: {},
    year: selectedYear,
    _id: "",
  };

  const currentStreak = calculateCurrentStreak(streak);
  const maxStreak = calculateMaxStreak(streak);

  const allCounts = Object.values(displayStreak.days)
  const maxActivity = allCounts.length > 0 ? Math.max(...allCounts) : 0
  const t1 = maxActivity > 0 ? Math.ceil(maxActivity / 4) : 0
  const t2 = maxActivity > 0 ? Math.ceil((2 * maxActivity) / 4) : 0
  const t3 = maxActivity > 0 ? Math.ceil((3 * maxActivity) / 4) : 0
  
  const threshold = [0, t1, t2, t3, maxActivity];
  const colors = ['var(--mantine-color-gray-3)','#FFD459', '#FFAA69', '#FF7C79', '#FF5F84']

  const displayThreshold = (maxActivity === 0 ? [0] : [1]).concat(threshold.slice(1));

  return (
    <MainPageAppshell>
      <ScrollArea h="100%" w="100%">
        <Box h="100%" w="100%" px="md">
          <Flex w={'100%'} align={'center'} justify={'center'}>
            { /* 82dvh = total - header */}

            <Stack w="80%">
              <Space h={'10px'}></Space>
              <Group className={classes.ProfileBox} gap={'lg'} align={'flex-start'} p={'xl'} w={'100%'} h={'400px'} justify={'center'}>
                <Image w={'15%'} src={pageUser.pfp_url} />
                <Stack w={'35%'} h={'100%'} justify={'flex-start'} gap={0} p={'10px'}>
                  <Title m={0} className={classes.JalnanGothic}>{pageUser.username}</Title>
                  <Text fw={600}>{pageUser.description ?? "프로필 소개를 작성해보세요!"}</Text>
                  <Group gap={2}>
                    <Text>사용자 식별자: {pageUser._id}</Text>
                    <CopyButton text={pageUser._id} />
                  </Group>
                  <Space h="md" />
                  {user?._id === pageUser._id && (
                    <Button component={Link} to={`/profile/${pageUser._id}/edit`}>편집</Button>
                  )}
                </Stack>

                <Stack w={'40%'} h={'100%'} p={'lg'} align={'center'} gap={0} className={classes.BadgeArea}>
                    <Title order={3} className={classes.JalnanGothic}>보유 배지</Title> 
                    <ScrollArea w={'100%'} h={'100%'} className={classes.BadgeList}>
                    <Stack p={'xs'} gap={0}>
                      {user?.achievement.map((badgeId) => (
                      <CustomBadge id={badgeId}></CustomBadge>
                      ))}
                    </Stack>
                  </ScrollArea>
                  <Text c={'gray'}>모두 보기</Text>
                </Stack>
              </Group> 
              <Space h="10px" />
              <Stack className={classes.GroupBox} w="100%">
                <Group justify="space-between" align="center">
                  <Group align="baseline" gap="sm">
                    <Title order={3}>학습 스트릭</Title>
                  </Group>
                  <Select
                    value={String(selectedYear)}
                    onChange={(v) => v && setSelectedYear(Number(v))}
                    data={yearOptions}
                    w={100}
                    allowDeselect={false}
                  />
                </Group>
                <Group gap="xl">
                  <Text fw={600}>현재 스트릭: <Text span fw={700} c="orange">{currentStreak}일</Text></Text>
                </Group>
                <StreakBody streak={displayStreak} threshold={threshold} colors={colors} />
                <Group justify="space-between">
                  <Group>
                    <Text fw={600}>최장 스트릭: <Text span fw={700} c="red">{maxStreak}일</Text></Text>
                  </Group>
                  <Group gap="xl" justify="flex-end" align="center">
                    {(colors.slice(1)).map((color, i) => (
                      <Group gap="6">
                        <Text size="sm" c="gray" fw={500}>{displayThreshold[i] === displayThreshold[i+1] ? displayThreshold[i] : `${displayThreshold[i]}-${displayThreshold[i+1]}`}</Text>
                        <div
                          className={classes.cell}
                          style={{ width: 20, height: 20, background: color }}
                        />
                      </Group>
                    ))}
                  </Group>
                </Group>
                <Text size="xs" c="dimmed">날짜는 KST 오전 06:00 기준으로 변경됩니다.</Text>
              </Stack>

              <Group w="100%" gap="md" justify="center" align="align-left">
                <Stack className={classes.GroupBox} w="45%">
                  <Title order={3} className={classes.JalnanGothic}>좋아요 한 과목</Title>
                  {likedSubjects.length === 0 ? <>
                    <Text>마음에 드는 강의에 좋아요를 눌러보세요!</Text>
                  </> : <>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>제목</Table.Th>
                          <Table.Th>설명</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {likedSubjects.slice((likedSubjectPage - 1) * likedSubjectPageCnt, likedSubjectPage * likedSubjectPageCnt).map((sub) => {
                          return <Table.Tr key={sub._id} h="50px">
                            <Table.Td><Link to={`/subject/${sub._id}`} style={linkStyle}>{sub.title}</Link></Table.Td>
                            <Table.Td>{sub.description}</Table.Td>
                          </Table.Tr>
                        })}
                      </Table.Tbody>
                    </Table>
                    <Group w="100%" justify="center">
                      <Pagination total={Math.max(1, Math.ceil(likedSubjects.length / likedSubjectPageCnt))}
                        value={likedSubjectPage} onChange={setLikedSubjectPage} />
                    </Group>
                  </>}
                </Stack>

                <Stack className={classes.GroupBox} w="50%" p={'xl'}>
                  <Title order={3} className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Title>
                  {viewed.length === 0 ? <>
                    <Text>이용한 강의가 없습니다.</Text></> : <>
                    <Stack w={'100%'} h={'70%'} className={`${classes.Vertical_align}`} gap={0}>
                      {viewed.slice((viewedPage - 1) * viewedPageCnt, viewedPage * viewedPageCnt).map((v) => (
                        <Box key={v.lesson._id} className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} h={'20%'} mih={'80px'} miw={0}>
                          <Group wrap='nowrap' w={'80%'} h={'100%'} p="md">
                            <Link to={`/subject/${v.subject._id}`} className="block"
                              style={{
                                display: 'flex',       // Makes the <a> tag a flex container
                                alignItems: 'center',  // Centers the image vertically
                                height: '100%',        // Forces <a> to fill the Group's height
                              }}>
                              <Image fit='contain' w={'auto'} h={"100%"} src={v.subject.image_url} className={classes.Image1} />
                            </Link>
                            <Stack gap={0} miw={0}>
                              <Link to={`/subject/${v.subject._id}`}>
                                <Text style={{ color: "black" }} truncate fw={'bold'}>{v.subject.title}</Text>
                                <Text style={{ color: "black" }} truncate>{v.subject.description}</Text>
                              </Link>
                              <Link to={`/lesson/${v.lesson._id}`}>
                                <Text style={{ color: "black" }} truncate>{v.lesson.title}</Text>
                              </Link>
                            </Stack>
                          </Group>
                        </Box>
                      ))}
                      <Space h="md" />
                      <Group w="100%" justify="center">
                        <Pagination value={viewedPage} onChange={setViewedPage}
                          total={Math.max(1, Math.ceil(viewed.length / viewedPageCnt))} />
                      </Group>
                    </Stack></>}
                </Stack>
              </Group>
            </Stack>

          </Flex>
        </Box>
      </ScrollArea>
    </MainPageAppshell>
  )
}