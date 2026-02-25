import classes from './join.module.css'
import { ActionIcon, Button, Flex, Loader, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconArrowBack } from '@tabler/icons-react'
import { useState } from 'react';
import { useFetcher } from 'react-router';

interface JoinProps {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  errorMessage: string | null;
}

export default function Join({ setStep, errorMessage }: JoinProps) {
  const [username, setUsername] = useState<string>("");
  const fetcher = useFetcher();

  const isChecking = fetcher.state !== "idle";
  const isTaken = fetcher.data?.available === false && fetcher.data?.username === username;
  const localError = (isTaken ? fetcher.data.message : "");

  const handleCheckAndSubmit = () => {
    if (username.length > 0) {
      fetcher.submit({ username: username }, { method: "post", action: "/action/auth/check-username" });
    }
  }

  return (
    <Flex w={'100vw'} h={'100vh'} align={'center'} justify={'center'}>
      <ActionIcon onClick={() => { setStep((st) => (st - 1)) }} size={42} variant={'default'} className={classes.IconContainer}>
        <IconArrowBack size={30}></IconArrowBack>
      </ActionIcon>


      <Stack w={'40%'}>
        { errorMessage && (
          <Text c="red" fw={500} ta="center">
            { errorMessage === "NoUsername" ? "존재하지 않는 유저입니다. 회원가입을 해주세요." : 
              (errorMessage === "DuplicateUsername" ? "중복 닉네임입니다. 다른 닉네임을 사용해주세요." :
               "로그인 중 오류가 발생했습니다. 다시 시도해주세요.")}
          </Text>
        )}
        <Title className={classes.Title}>사용할 닉네임을 입력해 주세요</Title>
        <TextInput placeholder='닉네임 입력'
          value={username} error={localError}
          onChange={(e) => setUsername(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckAndSubmit()}
          rightSection={isChecking ? <Loader size="xs" /> : null}
        />

        <Button w={'20%'}
          disabled={username.length === 0 || isTaken || isChecking}
          onClick={handleCheckAndSubmit}
        >다음</Button>
      </Stack>
    </Flex>
  )
}