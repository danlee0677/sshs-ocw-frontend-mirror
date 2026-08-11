/* newuser.module.css is GONE. All four of its rules — .JalnanGothic, .Link (+ an
   UNGATED .Link:hover), .Text1 and .Text2 — were stale copies of rules
   shared.module.css already owns: .Text1 was byte-identical, and .Text2/.Link
   still carried the pre-dark-mode `color: gray` that shared converted to
   var(--mantine-color-dimmed). Recoloring them in place would have left four
   duplicates alive and one hover rule outside the
   `@media (hover: hover) and (pointer: fine)` gate the Hover contract requires.
   Same outcome main.module.css and setting.module.css reached. */
import classes from '../../styles/shared.module.css'
import { Button, Flex, Group, Image, Stack, Space, Text, Title } from "@mantine/core";
import { Link } from 'react-router';
import logo from "@/assets/sshs.png"

export default function NewUser({ setStep }: { setStep: React.Dispatch<React.SetStateAction<number>> }) {
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
            <Image src={logo} h={'50px'} w={'50px'}></Image>
            <Title className={classes.JalnanGothic}>SSHS TIPS</Title>
          </Group>
          {/* Was classes.Text1, whose `width: 70%` compounded with this Stack's
              own width down to ~63% of a 360px screen. shared.Text1 is read by
              four other consumers, so the class is dropped here rather than edited. */}
          <Text w="100%">
            SSHS TIPS는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.<br></br>
            서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
          </Text>
        </Stack>
        <Space w="md" />
        <Flex w={{ base: '90%', md: '30%' }} justify="center" align="center">
          <Stack gap="md" align="center" justify="center" >
            <Text size="xl" className={classes.JalnanGothic}>관심 있는 분야가 무엇인가요?</Text>
            <Text size="sm">
              <Text component="span" fw={700} c="blue">물리학: </Text>
              자연 현상을 설명하는 기본 법칙을 다루는 학문으로서, 역학(뉴턴의 운동법칙, 에너지·운동량, 회전운동)과 전자기학(전기·자기장, 가우스 법칙, 유도, 회로)을 중심으로 한다. 열역학·파동·광학을 거쳐 특수상대성이론과 양자역학의 기초까지 이어진다.
            </Text>
            <Text size="sm">
              <Text component="span" fw={700} c="blue">화학: </Text>
              물질의 성질과 변환을 원자·분자 수준에서 이해하는 학문으로서, 열화학·열역학과 원자 구조(양자수, 오비탈, 전자배치), 주기적 성질과 화학 결합을 다룬다. 용액·평형·산염기, 기체성(엔트로피·깁스), 반응 속도·촉매, 탄소 화합물과 산화·환원(전지·전기분해)까지 이어진다.
            </Text>
            <Text size="sm">
              <Text component="span" fw={700} c="blue">생명과학: </Text>
              생명 현상이 어떻게 유지되고 조절되는지 탐구하는 학문으로서, 세포의 구조와 기능에서 출발해 유전과 발현, 대사와 항상성, 진화와 생태로 확장된다. 효소 작용처럼 생체 반응의 속도와 조절을 설명하는 내용도 함께 다룬다.
            </Text>
            <Text size="sm">
              <Text component="span" fw={700} c="blue">지구과학: </Text>
              지구와 우주의 환경 및 변화 과정을 탐구하는 학문으로서, 고체 지구(지각 변동, 판구조론, 지구의 역사)와 유체 지구(대기와 해양의 순환, 일기와 기후 변화)를 중심으로 다룬다. 지구 시스템의 상호작용을 거쳐 태양계, 별의 진화, 은하 및 우주의 팽창을 탐구하는 천문학 영역까지 이어진다.
            </Text>
            <Button variant="outline" mih={44} onClick={() => setStep((st) => (st + 1))}>시작하기</Button>
            <Text className={classes.Text2}>이미 계정이 있으신가요? <Link to="/login" className={classes.Link}>로그인 하러 가기</Link></Text>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  )
}