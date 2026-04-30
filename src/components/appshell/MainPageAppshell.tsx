import { type ReactNode } from "react";
import { AppShell, Group, Image, Title, Space, Flex, Stack, TextInput, UnstyledButton, Button } from "@mantine/core";
import { IconSearch } from '@tabler/icons-react';
import { Form, Link, useFetcher } from "react-router";
import { linkStyle } from "../../libs/styles";
import classes from "./Appshell.module.css"
import logo from '@/assets/app-logo.png';
import { isUser } from "../../libs/utils";
import { useUserContext } from "../../root";

function MainPageAppshell({ children }: { children: ReactNode }) {
  const { user } = useUserContext();
  const fetcher = useFetcher();

  return (
    <AppShell
      header={{ height: "18dvh" }}
      style={{ height: "100dvh", display: "flex", flexDirection: 'column' }}
    >
      <AppShell.Header h="18dvh">
        <Group h="100%" w="100%" gap={0}>
          <Flex w="20%">
            <Space w="xl" />
            <Link to="/" style={linkStyle}>
              <Group gap="md" align="center" h="100%">
                <Image alt="logo" h="40" w="auto" src={logo} />
                <Title order={3}>SSHS TIPS</Title>
              </Group>
            </Link>
          </Flex>

          <Flex w="60%" h="100%" align={"center"} justify="center">
            <Stack w='100%' justify="center">
              <Form action="/search" method="get" style={{ width: '100%' }}>
                <Group w='100%' justify="center" className={`${classes.searchArea}`}>
                  <Button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                    <IconSearch className={`${classes.searchIcon}`} color="black" />
                  </Button>
                  <TextInput placeholder="검색어를 입력해 주세요."
                    name="keyword"
                    maxLength={20}
                    className={`${classes.dynamicSearchBar}`} />
                </Group>
              </Form>
              <Group w={'100%'} justify="center" gap={'xl'}>
                <UnstyledButton component={Link} to="/search?tags=Physics" style={linkStyle}>물리</UnstyledButton>
                <UnstyledButton component={Link} to="/search?tags=Chemistry" style={linkStyle}>화학</UnstyledButton>
                <UnstyledButton component={Link} to="/search?tags=Biology" style={linkStyle}>생명과학</UnstyledButton>
                <UnstyledButton component={Link} to="/search?tags=Earth+Science" style={linkStyle}>지구과학</UnstyledButton>
              </Group>
            </Stack>
          </Flex>

          <Flex w="20%" h="100%" justify={'center'} align={'center'}>
            <Group gap="md" align="center" w={'100%'} h="100%" justify="center">
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

export default MainPageAppshell;