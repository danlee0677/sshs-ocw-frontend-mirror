import { useState, useEffect } from "react"
import { Flex, Stack, Title, UnstyledButton } from '@mantine/core'
import classes from './login.module.css'
import { useLocation } from 'react-router';
import { z } from 'zod'

type Method = "google" | "kakao" | "naver"

function arrToBitmask(arr: boolean[]) {
  return arr.reduce((acc, val, index) => (val ? (acc | (1<<index)) : acc), 0)
}

function handleLogin(method: Method, toggled: Array<boolean>, courseToggled: Array<boolean>) { // withcredentials: send http-only cookie with the request
  const toggledMask = arrToBitmask(toggled);
  const courseToggledMask = arrToBitmask(courseToggled);
  const prefs = `${toggledMask}.${courseToggledMask}` // if toggled is default, toggled = [] -> pref is 0.0

  window.location.assign(`${process.env.REACT_APP_API_URL}/api/auth/login/${method}?prefs=${encodeURIComponent(prefs)}`)
}

function Login() {
  const location = useLocation();
  const [toggled, setToggled] = useState<Array<boolean>>([]);
  const [courseToggled, setCourseToggled] = useState<Array<boolean>>([]);

  useEffect(() => {
    const parsed = z.object({
      toggled: z.array(z.boolean()),
      courseToggled: z.array(z.boolean()),
    }).safeParse(location.state)
    
    if (parsed.success) {
      setToggled([...parsed.data.toggled])
      setCourseToggled([...parsed.data.courseToggled])
    } else {
      setToggled([])
      setCourseToggled([])
    }

  }, [location.state])

  return (
    <>
    <Flex h='100vh' w='100vw' justify={"center"} align={"center"}>
      <Stack w='30vw' justify={"center"} align={"center"}>
        <Title className={classes.Title}>SSHS OCW</Title>
        <UnstyledButton className={`${classes.LoginButton} ${classes.Google}`} onClick={() => handleLogin("google", toggled, courseToggled)}>구글 계정으로 로그인</UnstyledButton>
        <UnstyledButton className={`${classes.LoginButton} ${classes.Kakao}`} onClick={() => handleLogin("kakao", toggled, courseToggled)}>카카오 계정으로 로그인</UnstyledButton>
        <UnstyledButton className={`${classes.LoginButton} ${classes.Naver}`} onClick={() => handleLogin("naver", toggled, courseToggled)}>네이버 계정으로 로그인</UnstyledButton>
      </Stack>
    </Flex>
    </>
  )
}

export default Login