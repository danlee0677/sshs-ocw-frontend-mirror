import { Flex, Stack, Title, UnstyledButton } from '@mantine/core'
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

export async function clientLoader({ request }: LoaderFunctionArgs) {
  try {
    await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);

    // if succeed in fetching user, go to home!
    throw redirect("/home")
  } catch (err) {
    if (err instanceof Response) throw err;
    const url = new URL(request.url);

    const parsed = z.object({ new: z.string().optional(), username: z.string().optional() })
      .safeParse(Object.fromEntries(url.searchParams));

    const isNew = parsed.success && parsed.data.new === "1";
    const username = parsed.success && parsed.data.username ?
      decodeURIComponent(parsed.data.username) : ""
    return { isNew, username };
  }
}

type Method = "google" | "kakao" | "naver"

function Login() {
  const { isNew, username } = useLoaderData<typeof clientLoader>();

  const handleLogin = (method: Method) => {
    window.location.assign(`${import.meta.env.VITE_API_URL}/api/auth/login/${method}?username=${username}`)
  }

  return (
    <>
      {/* mih, not h: a fixed height plus align/justify center pushes any overflow
          above the container's top edge, where body scroll cannot reach it — and
          the isNew branch below adds a long Korean title that wraps to several
          lines on a phone. 100vw also included the desktop scrollbar width. */}
      <Flex mih='100dvh' w='100%' justify={"center"} align={"center"} py="xl" px="md">
        {/* Was w='30vw' — 96px at 320px, narrower than every one of the three
            Korean button labels, and the single worst number in this file.
            maw is not inert here: it binds across the 768–992px band, where
            60% exceeds 480. No mx="auto" — the parent Flex already centres. */}
        <Stack w={{ base: '100%', sm: '60%', md: 400 }} maw={480} justify={"center"} align={"center"}>
          {/* shared.JalnanGothic replaces the local `.Title`, which was the same
              single font-family declaration. */}
          <Title className={shared.JalnanGothic} ta="center">SSHS TIPS</Title>
          {isNew ?
            <Title order={4} className={shared.JalnanGothic} ta="center">{username} 님, 연동하여 사용할 계정을 선택해 주세요</Title>
            :
            <></>}
          <UnstyledButton className={`${classes.LoginButton} ${classes.Google}`} onClick={() => handleLogin("google")}>구글 계정으로 로그인</UnstyledButton>
          {/* Was a raw <button> between two UnstyledButtons carrying the same
              three classes, so it missed Mantine's button reset and could render
              subtly differently from its neighbours. No <Form> wraps these, so
              there was never a submit hazard — this is consistency only. */}
          <UnstyledButton className={`${classes.LoginButton} ${classes.Kakao}`} onClick={() => handleLogin("kakao")}>카카오 계정으로 로그인</UnstyledButton>
          <UnstyledButton className={`${classes.LoginButton} ${classes.Naver}`} onClick={() => handleLogin("naver")}>네이버 계정으로 로그인</UnstyledButton>
        </Stack>
      </Flex>
    </>
  )
}

export default Login