import { useEffect, useState } from 'react';
import { Box, Flex, Image, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router';
/* Separate bindings, not a merged `classes` object — only one rule is needed
   from the shared module. The import is also what keeps shared.module.css alive
   for this route. */
import shared from '../../styles/shared.module.css'
import classes from './login.module.css'
import { z } from 'zod'
import { http } from '../../libs/http';
import appLogo from '../../assets/sshs.png';

// 각 사 공식 배포 자산에서 추출한 로고입니다.
//   google : signin-assets.zip @4x 아이콘 버튼에서 컬러 G만 크롭 (80x80)
//            공식 SVG는 쓰지 않습니다 — 새 구글 로고는 conic-gradient를
//            foreignObject로 구현해서, <img src>로 부르면 그라디언트가
//            렌더링되지 않습니다(외부 SVG 문서에서 foreignObject 미지원).
//   kakao  : 카카오 로그인 버튼 리소스에서 말풍선 심볼만 분리 (40x38)
//   naver  : NAVER_Logo.ai(실제로는 PDF)의 워드마크 벡터에서 첫 글자 N 추출
import googleLogo from '../../assets/logo-google.png'
import kakaoLogo from '../../assets/logo-kakao.png'
import naverLogo from '../../assets/logo-naver.svg'

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

    // decodeURIComponent를 걸지 않습니다. URLSearchParams가 이미 디코딩한 값이라
    // 한 번 더 디코딩하면 닉네임에 '%'가 들어간 순간 URIError로 터집니다.
    // (action.check-username.ts가 encodeURIComponent 해서 넘겨주므로
    //  "백분율100%" → "?username=백분율100%25" → 여기서는 이미 "백분율100%")
    const username = parsed.success && parsed.data.username ? parsed.data.username : ""

    return { isNew, username };
  }
}

type Method = "google" | "kakao" | "naver"

// 라벨 문구는 각 사 규정을 따릅니다.
//   kakao  : 규정된 문구는 완성형 '카카오 로그인' / 축약형 '로그인' 뿐입니다.
//            '카카오 계정으로 계속하기'는 목록에 없는 문구였습니다.
//   google : 'Sign in with Google'의 현지화가 허용·권장됩니다.
//   naver  : 문구 규정이 없어 카카오와 형식을 맞췄습니다.
const PROVIDERS: { method: Method; label: string; logo: string; cls: string }[] = [
  { method: 'google', label: 'Google 계정으로 로그인', logo: googleLogo, cls: classes.Google },
  { method: 'kakao', label: '카카오 로그인', logo: kakaoLogo, cls: classes.Kakao },
  { method: 'naver', label: '네이버 로그인', logo: naverLogo, cls: classes.Naver },
]

function Login() {
  const { isNew, username } = useLoaderData<typeof clientLoader>();

  // OAuth는 전체 페이지 이동이라 실제 전환까지 1~2초 걸립니다.
  // 그 사이 아무 반응이 없으면 사용자가 연타합니다.
  const [pending, setPending] = useState<Method | null>(null);

  // 뒤로가기로 돌아오면 bfcache가 '이동 중…' 상태를 그대로 복원합니다.
  // iOS Safari에서 재현되며, 이 리셋이 없으면 버튼이 영구히 잠깁니다.
  useEffect(() => {
    const reset = () => setPending(null);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const handleLogin = (method: Method) => {
    if (pending) return;
    setPending(method);

    // encodeURIComponent 필수. 없으면 '&' 이후가 다른 쿼리 파라미터로 잘리고
    // '#' 이후는 프래그먼트라 서버에 전송조차 되지 않습니다. 결과적으로
    // 가입 화면에서 중복 확인을 통과한 이름과 실제 생성되는 계정 이름이 달라집니다.
    window.location.assign(
      `${import.meta.env.VITE_API_URL}/api/auth/login/${method}?username=${encodeURIComponent(username)}`
    )
  }

  return (
    <Flex className={classes.authShell} mih="100dvh" w="100%" justify="center" align="center" px="md">
      <Box className={classes.orbit} aria-hidden="true" />
      <Box className={classes.orbitSmall} aria-hidden="true" />
      <Box className={classes.authPanel}>
        <Stack align="center" gap={0}>
          <Box className={`${classes.brand} ${classes.revealOne}`}>
            <Box className={classes.logoFrame}>
              {/* 프레임이 두 스킴 모두에서 진한 남색이라 교표 한 장으로 충분합니다.
                  그래서 useAppLogo()의 다크 전환이 필요 없습니다.
                  alt="" — 바로 아래 h1이 'SSHS TIPS'를 이미 알려줍니다. */}
              <Image src={appLogo} alt="" className={classes.logo} />
            </Box>
            <Text className={classes.eyebrow}>SEOUL SCIENCE HIGH SCHOOL</Text>
          </Box>

          <Box className={`${classes.copy} ${classes.revealTwo}`}>
            <Title className={`${shared.JalnanGothic} ${classes.title}`} ta="center">SSHS TIPS</Title>
            {/* 이름이 들어가는 경우에만 clamp를 겁니다. 길이 제한이 백엔드에
                없어서 400자짜리 닉네임이 그대로 들어올 수 있습니다. */}
            <Text className={`${classes.subtitle} ${isNew ? classes.clamp : ''}`} ta="center">
              {isNew ? `${username} 님, 환영합니다` : '다시, 공부를 시작해볼까요?'}
            </Text>
            <Text className={classes.description} ta="center">
              {isNew ? '연동할 계정을 선택해주세요' : '학교 생활과 공부에 필요한 이야기를 만나보세요'}
            </Text>
          </Box>

          <Stack className={`${classes.providers} ${classes.revealThree}`} gap="sm" w="100%">
            {PROVIDERS.map(({ method, label, logo, cls }) => (
              <UnstyledButton
                key={method}
                className={`${classes.LoginButton} ${cls}`}
                disabled={pending !== null}
                data-idle={(pending !== null && pending !== method) || undefined}
                onClick={() => handleLogin(method)}
              >
                {/* alt="" — 옆 라벨이 같은 정보를 담고 있어 스크린리더에
                    두 번 읽히지 않게 빈 alt를 씁니다. */}
                <img src={logo} alt="" className={classes.providerMark} />
                <span>{pending === method ? '이동 중…' : label}</span>
              </UnstyledButton>
            ))}
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