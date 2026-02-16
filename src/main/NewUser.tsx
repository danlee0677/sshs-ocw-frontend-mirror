import classes from './main.module.css'
import { Button, Flex, Group, Image, Stack, Space, Text, Title } from "@mantine/core";
import { Link } from 'react-router';
import type { NavigateFunction } from 'react-router';
import logo from "@/assets/app-logo.png"

function NewUser({ setStep, isMobile, navigate }: { setStep: Function, isMobile: boolean, navigate: NavigateFunction }) {
  return (
    <>
      {isMobile ? (
        <>
          <Flex w="100vw" h="100vh" justify="center" align="center">
            <Stack w="100%" h="100%" gap="xl" justify="center" align="center">
              <Stack w="80%" h="100%" justify="center" align="center">
                <Group>
                  <Image src={logo} h={'50px'} w={'50px'}></Image>
                  <Title className={classes.JalnanGothic}>SSHS OCW</Title>
                </Group>
                <Text className={classes.Text1}>
                  SSHS OCW는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.<br></br>
                  서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
                </Text>
                <Button>둘러보기</Button>
              </Stack>
              <Space w="md" />
              <Flex w="80%" h="100%" justify="center" align="center">
                <Stack gap="md" align="center" justify="center" >

                  <Text size="xl" className={classes.JalnanGothic}>관심 있는 분야가 무엇인가요?</Text>

                  <Text size="l">뭔가 삐까뻔적한 뭐 과학 소개라던지 아무거나</Text>

                  <Button onClick={() => setStep((st: number) => (st + 1))}>시작하기</Button>

                  <Text className={classes.Text2}>이미 계정이 있으신가요?</Text>
                  <Text onClick={() => navigate("/login")} className={classes.Link}>로그인 하러 가기</Text>
                </Stack>
              </Flex>
            </Stack>
          </Flex>
        </>
      ) : (
        <>
          <Flex w="100vw" h="100vh" justify="center" align="center">
            <Group w="100%" h="100%" gap="xl" justify="center" align="center">
              <Stack w="40%" h="100%" justify="center" align="center">
                <Group>
                  <Image src={logo} h={'50px'} w={'50px'}></Image>
                  <Title className={classes.JalnanGothic}>SSHS OCW</Title>
                </Group>
                <Text className={`${classes.Text1} `}>
                  SSHS OCW는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.<br></br>
                  서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
                </Text>
                <Button component={Link} to={'/home'}>둘러보기</Button>
              </Stack>
              <Space w="md" />
              <Flex w="30%" h="100%" justify="center" align="center">
                <Stack gap="md" align="center" justify="center" >
                  <Text size="xl" className={classes.JalnanGothic}>관심 있는 분야가 무엇인가요?</Text>

                  <Text size="l">뭔가 삐까뻔적한 뭐 과학 소개라던지 아무거나</Text>

                  <Button onClick={() => setStep((st: number) => (st + 1))}>시작하기</Button>
                  <Text className={classes.Text2}>이미 계정이 있으신가요? <Link to="/login" className={classes.Link}>로그인 하러 가기</Link></Text>
                </Stack>
              </Flex>
            </Group>
          </Flex>
        </>
      )}
    </>
  )
}

export default NewUser;