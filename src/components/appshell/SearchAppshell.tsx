import { type ReactNode } from "react";
import { AppShell, Group, Image, TextInput, UnstyledButton, Button, Burger, Drawer, ScrollArea, Divider, Stack, Avatar, Menu } from "@mantine/core";
import { IconSearch } from '@tabler/icons-react';
import { Form, Link, useFetcher } from "react-router";
import { linkStyle } from "../../libs/styles";
import classes from "./Appshell.module.css";
import logo from '@/assets/app-logo.png';
import { isUser } from "../../libs/utils";
import { useUserContext } from "../../root";
import { useDisclosure } from "@mantine/hooks";

const links = [
  { link: '/search?tags=Physics', label: '물리' },
  { link: '/search?tags=Chemistry', label: '화학' },
  { link: '/search?tags=Biology', label: '생명과학' },
  { link: '/search?tags=Earth+Science', label: '지구과학' },
  { link: '/search?tags=Informatics', label: '정보' },
  { link: '/mentoring/board', label: '오프라인 멘토링' },
];

function MainPageAppshell({ children }: { children: ReactNode }) {
  const { user } = useUserContext();
  const fetcher = useFetcher();
  const [opened, { toggle, close }] = useDisclosure(false);

  const items = links.map((link) =>
    <Link
      key={link.label}
      to={link.link}
      className={classes.link}
    >
      {link.label}
    </Link>
  )

  return (
    <AppShell
      header={{ height: "8dvh" }}
      style={{ height: "100dvh", display: "flex", flexDirection: 'column' }}
    >
      <AppShell.Header h="8dvh" className={classes.header}>
        <div className={classes.inner}>
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="md"
              hiddenFrom="sm"
              aria-label="Toggle navigation"
            />
            <Button component={Link} to={"/"} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
              <Image alt="logo" h={36} w="auto" src={logo} />
            </Button>
            <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
              {items}
            </Group>
          </Group>
          <Group>
            {isUser(user) ? (
              <Menu shadow="md" width={240} position="bottom-end">
                <Menu.Target>
                  <Avatar src={user.pfp_url} radius="xl" size="md" style={{ cursor: 'pointer' }} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    component={Link}
                    to={`/profile/${user._id}`}
                    className={classes.menuProfileHeader}
                    styles={{ itemLabel: { display: 'flex', justifyContent: 'center' } }}
                  >
                    <Avatar src={user.pfp_url} radius="xl" size={80} />
                  </Menu.Item>
                  <Divider />
                  <Group grow gap={0} className={classes.menuActions}>
                    <Menu.Item component={Link} to="/settings" className={classes.menuActionItem}>
                      설정
                    </Menu.Item>
                    <fetcher.Form method="post" action="/action/auth/logout" style={{ flex: 1 }}>
                      <Menu.Item type="submit" component="button" className={classes.menuActionItem} style={{ width: '100%' }}>
                        로그아웃
                      </Menu.Item>
                    </fetcher.Form>
                  </Group>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs" visibleFrom="sm">
                <UnstyledButton component={Link} className={classes.LogOutButton} to="/login" style={linkStyle}>
                  로그인
                </UnstyledButton>
              </Group>
            )}
          </Group>
        </div>

        <Drawer
          opened={opened}
          onClose={close}
          size="100%"
          padding="md"
          hiddenFrom="sm"
          zIndex={1000000}
        >
          <ScrollArea>
            <Divider my="sm" />
            <Form action="/search" method="get" style={{ width: '100%' }}>
              <Group className={classes.searchArea}>
                <TextInput
                  leftSection={
                    <Button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                      <IconSearch className={classes.searchIcon} color="black" size={16} stroke={1.5} />
                    </Button>}
                  placeholder="검색어를 입력해 주세요."
                  name="keyword"
                  maxLength={20}
                  visibleFrom="xs"
                  w="100%"
                />
              </Group>
            </Form>
            <Stack py="md">{items}</Stack>
            <Divider my="sm" />
          </ScrollArea>
        </Drawer>
      </AppShell.Header>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>)
}

export default MainPageAppshell;