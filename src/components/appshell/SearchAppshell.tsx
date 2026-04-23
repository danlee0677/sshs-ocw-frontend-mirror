import { type ReactNode } from "react";
import { AppShell, Group, Image, Title, Space, Flex, Stack, UnstyledButton } from "@mantine/core";
import { Link, useFetcher } from "react-router";
import { linkStyle } from "../../libs/styles";
import classes from "./Appshell.module.css"
import logo from '@/assets/app-logo.png';
import { isUser } from "../../libs/utils";
import { useUserContext } from "../../root";

export default function SearchAppshell({ children }: { children: ReactNode }) {
  const { user } = useUserContext();
  const fetcher = useFetcher();

  return (
    <AppShell
      header={{ height: "18dvh" }}
      style={{ height: "100dvh", display: "flex", flexDirection: 'column' }}
    >
      <AppShell.Header h="18dvh">
        <Group h="100%" w="100%" gap={0} justify="space-between">
          <Flex w="20%">
            <Space w="sm" />
            <Link to="/" style={linkStyle}>
              <Group gap="md" align="center" h="100%">
                <Image alt="logo" h="40" w="auto" src={logo} />
                <Title order={3}>SSHS TIPS</Title>
              </Group>
            </Link>
          </Flex>

          <Flex w="60%" h="100%" align={"center"} justify="center">
            <Stack w='100%' justify="center">
              <Group w={'100%'} justify="center" gap={'xl'}>
                <UnstyledButton component={Link} to="/search?tags=Physics" style={linkStyle}>물리</UnstyledButton>
                <UnstyledButton component={Link} to="/search?tags=Chemistry" style={linkStyle}>화학</UnstyledButton>
                <UnstyledButton component={Link} to="/search?tags=Biology" style={linkStyle}>생명과학</UnstyledButton>
                <UnstyledButton component={Link} to="/search?tags=Earth+Science" style={linkStyle}>지구과학</UnstyledButton>
                <UnstyledButton component={Link} to="/search?tags=Informatics" style={linkStyle}>정보</UnstyledButton>
              </Group>
            </Stack>
          </Flex>

          <Flex w="20%" h="100%" justify="flex-end">
            <Group gap="md" align="center" w="100%" h="100%">
              {!isUser(user) ? <>
                <UnstyledButton component={Link} className={classes.LogOutButton} to="/login" style={linkStyle}>
                  로그인
                </UnstyledButton>
                <Title order={5}>|</Title>
                <UnstyledButton component={Link} className={classes.LogOutButton} to="/" style={linkStyle}>
                  회원가입
                </UnstyledButton>
              </> : <>
                <fetcher.Form method="post" action="/action/auth/logout">
                  <UnstyledButton type="submit" className={classes.LogOutButton}>로그아웃</UnstyledButton>
                </fetcher.Form>
              </>
              }
              <Space w={0} />
            </Group>
          </Flex>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </AppShell.Main>
    </AppShell>)
}