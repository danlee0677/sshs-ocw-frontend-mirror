import { useState, useEffect } from "react"
import { Flex, Stack, Title, UnstyledButton } from '@mantine/core'
import { useLocation, useSearchParams } from 'react-router';
import classes from './login.module.css'
import { z } from 'zod'

type Method = "google" | "kakao" | "naver"

function handleLogin(method: Method, username: string) { // withcredentials: send http-only cookie with the request
  window.location.assign(`${import.meta.env.VITE_API_URL}/api/auth/login/${method}?username=${username}`)
}

function Login() {
  const location = useLocation();
  const [username, setUsername] = useState<string>("");
  const [searchParams] = useSearchParams();

  const isnew: string | null = searchParams.get("new")

  useEffect(() => {
    const parsed = z.object({
      username: z.string(),
    }).safeParse(location.state)
    
    if (parsed.success) {
      setUsername(parsed.data.username);
    } else {
      setUsername("");
    }

  }, [location.state])

  return (
    <>
    <Flex h='100vh' w='100vw' justify={"center"} align={"center"}>
      <Stack w='30vw' justify={"center"} align={"center"}>
        <Title className={classes.Title}>SSHS OCW</Title>
        {isnew ? 
          <Title order={4} className={classes.Title}>연동하여 사용할 계정을 선택해 주세요</Title>
        : 
        <></>}
        <UnstyledButton className={`${classes.LoginButton} ${classes.Google}`} onClick={() => handleLogin("google", username)}>구글 계정으로 로그인</UnstyledButton>
        <button className={`${classes.LoginButton} ${classes.Kakao}`} onClick={() => handleLogin("kakao", username)}>카카오 계정으로 로그인</button>
        <UnstyledButton className={`${classes.LoginButton} ${classes.Naver}`} onClick={() => handleLogin("naver", username)}>네이버 계정으로 로그인</UnstyledButton>
      </Stack>
    </Flex>
    </>
  )
}

export default Login