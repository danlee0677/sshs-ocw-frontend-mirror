import { Flex, Stack, Title, UnstyledButton } from '@mantine/core'
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import classes from './login.module.css'
import { z } from 'zod'

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const parsed = z.object({ new: z.string().optional(), username: z.string().optional() })
    .safeParse(Object.fromEntries(url.searchParams));
  
  const isNew = parsed.success && parsed.data.new === "1";
  const username = parsed.success && parsed.data.username ? 
                    decodeURIComponent(parsed.data.username) : ""
  return { isNew, username };
}

type Method = "google" | "kakao" | "naver"

function Login() {
  const { isNew, username } = useLoaderData<typeof clientLoader>();

  const handleLogin = (method: Method) => {
    window.location.assign(`${import.meta.env.VITE_API_URL}/api/auth/login/${method}?username=${username}`)
  }

  return (
    <>
      <Flex h='100vh' w='100vw' justify={"center"} align={"center"}>
        <Stack w='30vw' justify={"center"} align={"center"}>
          <Title className={classes.Title}>SSHS TIPS</Title>
          {isNew ?
            <Title order={4} className={classes.Title}>{username} 님, 연동하여 사용할 계정을 선택해 주세요</Title>
            :
            <></>}
          <UnstyledButton className={`${classes.LoginButton} ${classes.Google}`} onClick={() => handleLogin("google")}>구글 계정으로 로그인</UnstyledButton>
          <button className={`${classes.LoginButton} ${classes.Kakao}`} onClick={() => handleLogin("kakao")}>카카오 계정으로 로그인</button>
          <UnstyledButton className={`${classes.LoginButton} ${classes.Naver}`} onClick={() => handleLogin("naver")}>네이버 계정으로 로그인</UnstyledButton>
        </Stack>
      </Flex>
    </>
  )
}

export default Login