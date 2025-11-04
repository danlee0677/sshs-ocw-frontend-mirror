import React from "react";
import { AppShell, Group, Input, Text, Image, Title, Space, Flex, Button, TextInput } from "@mantine/core";
import { IconSearch } from '@tabler/icons-react';
import { Link } from "react-router";
import { useState } from "react";
import { linkStyle } from "../libs/styles";
import classes from "./Appshell.module.css"

function MainPageHeader({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState("");
  return (
    <AppShell
      padding="md"
      header={{ height: 120 }}
    >
      <AppShell.Header h={120}>
        <Group h="100%" w="100%" gap={0}>
          <Flex w="20%">
            <Space w="sm" />
            <Link to="/" style={linkStyle}>
              <Group gap="md" align="center" h="100%">
                <Image alt="logo" h="40" w="auto" src="\app-logo.png" />
                <Title order={3}>SSHS OCW</Title>
              </Group>
            </Link>
          </Flex>

          <Flex w="60%" h="100%" align={"center"} justify="center">
            <Group w='80%' justify="center" className={`${classes.searchArea}`}>
              <IconSearch className={`${classes.searchIcon}`}></IconSearch>
              <TextInput placeholder="검색어를 입력해 주세요."
              value={value}
              onChange={(e) => {setValue(e.target.value)}}
              className={`${value ? classes.searchBar : classes.searchBar_animate}`}></TextInput>
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
      </AppShell.Header>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>)
}

export default MainPageHeader;