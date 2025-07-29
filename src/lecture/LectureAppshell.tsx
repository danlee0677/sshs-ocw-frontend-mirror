import React from "react";
import { AppShell, Group, Flex, Space, Image, Title } from "@mantine/core";
import { Link } from "react-router";
import { linkStyle } from "../libs/styles";

function LectureAppshell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      styles={{
        main: {
          height: "calc(100vh - 60px)",
          display: "flex",
          flexDirection: "column"
        },
        navbar: {
          height: "calc(100vh - 60px)",
          display: "flex",
          flexDirection: "column"
        }
      }}
    >
      <AppShell.Header h={60}>
        <Group h="100%" w="100%" gap="md">
          <Flex w="20%">
            <Space w="sm" />
            <Link to="/" style={linkStyle}>
              <Group gap="md" align="center" h="100%">
                <Image alt="logo" h="40" w="auto"  src="\app-logo.png" />
                <Title order={3}>SSHS OCW</Title>
              </Group>
            </Link>
          </Flex>


        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Title order={1}>1</Title>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}

export default LectureAppshell