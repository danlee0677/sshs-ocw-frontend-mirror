import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { Box, Container, Flex, Image, Grid, Group, Paper, SimpleGrid, Stack, Text, Title, ScrollArea } from '@mantine/core';
import classes from '../../styles/shared.module.css'
// import { ProgressCard } from './Progress'
import { HomeBadge } from "./HomeBadge";
import { recentViewSchema, streakSchema, userSchema, type RecentView } from "../../libs/types";
import { Link, redirect, useLoaderData } from "react-router";
import { http } from "../../libs/http";
import z from "zod";
import { useUserContext } from "../../libs/useUserContext";
import { isAxiosError } from "axios";
import { FloatingActionButton } from "../../components/home/FloatingActionButton";
import { calculateCurrentStreak, calculateMaxStreak } from "../../libs/utils";
import { linkStyle } from "../../libs/styles";

const PLACEHOLDER_RECENT_VIEW: RecentView = {
  subject: {
    _id: "",
    title: "",
    image_url: "https://res.cloudinary.com/dpcig7o5t/image/upload/v1760317295/samples/cloudinary-icon.png",
    description: "",
  },
  lesson: {
    _id: "",
    title: "",
  },
  viewedAt: new Date(),
  userId: "",
}

export async function clientLoader() {
  try {
    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);

    const userParsed = userSchema.safeParse(userRes.data);
    if (!userParsed.success) throw new Error("Failed to verify user")

    const [progressRes, streakRes] = await Promise.all([
      http.get(`${import.meta.env.VITE_API_URL}/api/progress/${userParsed.data._id}/recent-subjects`),
      http.get(`${import.meta.env.VITE_API_URL}/api/streak/${userParsed.data._id}`)
    ])
    const progressParsed = z.array(recentViewSchema).safeParse(progressRes.data);
    const streakParsed = z.array(streakSchema).safeParse(streakRes.data);

    if (!progressParsed.success)
      throw new Response("failed to get intact progress from server", { status: 400 });

    if (!streakParsed.success)
      throw new Response("Failed to get streak from server", { status: 400 });

    return { recentViewed: progressParsed.data, streak: streakParsed.data }
  } catch (err) {
    console.log(err)
    if (err instanceof Response) throw err;

    // if user is not logged in, throw
    if (isAxiosError(err) && err.response?.status === 401)
      throw redirect("/")

    throw err;
  }

}

function Home() {
  const { recentViewed, streak } = useLoaderData<typeof clientLoader>();

  const { user } = useUserContext();

  const padArray = (array: Array<RecentView>, minLength: number): Array<RecentView> => {
    const safeArray = array ?? []
    if (safeArray.length === 0) return [PLACEHOLDER_RECENT_VIEW]

    const copy: Array<RecentView> = [
      ...(safeArray.sort(
        (a: RecentView, b: RecentView) =>
          (new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())))
    ].slice(0, minLength);

    if (copy.length < minLength) {
      const originalLength = copy.length
      copy.length = minLength;
      copy.fill(PLACEHOLDER_RECENT_VIEW, originalLength);
    }

    return copy;
  }

  const minLength = 4;
  const paddedProgress = padArray(recentViewed, minLength);

  if (!user) return null;

  return (
    <MainPageAppshell>
      <ScrollArea w="100%" h="100%">
        {/* Bare Container, no `size`: root.tsx already sets the default to
            CONTENT_MAX_WIDTH (1200) plus px='md', so this centres the page and
            restores the side padding that went missing when the old
            50%+25%=75% Group became a full-width Grid. Passing size="lg" would
            silently mean 1140 instead. `py` replaces the old `p="md"`; the
            horizontal half comes from the Container default.
            No h="100%": ScrollArea's viewport wrapper is `display: table` with no
            definite height, so a percentage height here resolves to `auto` anyway. */}
        <Container py="md" w="100%">
          <Stack gap="md" w="100%">
            {(user.roles.includes('admin') || user.roles.includes('creator')) &&
              <Stack align="center" w="100%">
                <FloatingActionButton roles={user.roles}></FloatingActionButton>
              </Stack>}
            {/* Was `<Group h='65vh'>` holding a 50% and a 25% column — 75% total, so
                dead space on desktop and two crushed columns on mobile. A viewport
                height on a page that can grow is also what caused the overlap at
                768px. Grid handles both. */}
            <Grid gutter="md" w="100%">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack h="100%" gap="md">
                  {/* `c='black'` deleted rather than recolored — Paper inherits
                      var(--mantine-color-text), and an explicit text color is exactly what
                      would make this card unreadable in dark mode. `style={linkStyle}` is
                      still required because it is `component={Link}`: with no color at all
                      the anchor falls back to UA link blue. */}
                  <Paper w={'100%'} mih={{ base: 180, sm: 220 }} className={`${classes.Box1} ${classes.ProfileCard}`} component={Link} to={`/profile/${user._id}`} style={linkStyle}>
                    <Flex w={'100%'} h={'100%'} direction={{ base: 'column', sm: 'row' }} justify={"flex-start"} align={'center'} px={{ base: 'md', sm: 'xl' }} py={{ base: 'md', sm: 0 }} gap={{ base: 'md', sm: 'xl' }}>
                      {/* `radius` is MantineRadius, not a responsive style prop — a
                          percentage keeps it circular at both sizes without one. */}
                      <Image w={{ base: 96, sm: 150 }} h={{ base: 96, sm: 150 }} fit="cover" src={user.pfp_url} className={classes.Main_pfp_image} radius="50%" />
                      <Stack gap="xs" justify="center" miw={0} ta={{ base: 'center', sm: 'left' }}>
                        <Title className={classes.JalnanGothic} mb={0} fz={{ base: 'h3', sm: 'h1' }}>{user?.username}님</Title>
                        {user.description && (
                          <Text size="sm" fw={550} c="dimmed">{user.description}</Text>
                        )}
                        {/* Flex, not Group: Group's `justify` is a plain JustifyContent
                            and rejects a responsive object; Flex's accepts one. */}
                        <Flex gap="xs" wrap="wrap" justify={{ base: 'center', sm: 'flex-start' }}>
                          <HomeBadge type={1} />
                          <HomeBadge type={2} />
                          <HomeBadge type={3} />
                        </Flex>
                      </Stack>
                    </Flex>
                  </Paper>
                  {/* SimpleGrid does the gap math; `w="49%"` in a `gap="2%"` Group did not.
                      `mih` replaces the height these cards used to inherit from
                      h='100%' inside h='50%' inside h='65vh'. A fixed minimum, not a
                      viewport-relative one — the dvh coupling is what caused the 768px
                      overlap this migration removed.

                      The `sm` step is TALLER than the `md` one on purpose. Below `md` the
                      grid stacks, so these cards span the full page width; holding the
                      same height there would let them flatten out as they widen. The
                      breakpoint that matters is `md` — where the layout changes — not the
                      card's own content. */}
                  <SimpleGrid cols={2} spacing="md" w="100%">
                    <Paper className={classes.Box1} withBorder p="md" mih={{ base: 140, sm: 220, md: 180 }}>
                      {/* The number is centred in the space the heading leaves, rather than
                          pushed to the bottom by `justify="space-between"`. */}
                      <Stack h="100%" gap="xs">
                        <Title order={3}>최장 스트릭</Title>
                        <Flex flex={1} align="center" justify="center">
                          <Title order={2}>{calculateMaxStreak(streak)}일</Title>
                        </Flex>
                      </Stack>
                    </Paper>
                    <Paper className={classes.Box1} withBorder p="md" mih={{ base: 140, sm: 220, md: 180 }}>
                      <Stack h="100%" gap="xs">
                        <Title order={3}>현재 스트릭</Title>
                        <Flex flex={1} align="center" justify="center">
                          <Title order={2}>{calculateCurrentStreak(streak)}일</Title>
                        </Flex>
                      </Stack>
                    </Paper>
                  </SimpleGrid>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                {/* Paper WRAPS the Stack rather than replacing it, and the pairing of
                    `withBorder` + `.Box1` on the SAME element mirrors the two streak
                    cards above — that is what makes the border identical rather than
                    merely similar. Hand-rolling `1px solid var(--mantine-color-default-border)`
                    on the Stack would NOT have matched: Paper's border is
                    `--paper-border-color` (gray-3 light / dark-4 dark) while
                    `--mantine-color-default-border` is gray-4 light, so the two would
                    diverge in light mode. `--paper-border-color` is not reachable from
                    here either — it is declared only under Paper's own class, so a Stack
                    referencing it would get an invalid declaration and NO border at all.

                    `.Box1` must sit on the bordered box, not the inner Stack: its hover
                    rule animates border-radius and adds a shadow, and on the inner
                    element the shadow would be drawn inside a border that stayed square.

                    Paper is `display: block`, so the Stack below is still what provides
                    the flex column — see the `mt: auto` note further down, which depends
                    on it. Hence `h="100%"` on BOTH: Paper fills the stretched Grid.Col,
                    the Stack fills the Paper. Dropping either breaks the pin silently.
                    Padding stays on the Stack; duplicating it here would double it. */}
                <Paper className={`${classes.Box1}`} withBorder h="100%" w="100%">
                  <Stack h="100%" w="100%" gap={0} align="center" py="md">
                    <Text className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Text>
                    {/* The `useElementSize` + `isNarrow = width < 150` gate that used to
                        wrap the titles is gone. It measured a width to decide whether to
                        RENDER content, so the first paint was always wrong and then
                        corrected — and its `ref` was attached to three different elements
                        in one render, so it was measuring whichever mounted last. The
                        `truncate` + `miw={0}` below already does the job in pure CSS. */}
                    {paddedProgress.map((v, i) => (
                      v.subject._id ?
                        <Box className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} mih={72} miw={0} key={v.lesson._id}>
                          <Group wrap='nowrap' w={'80%'} h={'100%'} miw={0}>
                            <Link to={`/subject/${v.subject._id}`} className="block"
                              style={{
                                display: 'flex',       // Makes the <a> tag a flex container
                                alignItems: 'center',  // Centers the image vertically
                                height: '100%',        // Forces <a> to fill the Group's height
                              }}>
                              <Image fit="cover" w='75' h={'75'} src={v.subject.image_url} className={classes.Image1} />
                            </Link>
                            {/* `style={linkStyle}` replaces an inline `color: "black"` on the
                                inner Text. Deleting that color alone was not enough: nothing
                                in index.css or Mantine's baseline resets anchors, so these
                                would have fallen back to UA link blue + underline.
                                linkStyle's `color: 'inherit'` is scheme-safe. */}
                            <Stack gap={0} miw={0}>
                              <Link to={`/subject/${v.subject._id}`} style={linkStyle}>
                                <Text truncate fw={'bold'}>{v.subject.title}</Text>
                              </Link>
                              <Link to={`/lesson/${v.lesson._id}`} style={linkStyle}>
                                <Text truncate>{v.lesson.title}</Text>
                              </Link>
                            </Stack>
                          </Group>
                        </Box>
                        : (i == 0 ?
                          <Box w="100%" mih={72} className={`${classes.Vertical_align}`} key={i}>
                            <Text>다양한 강의를 수강해보세요!</Text>
                          </Box>
                          :
                          <Box w="100%" mih={72} miw={0} key={i} />
                        )
                    ))}
                    {/* `mt="auto"` pins this to the bottom of the column no matter how many
                        rows exist: the Stack is a flex column filling the Paper, which fills
                        Grid.Col (which stretches to the row height), so an auto top margin on
                        the last child absorbs the leftover space. The rows above keep their
                        natural top alignment — this is why it is mt:auto here rather than
                        `justify="space-between"` on the Stack, which would also spread the
                        rows apart. Both `h="100%"` in that chain are load-bearing. */}
                    {/* Style object, not `mt`/`pt` props: this is react-router's Link, not a
                        Mantine component, so style props would land as bogus DOM attributes. */}
                    <Link
                      to={`/profile/${user._id}`}
                      style={{ ...linkStyle, marginTop: 'auto', paddingTop: 'var(--mantine-spacing-sm)' }}>
                      <Text>더보기</Text>
                    </Link>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>

        </Container>
      </ScrollArea>
    </MainPageAppshell >
  )
}

export default Home;