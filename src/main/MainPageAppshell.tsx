import React, { useEffect, type SetStateAction } from "react";
import { AppShell, Group, Image, Title, Space, Flex, Button, TextInput } from "@mantine/core";
import { IconSearch } from '@tabler/icons-react';
import { Link, type NavigateFunction } from "react-router";
import { useState } from "react";
import { linkStyle } from "../libs/styles";
import classes from "./Appshell.module.css"
import { http } from "../libs/http";
import type { User } from "../libs/types";
import logo from '@/assets/app-logo.png';
import { isUser } from "../libs/utils";


function handleSearch(value: string, navigate: NavigateFunction, setError: React.Dispatch<SetStateAction<string>>) {
  if (value.length === 0) return;
  if (value.length < 2 && value.length !== 0) {
    setError("검색어 길이는 2자 이상이어야 합니다!")
    return;
  }
  if (value.length > 20) {
    setError("검색어 길이는 20자 이하여야 합니다!")
    return;
  }
  navigate('/search', { state: { keyword: value } });
}

function MainPageAppshell({ children, user, setUser, navigate }: { children: React.ReactNode, user: User | null, setUser: React.Dispatch<User | null>, navigate: NavigateFunction }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (value.length === 0 || (2 <= value.length && value.length <= 20)) setError("");
  }, [value])

  return (
    <AppShell
      padding="md"
      header={{ height: "10dvh" }}
      style={{ height: "100dvh", display: "flex", flexDirection: 'column' }}
    >
      <AppShell.Header h="10dvh">
        <Group h="100%" w="100%" gap={0}>
          <Flex w="20%">
            <Space w="sm" />
            <Link to="/" style={linkStyle}>
              <Group gap="md" align="center" h="100%">
                <Image alt="logo" h="40" w="auto" src={logo} />
                <Title order={3}>SSHS OCW</Title>
              </Group>
            </Link>
          </Flex>

          <Flex w="60%" h="100%" align={"center"} justify="center">
            <Group w='80%' justify="center" className={`${classes.searchArea}`}>
              <IconSearch className={`${classes.searchIcon}`} 
              onClick={() => handleSearch(value, navigate, setError)}></IconSearch>
              { error.length === 0 ?
                <TextInput placeholder="검색어를 입력해 주세요."
                  value={value}
                  onChange={(e) => { setValue(e.target.value) }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e.currentTarget.value, navigate, setError);
                    }
                  }}
                  className={`${value ? classes.searchBar : classes.searchBar_animate}`} />
                :
                <TextInput placeholder="검색어를 입력해 주세요."
                  value={value} error={error}
                  onChange={(e) => { setValue(e.target.value) }}
                  className={`${value ? classes.searchBar : classes.searchBar_animate}`} />
              }
            </Group>
          </Flex>

          <Flex w="20%" h="100%" justify="flex-end">
            <Group gap="md" align="center" w="100%" h="100%">
              {!isUser(user) ? <>
                <Link to="/login" style={linkStyle}>
                  <Title order={5}>Login</Title>
                </Link>
                <Title order={5}>|</Title>
                <Link to="/" style={linkStyle}>
                  <Title order={5}>Register</Title>
                </Link>
              </> : <>
                <Button onClick={() => {
                  http.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`).then(() => {
                    setUser(null);
                    navigate('/')
                  })
                }}>로그아웃</Button>
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