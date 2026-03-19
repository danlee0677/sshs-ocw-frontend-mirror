import classes from './newuser.module.css'
import { Button, Flex, Group, Image, Stack, Space, Text, Title } from "@mantine/core";
import { Link } from 'react-router';
import logo from "@/assets/app-logo.png"

export default function NewUser({ setStep, isMobile }: { setStep: Function, isMobile: boolean }) {
  const Container = isMobile ? Stack : Group;
  const containerWidth = isMobile ? "80%" : "40%";
  const rightWidth = isMobile ? "80%" : "30%";

  return (
    <Flex w="100vw" h="100vh" justify="center" align="center">
      <Container w="100%" h="100%" gap="xl" justify="center" align="center">
        <Stack w={containerWidth} h="100%" justify="center" align="center">
          <Group>
            <Image src={logo} h={'50px'} w={'50px'}></Image>
            <Title className={classes.JalnanGothic}>SSHS TIPS</Title>
          </Group>
          <Text className={classes.Text1}>
            SSHS TIPS는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.<br></br>
            서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
          </Text>
        </Stack>
        <Space w="md" />
        <Flex w={rightWidth} h="100%" justify="center" align="center">
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
            <Button variant="outline" onClick={() => setStep((st: number) => (st + 1))}>시작하기</Button>
            <Text className={classes.Text2}>이미 계정이 있으신가요? <Link to="/login" className={classes.Link}>로그인 하러 가기</Link></Text>
          </Stack>
        </Flex>
      </Container>
    </Flex>
  )
}