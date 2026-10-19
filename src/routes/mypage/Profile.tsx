import { Avatar, Box, Button, Container, Flex, Grid, Group, Pagination, ScrollArea, Select, SimpleGrid, Space, Stack, Text, Title, useComputedColorScheme } from "@mantine/core";
import { recentViewSchema, streakSchema, type Streak, type User } from "../../libs/types";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { useUserContext } from "../../libs/useUserContext";
import { http } from "../../libs/http";
// Page rules plus the shared chrome. Page keys win on collision — the same
// merge SubjectViewer uses. `classes.JalnanGothic` is what still needs `shared`
// here; `.Vertical_align`, `.Box2` and `.Image1` moved to SubjectRow, which
// imports the same module directly.
import shared from "../../styles/shared.module.css"
import page from "./Profile.module.css"

const classes = { ...shared, ...page }

// Deliberately a SEPARATE binding, not a third spread into `classes`: the legend
// swatches below must stay visually identical to StreakBody's grid cells, and a
// local copy of `.cell` is exactly what drifts. CSS Modules are per-file scoped,
// so the only way to reach that rule is to import the module that declares it.
// No new bytes — StreakBody is already imported here, so its stylesheet is
// already in this route's CSS asset.
import streakClasses from "../../components/streak/StreakBody.module.css"
import { useState } from "react";
import { calculateCurrentStreak, calculateMaxStreak, PLACEHOLDER_USER } from "../../libs/utils";
import z from "zod";
import { getStreakColors } from "../../libs/styles";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";
import { StreakBody } from "../../components/streak/StreakBody";
import { CustomBadge } from "../../components/badge/CustomBadge";
import { SubjectRow } from "../../components/subject/SubjectRow";

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
      // default: a backend older than this field must not crash the profile page
      achievement: z.array(z.number()).default([]),
    }).safeParse(userRes.data);

    if (!userParsed.success) throw new Error("Failed to parse user from server");

    const retUser: User = {
      ...PLACEHOLDER_USER,
      _id: pageUserId,
      pfp_url: userParsed.data.pfp_url,
      username: userParsed.data.username,
      description: userParsed.data.description,
      achievement: userParsed.data.achievement,
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
  // The ramp lives in styles.ts because it needs a separate dark set: the empty
  // cell was gray-3, near-white, so a year of no activity became a glowing block
  // on a dark page. useComputedColorScheme, NOT useMantineColorScheme — the
  // latter returns the literal 'auto', which is not a key of STREAK_COLORS and
  // would break the ramp for every auto user. getInitialValueInEffect:false
  // reads synchronously; safe because this never appears in the prerendered shell.
  const scheme = useComputedColorScheme('light', { getInitialValueInEffect: false });
  const colors = getStreakColors(scheme);

  const displayThreshold = (maxActivity === 0 ? [0] : [1]).concat(threshold.slice(1));

  return (
    <MainPageAppshell>
      {/* No h="100%": the shell's ScrollArea content wrapper has `height: auto`,
          so a percentage height here would resolve to `auto` anyway. The shell
          owns the PAGE-level scroll container — the badge list below keeps its
          own nested one, which is an inner list scroller and still correct. */}
      <Box w="100%" px="md">
        <Flex w={'100%'} align={'center'} justify={'center'}>
          {/* No `size` prop: root.tsx already defaults Container to
              CONTENT_MAX_WIDTH (1200). Mantine's `size="lg"` is 1140 and would
              silently disagree with CONTENT_WIDTH. */}
          <Container px={{ base: 'sm', sm: 'md' }} w="100%">
            <Space h={'10px'}></Space>
            {/* Was `<Group h='400px'>` with 15% + 35% + 40% hard columns. */}
            <Grid gutter="lg" p={{ base: 'md', sm: 'xl' }} w="100%" mih={{ base: 'auto', sm: 320 }}>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <Flex justify={{ base: 'center', sm: 'flex-start' }}>
                  {/* Avatar, not Image. Three things come from it that `Image`
                      cannot give without hand-rolling them:
                        - the circle is STRUCTURAL — the root is `overflow: hidden`
                          + `border-radius: var(--avatar-radius, 1000px)` and the
                          inner <img> is already `object-fit: cover; width/height:
                          100%`. So no `radius`, no `fit` and no `aspect-ratio`
                          hack, and it holds for any source ratio;
                        - `pfp_url` can be "" (PLACEHOLDER_USER, which the loader
                          spreads into `retUser`), which rendered a BROKEN IMAGE
                          icon here. Avatar swaps in its placeholder span —
                          initials from `name`, sized `calc(--avatar-size / 2.5)`,
                          so it tracks the clamp below for free;
                        - it matches the header (MainPageAppshell:204, :213) and
                          ProfileEdit:205, which were already Avatars.

                      SIZE. One diameter for every picture, so it can no longer be
                      the source's aspect ratio in disguise. It must still be
                      FLUID: Avatar's root sets `min-width: var(--avatar-size)` and
                      refuses to shrink, so a flat 258px would overflow this
                      Grid.Col, which is only ~142px wide at the `sm` breakpoint.

                      The clamp reproduces what `w={{ base: 96, sm: '100%' }}`
                      rendered before. Working the chain down — Box px="md",
                      Container (max 1200, px="md"), Grid p="xl", gutter="lg"
                      (-12/side), Grid.Col span 3 (-12/side) — the column content
                      width is `0.25 * viewport - 50px` while the Container is
                      below its cap, and a flat 258px once it caps at 1232px. The
                      lower bound is the old `base` value.

                      SPACES IN THE STRING ARE LOAD-BEARING. `getSize` routes this
                      through `isNumberLike`, which returns true here only because
                      the value contains spaces; it then reaches `rem()`, whose
                      first branch passes anything starting with `clamp(` through
                      verbatim. Written without spaces it fails that test, is
                      treated as a THEME KEY, and emits
                      `var(--avatar-size-clamp(96px,...))` — an invalid
                      declaration that silently falls back to the 38px `md`
                      default. */}
                  <Avatar
                    src={pageUser.pfp_url}
                    name={pageUser.username}
                    alt={`${pageUser.username}의 프로필 사진`}
                    size="clamp(96px, calc(25vw - 50px), 258px)"
                  />
                </Flex>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 5 }}>
                <Stack h="100%" justify={'flex-start'} gap={0} p={'10px'} miw={0}>
                  <Title m={0} className={classes.JalnanGothic}>{pageUser.username}</Title>
                  <Text fw={600}>{pageUser.description ?? "프로필 소개를 작성해보세요!"}</Text>
                  <Group gap={2} wrap="nowrap" miw={0}>
                    {/* A Mongo ObjectId does not fit beside its label on a phone. */}
                    <Text style={{ wordBreak: 'break-all' }}>사용자 식별자: {pageUser._id}</Text>
                    <CopyButton text={pageUser._id} />
                  </Group>
                  <Space h="md" />
                  {user?._id === pageUser._id && (
                    <Button component={Link} to={`/profile/${pageUser._id}/edit`}>편집</Button>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Stack h="100%" p={'lg'} align={'center'} gap={0} className={classes.BadgeArea}>
                  <Title order={3} className={classes.JalnanGothic}>보유 배지</Title>
                  {/* Needs an explicit height to scroll: `h='100%'` used to resolve
                      against the removed 400px and now has no definite parent. */}
                  <ScrollArea w={'100%'} h={{ base: 200, sm: '100%' }}>
                    <Stack p={'xs'} gap={0}>
                      {/* `pageUser`, not `user`: `user` is the logged-in VIEWER, so
                          reading it showed the visitor's own badges on someone else's
                          profile. The loader now fills achievement from /api/user/:id. */}
                      {pageUser.achievement.map((badgeId) => (
                        <CustomBadge key={badgeId} id={badgeId}></CustomBadge>
                      ))}
                    </Stack>
                  </ScrollArea>
                  <Text c={'dimmed'}>모두 보기</Text>
                </Stack>
              </Grid.Col>
            </Grid>
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
                {/* Hidden for a year with no activity: every threshold is 0, so all
                    four labels would read "0" and the legend carries no information.
                    KNOWN, not fixed here: at maxActivity === 1 all four read "1" while
                    only colors[1] is ever used. Cosmetic, low-activity years only.
                    4 swatches + labels at gap="xl" overflow below 400px. */}
                {maxActivity > 0 && (
                  <Flex gap={{ base: 'xs', sm: 'xl' }} justify={{ base: 'center', sm: 'flex-end' }} align="center" wrap="wrap">
                    {(colors.slice(1)).map((color, i) => (
                      <Group gap="6" key={color}>
                        <Text size="sm" c="dimmed" fw={500}>{displayThreshold[i] === displayThreshold[i+1] ? displayThreshold[i] : `${displayThreshold[i]}-${displayThreshold[i+1]}`}</Text>
                        {/* streakClasses, NOT classes: `.cell` lives in StreakBody's
                            module and these swatches must match its grid cells. */}
                        <div
                          className={streakClasses.cell}
                          style={{ width: 20, height: 20, background: color }}
                        />
                      </Group>
                    ))}
                  </Flex>
                )}
              </Group>
              <Text size="xs" c="dimmed">날짜는 KST 오전 06:00 기준으로 변경됩니다.</Text>
            </Stack>

            {/* Was `<Group align="align-left">` — not a valid align value, so it
                silently fell back — with `w="45%"` + `w="50%"` children and no wrap. */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" w="100%">
              <Stack className={classes.GroupBox}>
                <Title order={3} className={classes.JalnanGothic}>좋아요 한 과목</Title>
                {likedSubjects.length === 0 ? <>
                  <Text>마음에 드는 강의에 좋아요를 눌러보세요!</Text>
                </> : <>
                  {/* Was a <Table> with 제목 / 설명 columns inside a
                      `Table.ScrollContainer minWidth={320}`. Two things went with
                      it: the subject thumbnails were not shown at all, and the 설명
                      column had no truncation, so a long description widened the
                      table and put a HORIZONTAL scrollbar inside the card. The
                      rows below truncate instead, which is why no scroll container
                      is needed here any more.

                      `subtitleTo` is deliberately omitted: both lines would point
                      at the same subject, so the description renders as plain
                      text. See SubjectRow. */}
                  <Stack w="100%" gap={0}>
                    {likedSubjects.slice((likedSubjectPage - 1) * likedSubjectPageCnt, likedSubjectPage * likedSubjectPageCnt).map((sub) => (
                      <SubjectRow
                        key={sub._id}
                        to={`/subject/${sub._id}`}
                        imageUrl={sub.image_url}
                        title={sub.title}
                        subtitle={sub.description}
                      />
                    ))}
                  </Stack>
                  {/* `mt="auto"` on BOTH columns' pagination, not just this one.
                      SimpleGrid is `display: grid` with no `align-items`, so the
                      two cards already stretch to the same height and the taller
                      one sets it. Pinning both paginations to the card bottom is
                      what makes the leftover space read as deliberate padding
                      instead of one column trailing off. Same pattern, and the
                      same reason, as Home.tsx:241. */}
                  <Group w="100%" justify="center" mt="auto">
                    <Pagination total={Math.max(1, Math.ceil(likedSubjects.length / likedSubjectPageCnt))}
                      value={likedSubjectPage} onChange={setLikedSubjectPage} />
                  </Group>
                </>}
              </Stack>

              {/* No `p='xl'` here. It was an INLINE style, so it beat
                  `.GroupBox`'s own `padding: 20px` and left this card padded 32px
                  against the liked-subjects card's 20px — two cards side by side
                  in one SimpleGrid with visibly different inner margins. */}
              <Stack className={classes.GroupBox}>
                <Title order={3} className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Title>
                {viewed.length === 0 ? <>
                  <Text>이용한 강의가 없습니다.</Text></> : <>
                  {/* This Stack carries NO className. It used to have
                      `.Vertical_align`, which sets align-items and
                      justify-content at (0,1,0) — exactly the specificity of
                      Mantine's own `.m_6d731127` (`align-items: var(--stack-align,
                      stretch)`) — so which one won was decided by chunk order
                      rather than intent. Do not add it back: it now lives only on
                      SubjectRow's plain <div>, which is the one shape it is safe
                      on. If centring is ever wanted here, use Mantine's `align`
                      prop, which lands in the inline style attribute and cannot be
                      tied. Settings.tsx:15 records the same fix on a Group. */}
                  {/* Two lines, not three — the subject DESCRIPTION that used to
                      sit between them was dropped when this became a SubjectRow.
                      It was the highest-variance line in the card and is what
                      carried this column past the one beside it; it is still one
                      click away on the subject page. `subtitleTo` points at the
                      LESSON, which is the one thing distinguishing this list from
                      the liked-subjects list above. */}
                  <Stack w={'100%'} gap={0}>
                    {viewed.slice((viewedPage - 1) * viewedPageCnt, viewedPage * viewedPageCnt).map((v) => (
                      <SubjectRow
                        key={v.lesson._id}
                        to={`/subject/${v.subject._id}`}
                        imageUrl={v.subject.image_url}
                        title={v.subject.title}
                        subtitle={v.lesson.title}
                        subtitleTo={`/lesson/${v.lesson._id}`}
                      />
                    ))}
                  </Stack>
                  {/* OUTSIDE the row Stack, so it is a direct flex child of the
                      card — the fragment around it adds no DOM node. That
                      placement is what makes `mt="auto"` work: the card Stack is
                      the box SimpleGrid stretches to the row height, so it is the
                      only ancestor here with a definite height for an auto margin
                      to absorb. Left inside the row Stack (auto height) the margin
                      would resolve to zero and pin nothing. The `<Space h="md" />`
                      that used to sit here went with it — the card Stack's own
                      `gap` already supplies that separation. */}
                  <Group w="100%" justify="center" mt="auto">
                    <Pagination value={viewedPage} onChange={setViewedPage}
                      total={Math.max(1, Math.ceil(viewed.length / viewedPageCnt))} />
                  </Group></>}
              </Stack>
            </SimpleGrid>
          </Container>

        </Flex>
      </Box>
    </MainPageAppshell>
  )
}