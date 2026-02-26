import { AppShell, Box, Divider, Group, Flex, Image, Stack, ScrollArea, Space, Text, Title } from "@mantine/core";
import { Link } from "react-router";
import { linkStyle } from "../../libs/styles";
import classes from "./lessonViewer.module.css"
import { type RecentView, type Subject, type Lesson } from "../../libs/types";
import logo from '../../assets/app-logo.png'

interface LessonViewerAppshellProps {
  children: React.ReactNode;
  subject: Subject;
  lesson: Lesson;
  progress: Array<RecentView>;
}

export default function LessonViewerAppshell({ children, subject, lesson, progress }: LessonViewerAppshellProps) {
  const ind = subject.contents.findIndex((val) => val._id === lesson._id)

  const highlightArray = subject.contents.map((v) => progress.some(item => item.lesson._id === v._id));

  return (
    <AppShell
      navbar={{ width: 300, breakpoint: 'sm' }}
      styles={{
        main: {
          height: "100dvh",
          display: "flex",
          flexDirection: "column"
        },
        navbar: {
          height: "100dvh",
          display: "flex",
          flexDirection: "column"
        }
      }}
    >

      <AppShell.Navbar>
        <Stack w="100%" gap={0} align="center" h="100%">
          <Space h="sm" />
          <Flex w="80%" justify="flex-start" h="5%">
            <Link to="/" style={linkStyle}>
              <Group gap="md" align="center" h="100%">
                <Image alt="logo" h="40" w="auto" src={logo} />
                <Title order={2}>SSHS OCW</Title>
              </Group>
            </Link>
          </Flex>
          <Space h="sm" />

          <Divider size="xs" w="100%" />

          <Flex w="100%" direction="column" h="80vh">
            <ScrollArea h="100%" type="auto" scrollbarSize={5}>
              <Stack gap="0">
                {subject.contents.map((item, i) => {
                  return <>
                    <Group
                      className={`${classes.ProgressGroup} ${i === ind ? classes.selected : ''}`}
                      h={'60px'} align="center">
                      <Box ml={'sm'} w={'4px'} h={'90%'}
                        bg={ highlightArray[i] ? '#007bffff' : '#aaaaaa'}
                        className={`${classes.ProgressRect}`}></Box>
                      <Text
                        className={`${classes.ProgressText}`}
                        component={Link}
                        to={`/lesson/${item._id}`}
                        h={'100%'}>{item.title}</Text>
                    </Group>
                  </>
                })}
                <Flex h={'60px'} className={classes.ProgressGroup} align="center" justify="center">
                  <Text h={'100%'} component={Link} to={`/subject/${subject._id}`} className={classes.ProgressText}>과목으로 돌아가기</Text>
                </Flex>
              </Stack>

            </ScrollArea>
          </Flex>

          <Divider size="xs" w="100%" />

          <Flex h="10%">Profile Page</Flex>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
