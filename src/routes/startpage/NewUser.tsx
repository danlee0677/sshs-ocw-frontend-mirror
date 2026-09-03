import { Box, Button, Flex, Image, Stack, Text, Title } from "@mantine/core";
import { Link } from 'react-router';
import { useMediaQuery } from '@mantine/hooks';
import shared from '../../styles/shared.module.css'
import classes from './newUser.module.css'
import { TAP_TARGET, TOUCH_QUERY } from '../../libs/styles';
import appLogo from '../../assets/sshs.png';

// 과목 목록을 데이터로 분리했습니다. 같은 형태의 <Text> 네 덩어리를 손으로
// 반복하면 한 곳만 고치고 나머지를 빠뜨리기 쉽습니다(실제로 c="blue"가
// 네 군데 흩어져 있었습니다).
const SUBJECTS: { name: string; desc: string }[] = [
  { name: '물리학', desc: '역학, 전자기학, 열역학, 상대성이론, 양자역학' },
  { name: '화학', desc: '원자 구조, 화학 결합, 반응 속도, 산화·환원' },
  { name: '생명과학', desc: '세포, 유전, 대사와 항상성, 진화와 생태' },
  { name: '지구과학', desc: '지각 변동, 대기·해양 순환, 천체와 우주' },
];

export default function NewUser({ setStep }: { setStep: React.Dispatch<React.SetStateAction<number>> }) {
  // `undefined` on a mouse, 44 on a finger — see TOUCH_QUERY.
  const tapMin = useMediaQuery(TOUCH_QUERY, false, { getInitialValueInEffect: false })
    ? TAP_TARGET
    : undefined;

  return (
    /* mih, NOT h: 네 개의 긴 한국어 문단은 320px 폭에서 100dvh를 넘습니다.
       고정 높이 + align/justify center는 넘친 부분을 컨테이너 위쪽으로
       밀어내 body 스크롤이 닿지 못하게 만듭니다. 100vw는 데스크톱
       스크롤바 폭까지 포함했습니다. */
    <Flex className={classes.shell} w="100%" mih="100dvh" justify="center" align="center" py="xl" px="md">
      <Box className={classes.orbit} aria-hidden="true" />
      <Box className={classes.spark} aria-hidden="true" />

      <Flex
        className={classes.content}
        direction={{ base: 'column', md: 'row' }}
        w="100%"
        maw={1080}
        gap={{ base: 'xl', md: 48 }}
        justify="center"
        align="center"
      >
        {/* 왼쪽: 브랜드 + 소개 */}
        <Stack className={classes.revealOne} w={{ base: '100%', md: '50%' }} align="center" gap="lg">
          <Stack align="center" gap={0}>
            <Box className={classes.logoFrame}>
              {/* alt="" — 바로 아래 h1이 'SSHS TIPS'를 이미 알려줍니다. */}
              <Image src={appLogo} alt="" className={classes.logo} />
            </Box>
            <Text className={classes.eyebrow}>SEOUL SCIENCE HIGH SCHOOL</Text>
          </Stack>

          <Title className={shared.JalnanGothic} ta="center" order={1} fz={{ base: '2rem', sm: '2.5rem' }}>
            SSHS TIPS
          </Title>

          {/* <br>은 같은 문단 안의 줄바꿈이지 문단 구분이 아닙니다. 두 개의
              <Text>로 나누고 Stack의 gap으로 간격을 제어하면 의미도 맞고
              간격 조절도 한 곳에서 됩니다. lh는 Mantine 기본값 1.55보다
              넓혀 읽기 편하게 한 값입니다. */}
          <Stack w="100%" gap="md" className={classes.intro}>
            <Text size="lg" lh={1.9}>
              SSHS TIPS는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.
            </Text>
            <Text size="lg" lh={1.9}>
              서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
            </Text>
          </Stack>
        </Stack>

        {/* 오른쪽: 로그인 화면과 같은 패널 */}
        <Box className={`${classes.panel} ${classes.revealTwo}`} w={{ base: '100%', md: '50%' }} maw={480}>
          <Stack gap="md" align="center">
            <Text size="xl" className={shared.JalnanGothic} ta="center">무엇을 배울 수 있나요?</Text>

            <Stack gap="sm" w="100%">
              {SUBJECTS.map(({ name, desc }) => (
                <Text key={name} size="sm" w="100%">
                  <Text component="span" className={classes.subjectName}>{name}</Text>
                  {'  '}
                  <Text component="span" className={classes.subjectDesc}>{desc}</Text>
                </Text>
              ))}
            </Stack>

            {/* variant="outline" → "filled". 바로 아래 로그인 링크가 잘난고딕이라
                더 굵고 진해서, 주 행동이 부 행동보다 약해 보이는 위계 역전이
                있었습니다. */}
            <Button variant="filled" size="md" mt="sm" mih={tapMin} onClick={() => setStep((st) => (st + 1))}>
              시작하기
            </Button>

            <Text className={classes.footerLink} ta="center">
              이미 계정이 있으신가요? <Link to="/login">로그인 하러 가기</Link>
            </Text>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  )
}