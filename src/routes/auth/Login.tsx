import { Box, Flex, Image, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router';
/* Separate bindings, not a merged `classes` object — only one rule is needed
   from the shared module. The import is also what keeps shared.module.css alive
   on this route: a CSS module import with no used bindings is tree-shaken, and
   `shared.JalnanGothic` below is what delivers the @font-face that both these
   Titles and `.LoginButton`'s font-family depend on now that login.module.css
   no longer declares its own copy. */
import shared from '../../styles/shared.module.css'
import classes from './login.module.css'
import { z } from 'zod'
import { http } from '../../libs/http';
import appLogo from '../../assets/sshs.png';

export async function clientLoader({ request }: LoaderFunctionArgs) {
  try {
    await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);

    // if succeed in fetching user, go to home!
    throw redirect("/home")
  } catch (err) {
    if (err instanceof Response) throw err;
    const url = new URL(request.url);

    const parsed = z.object({ new: z.string().optional(), username: z.string().optional(), error: z.string().optional() })
      .safeParse(Object.fromEntries(url.searchParams));

    const isNew = parsed.success && parsed.data.new === "1";
    const username = parsed.success && parsed.data.username ?
      decodeURIComponent(parsed.data.username) : ""
    // Set by the backend OAuth callback on a non-signup failure (see authRouter redirectLoginError)
    const loginError = parsed.success && parsed.data.error ? parsed.data.error : null;
    return { isNew, username, loginError };
  }
}

type Method = "google" | "kakao" | "naver"

function Login() {
  const { isNew, username, loginError } = useLoaderData<typeof clientLoader>();

  const handleLogin = (method: Method) => {
    window.location.assign(`${import.meta.env.VITE_API_URL}/api/auth/login/${method}?username=${encodeURIComponent(username)}`)
  }

  return (
    <Flex className={classes.authShell} mih="100dvh" w="100%" justify="center" align="center" px="md">
      <Box className={classes.orbit} aria-hidden="true" />
      <Box className={classes.orbitSmall} aria-hidden="true" />
      <Box className={classes.authPanel}>
        <Stack align="center" gap={0}>
          <Box className={`${classes.brand} ${classes.revealOne}`}>
            <Box className={classes.logoFrame}>
              <Image src={appLogo} alt="SSHS" className={classes.logo} />
            </Box>
            <Text className={classes.eyebrow}>SEOUL SCIENCE HIGH SCHOOL</Text>
          </Box>

          <Box className={`${classes.copy} ${classes.revealTwo}`}>
            <Title className={shared.JalnanGothic} ta="center">SSHS TIPS</Title>
            <Text className={classes.subtitle} ta="center">
              {isNew ? `${username} 님, 환영합니다` : '다시, 공부를 시작해볼까요?'}
            </Text>
            <Text className={classes.description} ta="center">
              {isNew ? '연동할 계정을 선택해주세요' : '학교 생활과 공부에 필요한 이야기를 만나보세요'}
            </Text>
          </Box>

          {loginError && (
            <Text c="red" fw={500} ta="center" mb="sm">
              로그인에 실패했습니다. 다시 시도해주세요.
            </Text>
          )}

          <Stack className={`${classes.providers} ${classes.revealThree}`} gap="sm" w="100%">
            <UnstyledButton className={`${classes.LoginButton} ${classes.Google}`} onClick={() => handleLogin("google")}>
              <span className={classes.providerMark}>G</span><span>구글 계정으로 계속하기</span>
            </UnstyledButton>
            <UnstyledButton className={`${classes.LoginButton} ${classes.Kakao}`} onClick={() => handleLogin("kakao")}>
              <span className={classes.providerMark}>k</span><span>카카오 계정으로 계속하기</span>
            </UnstyledButton>
            <UnstyledButton className={`${classes.LoginButton} ${classes.Naver}`} onClick={() => handleLogin("naver")}>
              <span className={classes.providerMark}>N</span><span>네이버 계정으로 계속하기</span>
            </UnstyledButton>
          </Stack>

          <Text className={`${classes.footerNote} ${classes.revealFour}`} ta="center">
            SSHS TIPS <span>·</span> 학생들을 위한 학습 커뮤니티
          </Text>
        </Stack>
      </Box>
    </Flex>
  )
}

export default Login