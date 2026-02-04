import classes from './join.module.css'
import { ActionIcon, Button, Flex, Stack, TextInput, Title } from "@mantine/core";
import { IconArrowBack } from '@tabler/icons-react'
import { type SetStateAction, useState } from 'react';


function Join({ step, setStep, username, setUsername }: { step: number, setStep: React.Dispatch<SetStateAction<number>>, username: string, setUsername: React.Dispatch<SetStateAction<string>> }) {
  const [error, setError] = useState<string>("");

  return (
    <>
      <Flex w={'100vw'} h={'100vh'} align={'center'} justify={'center'}>
        <ActionIcon onClick={() => { setStep((st) => (st - 1)) }} size={42} variant={'default'} className={classes.IconContainer}>
          <IconArrowBack size={30}></IconArrowBack>
        </ActionIcon>


        <Stack w={'40%'}>
          {step === 1 && (
            <>
              <Title className={classes.Title}>사용할 닉네임을 입력해 주세요</Title>
              {error === "" ?
                <TextInput title="username"
                  value={username} onChange={(e) => {
                    const value = e.currentTarget.value
                    if (value.length > 0) setError("");
                    setUsername(value)
                  }} />
                :
                <TextInput title="username" error={error}
                  value={username} onChange={(e) => setUsername(e.currentTarget.value)} />
              }
            </>
          )}


          <Button w={'20%'} onClick={() => {
            if (username.length === 0) {
              setError("닉네임은 한 글자 이상이어야 합니다!")
            }
            else {
              setStep(step + 1)
            }
          }}>다음</Button>
        </Stack>
      </Flex>
    </>
  )
}

export default Join