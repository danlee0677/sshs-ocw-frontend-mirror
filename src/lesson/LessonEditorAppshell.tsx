import { AppShell, Group, Image, Title, Space, Flex, Button } from "@mantine/core";
import { Link } from "react-router";
import { useRichTextEditorContext } from "@mantine/tiptap";
import { linkStyle } from "../libs/styles";
import { addYoutubeVideo } from "../libs/editorUtils";

function LessonEditorAppshell({ children }: { children: React.ReactNode }) { 
  const { editor } = useRichTextEditorContext();

  return (
  <AppShell
    padding="md"
    header={{ height: 100 }}
  >
    <AppShell.Header h="15vh">
      <Group h="60%" w="100%" gap={0}>
          <Flex w="20%">
            <Space w="sm" />
            <Link to="/" style={linkStyle}>
              <Group gap="md" align="center" h="100%">
                <Image alt="logo" h="40" w="auto"  src="\app-logo.png" />
                <Title order={3}>SSHS OCW</Title>
              </Group>
            </Link>
          </Flex>

        <Flex w="60%" h="100%" justify="center">
          <Group gap="xl" h="100%">
            <Title order={4}>정보부 강의</Title>
            <Title order={4}>일반물리학 강의</Title>
            <Title order={4}>일반화학 강의</Title>
          </Group>
        </Flex>

        <Flex w="20%" h="100%" justify="flex-end">
          <Group gap="md" align="center" w="100%" h="100%">
            <Link to="/" style={linkStyle}>
              <Title order={5}>Login</Title>
            </Link>
            <Title order={5}>|</Title>
            <Link to="/" style={linkStyle}>
              <Title order={5}>Register</Title>
            </Link>
            <Space w={0} />
          </Group>
        </Flex>
      </Group>
      <Group h="40%" gap="md" >
        <Button onClick={() => addYoutubeVideo(editor)} >Add Youtube Video</Button>
      </Group>
    </AppShell.Header>

    <AppShell.Main h="85vh">
      {children}
    </AppShell.Main>
  </AppShell>)
}

export default LessonEditorAppshell;