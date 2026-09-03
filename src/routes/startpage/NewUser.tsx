import classes from '../../styles/shared.module.css'
import { Button, Flex, Group, Image, Stack, Space, Text } from "@mantine/core";
import { Link } from 'react-router';
import { useMediaQuery } from '@mantine/hooks';
import { TAP_TARGET, TOUCH_QUERY } from '../../libs/styles';
import { useAppLogo } from '../../components/appshell/useAppLogo';

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
  // `undefined` on a mouse, 44 on a finger — see TOUCH_QUERY. This button is a
  // full-width child of a Stack, so an unconditional 44 made it a slab.
  const tapMin = useMediaQuery(TOUCH_QUERY, false, { getInitialValueInEffect: false })
    ? TAP_TARGET
    : undefined;

  return (
    /* mih, NOT h: four long Korean paragraphs overflow 100dvh well before 320px,
       and a fixed height plus align/justify center puts that overflow above the
       container's top edge where body scroll cannot reach it. 100vw separately
       included the desktop scrollbar width.

       Every descendant h="100%" went with it, in the same edit and not by
       coincidence: once this parent is sized by `mih` its height is indefinite,
       so a child's `height: 100%` resolves to `auto` and the element collapses.

       The old `const Container = isMobile ? Stack : Group` lived here. It shadowed
       Mantine's Container — which root.tsx now registers theme defaultProps for,
       so a reader had every reason to assume that is what it was — and it branched
       on width in JS where CSS expresses it directly. `md` (62em) is the nearest
       Mantine token to the 60em the deleted useMediaQuery used; STACK_TO_ROW is
       deliberately not used here, since its `sm` would flip the layout 14em early. */
    <Flex w="100%" mih="100dvh" justify="center" align="center" py="xl">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        w="100%"
        gap="xl"
        justify="center"
        align="center"
      >
        <Stack w={{ base: '90%', md: '40%' }} justify="center" align="center">
          <Group>
            {/* alt 추가: 기존에는 속성 자체가 없어 스크린리더가 파일 경로를
                그대로 읽었습니다. 로고는 홈으로 가는 링크가 아니라 단순
                표식이므로 무엇의 로고인지만 적습니다.

                h는 반응형입니다. 모바일에서 80px을 그대로 쓰면 로고 하나가
                첫 화면의 상당 부분을 차지합니다. */}
            <Image src={useAppLogo()} h={{ base: '56px', sm: '80px' }} w="auto" fit="contain" alt="SSHS TIPS" />
          </Group>
          {/* Was classes.Text1, whose `width: 70%` compounded with this Stack's
              own width down to ~63% of a 360px screen. shared.Text1 is read by
              four other consumers, so the class is dropped here rather than edited.

              <br>은 같은 문단 안의 줄바꿈이지 문단 구분이 아닙니다. 두 개의
              <Text>로 나누고 Stack의 gap으로 간격을 제어하면 의미도 맞고
              간격 조절도 한 곳에서 됩니다. lh는 Mantine 기본값 1.55보다
              넓혀 읽기 편하게 한 값입니다. */}
          <Stack w="100%" gap="lg">
            <Text size="lg" lh={1.9}>
              SSHS TIPS는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.
            </Text>
            <Text size="lg" lh={1.9}>
              서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
            </Text>
          </Stack>
        </Stack>
        <Space w="md" />
        <Flex w={{ base: '90%', md: '30%' }} justify="center" align="center">
          <Stack gap="md" align="center" justify="center" >
            <Text size="xl" className={classes.JalnanGothic}>무엇을 배울 수 있나요?</Text>

            {/* c="blue"(blue.6)는 흰 배경에서 3.56:1로 WCAG AA(4.5:1) 미달이었습니다.
                14px 굵은 글씨는 large text 기준(18.66px bold)에 못 미쳐 4.5:1이
                필요합니다. blue.8은 5.02:1로 통과합니다. */}
            {SUBJECTS.map(({ name, desc }) => (
              <Text key={name} size="sm" w="100%">
                <Text component="span" fw={700} c="blue.8">{name}: </Text>
                {desc}
              </Text>
            ))}

            {/* variant="outline" → "filled". 바로 아래 로그인 링크가 잘난고딕이라
                더 굵고 진해서, 주 행동이 부 행동보다 약해 보이는 위계 역전이
                있었습니다. */}
            <Button variant="filled" size="md" mih={tapMin} onClick={() => setStep((st) => (st + 1))}>시작하기</Button>
            <Text className={classes.Text2}>이미 계정이 있으신가요? <Link to="/login" className={classes.Link}>로그인 하러 가기</Link></Text>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  )
}