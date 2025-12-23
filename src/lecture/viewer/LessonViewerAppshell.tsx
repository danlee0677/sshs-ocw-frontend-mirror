import React from "react";
import { AppShell, Box, Divider, Group, Flex, Image, Stack, ScrollArea, Space, Text, Title, } from "@mantine/core";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { linkStyle } from "../../libs/styles";
import { useState, useEffect } from "react";
import { type Module, moduleSchema } from '../../libs/types'
import { PLACEHOLDER_MODULE } from "../../libs/utils";
import { http } from "../../libs/http";
import classes from "./viewer.module.css"

function LessonViewerAppshell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [module, setModule] = useState<Module>(PLACEHOLDER_MODULE);
  const { lessonId } = useParams();
  const subjectId = searchParams.get('subjectId');
  const moduleId = searchParams.get('moduleId');
  const ind = module.contents.findIndex((val) => val._id === lessonId)


  useEffect(() => {
    if (!moduleId || !subjectId || !lessonId) navigate('/notfound');

    http.get(`${import.meta.env.VITE_API_URL}/api/modules/${moduleId}`).then((res) => {
      const parsed = moduleSchema.safeParse(res.data)

      if (!parsed.success) throw new Error("Fetched module does not meet Module type");
      setModule(parsed.data);
      // if (module._id !== moduleId || module.subject !== subjectId) throw new Error("moduleId or subjectId mismatch");
    }).catch((err) => {
      console.log(err);
      navigate('/notfound');
    })
  }, [subjectId, moduleId, navigate])


  return (
    <AppShell
      navbar={{ width: 300, breakpoint: 'sm' }}
      styles={{
        main: {
          height: "100vh",
          display: "flex",
          flexDirection: "column"
        },
        navbar: {
          height: "100vh",
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
                <Image alt="logo" h="40" w="auto" src="\app-logo.png" />
                <Title order={2}>SSHS OCW</Title>
              </Group>
            </Link>
          </Flex>
          <Space h="sm" />

          <Divider size="xs" w="100%" />

          <Flex w="100%" direction="column" h="80vh">
            <ScrollArea h="100%" type="auto" scrollbarSize={5}>
              <Stack gap="0">
                {module.contents.map((item, i) => {
                  return <>
                    <Group
                      className={`${classes.ProgressGroup} ${i === ind ? classes.selected : ''}`}
                      h={'60px'} align="center">
                      <Box ml={'sm'} w={'4px'} h={'90%'}
                        bg={i <= ind ? '#007bffff' : '#aaaaaa'}
                        className={`${classes.ProgressRect}`}></Box>
                      <Text
                        className={`${classes.ProgressText}`}
                        component={Link}
                        to={`/lessons/${item._id}?subjectId=${subjectId}&moduleId=${moduleId}`}
                        h={'100%'}>{item.title}</Text>
                    </Group>
                  </>
                })}
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

export default LessonViewerAppshell;