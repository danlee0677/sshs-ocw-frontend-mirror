import React from "react";
import { AppShell, Group, Flex, Space, Image, Title, Stack, Divider, ScrollArea } from "@mantine/core";
import { Link } from "react-router";
import { linkStyle } from "../libs/styles";

function LectureAppshell({ children }: { children: React.ReactNode }) {
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
                <Image alt="logo" h="40" w="auto"  src="\app-logo.png" />
                <Title order={2}>SSHS OCW</Title>
              </Group>
            </Link>
          </Flex>

          <Divider my="sm" size="md" />
          <Flex w="100%" direction="column" h="80vh">
            <ScrollArea h="100%" type="scroll" scrollbarSize={5}>
              <Stack gap="xl">
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
                <Title order={2}>1</Title>
              </Stack>
              
            </ScrollArea>
          </Flex>
          
          

          <Flex h="10%">Profile Page</Flex>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}

export default LectureAppshell