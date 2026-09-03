import { useEffect, useState } from 'react';
import { Flex, Image, Paper, Stack, Text, UnstyledButton } from '@mantine/core'
import { Link, redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { useMediaQuery } from '@mantine/hooks';
import shared from '../../styles/shared.module.css'
import classes from './login.module.css'
import { z } from 'zod'
import { http } from '../../libs/http';
import { TAP_TARGET, TOUCH_QUERY } from '../../libs/styles';
import { useAppLogo } from '../../components/appshell/useAppLogo';

// 세 로고 모두 각 사 공식 배포 자산에서 추출한 것입니다.
//   google : signin-assets.zip @4x 아이콘 버튼에서 컬러 G만 크롭 (80x80)
//            SVG 버전은 쓰지 않습니다 — 새 구글 로고는 conic-gradient를
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
//            기존의 '카카오 계정으로 로그인'은 목록에 없는 문구였습니다.
//   google : 'Sign in with Google'의 현지화가 허용·권장됩니다.
//   naver  : 문구 규정이 따로 없어 카카오와 형식을 맞췄습니다.
const PROVIDERS: { method: Method; label: string; logo: string; cls: string }[] = [
  { method: 'google', label: 'Google로 로그인', logo: googleLogo, cls: classes.Google },
  { method: 'kakao', label: '카카오 로그인', logo: kakaoLogo, cls: classes.Kakao },
  { method: 'naver', label: '네이버 로그인', logo: naverLogo, cls: classes.Naver },
]

function Login() {
  const { isNew, username } = useLoaderData<typeof clientLoader>();
  const appLogo = useAppLogo();

  // NewUser.tsx와 같은 패턴. 마우스에서는 undefined, 손가락에서는 44px.
  const tapMin = useMediaQuery(TOUCH_QUERY, false, { getInitialValueInEffect: false })
    ? TAP_TARGET
    : undefined;

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
    <Flex w="100%" mih="100dvh" justify="center" align="center" py="xl" px="md">
      <Stack w={{ base: '100%', sm: '60%', md: 400 }} maw={480} gap="lg" align="center">

        {/* 랜딩(NewUser.tsx)과 같은 로고. useAppLogo()가 다크모드 교체까지 처리합니다. */}
        <Image src={appLogo} h="50px" w="auto" fit="contain" alt="SSHS TIPS" />

        {/* Paper withBorder — Home.tsx의 스트릭 카드/최근 강좌 카드와 같은 표면 규칙.
            radius는 'lg'(16px). 안쪽 버튼이 카카오 규정상 12px이므로
            카드가 그보다 덜 둥글면 어색해집니다. */}
        <Paper withBorder radius="lg" p={{ base: 'lg', sm: 'xl' }} w="100%" className={classes.LoginCard}>
          <Stack gap={0}>

            {isNew ? (
              // username을 별도 요소로 분리해 clamp합니다. 안내 문구와 한 덩어리로
              // 두면 이름이 길 때 안내까지 통째로 잘려 나갑니다.
              // 잘난고딕은 이름에만 — Home.tsx의 이름 Title과 같은 규칙입니다.
              <Stack gap={2} align="center" w="100%" mb="xl">
                <Text className={`${shared.JalnanGothic} ${classes.NewUserName}`} size="xl" ta="center" w="100%">
                  {username} 님
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  연동하여 사용할 계정을 선택해 주세요
                </Text>
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" ta="center" mb="xl">
                서울과학고 학생들이 만든 온라인 강의 플랫폼
              </Text>
            )}

            <Stack gap={10} w="100%">
              {PROVIDERS.map(({ method, label, logo, cls }) => (
                <UnstyledButton
                  key={method}
                  className={`${classes.LoginButton} ${cls}`}
                  mih={tapMin}
                  disabled={pending !== null}
                  data-idle={(pending !== null && pending !== method) || undefined}
                  onClick={() => handleLogin(method)}
                >
                  {/* alt="" — 바로 옆 라벨이 같은 정보를 담고 있어
                      스크린리더에 두 번 읽히지 않게 빈 alt를 씁니다. */}
                  <img src={logo} alt="" className={classes.LogoImg} />
                  <span className={classes.Label}>
                    {pending === method ? '이동 중…' : label}
                  </span>
                </UnstyledButton>
              ))}
            </Stack>

          </Stack>
        </Paper>

        {/* 랜딩의 "이미 계정이 있으신가요? 로그인 하러 가기"와 짝을 이루는 역방향 링크.
            지금은 /login에 직접 들어오면 돌아갈 방법이 없습니다.
            목적지가 가입 폼이 아니라 서비스 소개 화면(StartPage step 0)이므로
            문구도 그렇게 적었습니다 — Join은 독립 라우트가 아니라
            StartPage의 state라서 직접 가리킬 URL이 없습니다. */}
        {!isNew && (
          <Text className={shared.Text2} size="sm" ta="center">
            처음이신가요? <Link to="/" className={shared.Link}>서비스 소개 보기</Link>
          </Text>
        )}

      </Stack>
    </Flex>
  )
}

export default Login