import { AppShell, Box, Burger, Divider, Group, Flex, Image, Stack, ScrollArea, Space, Text } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Link } from "react-router";
import { HEADER_HEIGHT, MOBILE_QUERY, linkStyle } from "../../libs/styles";
import classes from "./lessonViewer.module.css"
import { type RecentView, type Subject, type Lesson } from "../../libs/types";
import logo from '../../assets/app-logo.png'
import { useUserContext } from "../../root";
import { ColorSchemeToggle, ColorSchemeToggleFull } from "./ColorSchemeToggle";

interface LessonViewerAppshellProps {
  children: React.ReactNode;
  subject: Subject;
  lesson: Lesson;
  progress: Array<RecentView>;
}

export default function LessonViewerAppshell({ children, subject, lesson, progress }: LessonViewerAppshellProps) {
  const { user } = useUserContext();
  const ind = subject.contents.findIndex((val) => val._id === lesson._id)

  const highlightArray = subject.contents.map((v) => progress.some(item => item.lesson._id === v._id));

  const [opened, { toggle, close }] = useDisclosure(false);

  /*
   * The one place this file is allowed to branch on width in JS.
   *
   * `AppShell`'s `header.collapsed` is a plain boolean, not a responsive object,
   * so `collapsed: false` would reserve a 56px `--app-shell-header-offset` on
   * desktop too — where the header is not shown — pushing the lesson down by a
   * header that isn't there. CSS cannot take it back either: Mantine writes that
   * variable as an inline style on the AppShell root (see AppShellMediaStyles).
   * So the boolean has to be computed.
   *
   * `getInitialValueInEffect: false` reads matchMedia synchronously on the first
   * render — no flash of the wrong layout. Safe here: the app is a SPA and only
   * root.tsx is in the prerendered shell. Nothing unmounts as a result of this
   * value, so the `<Form method="get">` rule in styles.ts does not apply.
   */
  const isMobile = useMediaQuery(MOBILE_QUERY, false, { getInitialValueInEffect: false });

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT, collapsed: !isMobile }}
      /*
       * `collapsed` was missing entirely. In Mantine v8's assignNavbarVariables,
       * an undefined `collapsed.mobile` makes the `!navbar?.collapsed?.mobile`
       * branch true, so below `sm` the navbar was widened to 100% while the
       * branch that applies `translateX(-100%)` never ran — a full-width fixed
       * overlay permanently covering the lesson, with no burger to dismiss it.
       * This one prop activates the transform branch.
       */
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      styles={{
        main: {
          height: "100dvh",
          display: "flex",
          flexDirection: "column"
        }
        /*
         * No `navbar` entry any more. It used to hardcode `height: 100dvh`,
         * which overrode Mantine's
         *   `top: var(--app-shell-header-offset); height: calc(100dvh - offset)`.
         * With the mobile header added, that would start the navbar 56px down
         * and still run it a full 100dvh tall — pushing the scheme toggle and
         * the profile link 56px below the fold on exactly the viewports that can
         * least afford it. `display: flex; flex-direction: column` is Mantine's
         * default for the navbar, so that was redundant too.
         */
      }}
    >
      {/*
        * Mobile-only header: [☰] 단원 제목… [🌙]. Collapsed (translated out, not
        * unmounted) from `sm` up, where the navbar is permanently visible.
        */}
      <AppShell.Header px="md">
        <Group h="100%" wrap="nowrap" gap="sm">
          <Burger
            opened={opened}
            onClick={toggle}
            size="md"
            aria-label="Toggle navigation"
          />
          <Text fw={600} truncate="end" style={{ flex: 1, minWidth: 0 }}>
            {lesson.title}
          </Text>
          {/* So a phone reader can switch schemes without opening the navbar. */}
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Stack w="100%" gap={0} align="center" h="100%">
          {/*
            * Flex sizing replaces `h="5%"` / `h="75%"` / `flexGrow: 1`, which did
            * not add up: on a short viewport the 75% list squeezed the fixed rows
            * instead of the other way round. Every fixed row is `flex: 0 0 auto`
            * and the lesson list takes what is left.
            */}
          <Space h="sm" style={{ flex: '0 0 auto' }} />
          <Flex w="80%" justify="flex-start" style={{ flex: '0 0 auto' }}>
            <Link to="/" style={linkStyle} onClick={close}>
              <Group gap="md" align="center">
                <Image alt="logo" h="40" w="auto" src={logo} />
              </Group>
            </Link>
          </Flex>
          <Space h="sm" style={{ flex: '0 0 auto' }} />

          <Divider size="xs" w="100%" style={{ flex: '0 0 auto' }} />

          {/* `min-height: 0` is load-bearing: without it a flex item refuses to
            * shrink below its content, so the ScrollArea never scrolls and the
            * footer rows get pushed off the bottom instead. */}
          <Flex w="100%" direction="column" style={{ flex: '1 1 auto', minHeight: 0 }}>
            <ScrollArea h="100%" type="auto" scrollbarSize={5}>
              <Stack gap="0">
                {subject.contents.map((item, i) => {
                  return (
                    // Was a bare `<>` with the key on this Group — React never
                    // saw a key, because the fragment was the array element.
                    <Group
                      key={item._id}
                      className={`${classes.ProgressGroup} ${i === ind ? classes.selected : ''}`}
                      align="center">
                      <Box
                        ml={'sm'}
                        className={`${classes.ProgressRect} ${highlightArray[i] ? classes.ProgressRectVisited : classes.ProgressRectUnvisited}`}
                      ></Box>
                      <Text
                        className={`${classes.ProgressText}`}
                        component={Link}
                        to={`/lesson/${item._id}`}
                        // Below `sm` this navbar IS the drawer, so without this
                        // it stays open covering the lesson just tapped. A no-op
                        // on desktop, where the navbar is never collapsed.
                        onClick={close}>{item.title}</Text>
                    </Group>
                  )
                })}

              </Stack>

            </ScrollArea>
          </Flex>

          <Divider size="xs" w="100%" style={{ flex: '0 0 auto' }} />
          <Flex h="60px" w="100%" justify="flex-start" component={Link} className={`${classes.ProgressGroup}`} style={{ flex: '0 0 auto' }} to={`/subject/${subject._id}`} onClick={close} >
            <Group h="100%" p="5px" w="100%">
              <Image w='50' src={subject.image_url} />
              <Text className={classes.ProgressText}>
                과목으로 돌아가기
              </Text>
            </Group>
          </Flex>

          <Divider size="xs" w="100%" style={{ flex: '0 0 auto' }} />

          {/* `flexGrow: 1` removed — the remaining space belongs to the lesson
            * list, not to the profile row. */}
          <Flex component={Link} className={`${classes.ProgressGroup}`} style={{ flex: '0 0 auto' }} w="100%" justify="flex-start" to={`/profile/${user ? user._id : "/login"}`} onClick={close}>
            <Group w="100%" p="5px">
              <Image w='50' h='50' src={user ? user.pfp_url : undefined} />
              {/* Was `h={'100$'}` — a typo, so this was an invalid CSS height
                * that the browser dropped. The height is unnecessary anyway;
                * the parent Group centres it. */}
              <Text className={classes.ProgressText}>
                프로필 페이지
              </Text>
            </Group>
          </Flex>

          <Divider size="xs" w="100%" style={{ flex: '0 0 auto' }} />

          {/* The lesson viewer does not use MainPageAppshell, so before this the
            * scheme toggle was unreachable on /lesson/:id at every width. 300px
            * fits the labelled three-way control, which keeps 자동 available. */}
          <Box w="100%" p="sm" style={{ flex: '0 0 auto' }}>
            <ColorSchemeToggleFull />
          </Box>

        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
