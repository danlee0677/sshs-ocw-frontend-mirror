import classes from './main.module.css'
import { Button, Flex, Group, Image, Stack, Space, Text, Title, ScrollArea, Divider, Highlight } from "@mantine/core";
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

                                    <Text className={classes.Text2}>이미 계정이 있으신가요? <Text onClick={() => navigate("/login")} className={classes.Link}>로그인 하러 가기</Text></Text>
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
                                    <ScrollArea h={'400px'}>
                                        <Text size="xl" className={classes.JalnanGothic}>관심 있는 분야가 무엇인가요?</Text>

                                        <Highlight highlight='물리학:' >물리학: 자연 현상을 설명하는 기본 법칙을 다루는 학문으로서, 역학(뉴턴의 운동법칙, 에너지·운동량, 회전운동)과 전자기학(전기·자기장, 가우스 법칙, 유도, 회로)을 중심으로 한다. 열역학·파동·광학을 거쳐 특수상대성이론과 양자역학의 기초까지 이어진다.</Highlight>
                                        <Divider my={'md'}></Divider>
                                        <Highlight highlight='화학:'>화학: 물질의 성질과 변화를 원자·분자 수준에서 이해하는 학문으로서, 열화학·열역학과 원자 구조(양자론, 오비탈, 전자배치), 주기적 성질과 화학 결합을 다룬다. 용액·평형·산염기, 자발성(엔트로피·깁스), 반응 속도·촉매, 탄소 화합물과 산화·환원(전지·전기분해)까지 이어진다.</Highlight>
                                        <Divider my={'md'}></Divider>
                                        <Highlight highlight={'생명과학:'}>생명과학: 생명 현상이 어떻게 유지되고 조절되는지 탐구하는 학문으로서, 세포의 구조와 기능에서 출발해 유전과 발현, 대사와 항상성, 진화와 생태로 확장된다. 효소 작용처럼 생체 반응의 속도와 조절을 설명하는 내용도 함께 다룬다.</Highlight>
                                        <Divider my={'md'}></Divider>
                                        <Highlight highlight={'지구과학:'}>지구과학: 지구와 우주를 하나의 시스템으로 이해하는 학문으로서, 지질학(광물·암석·지질 구조·지질 시대, 한반도 지질)과 지구물리(지진파, 중력장·자기장, 판구조론)를 다룬다. 대기·해양의 운동과 순환, ENSO·기후변화, 천체의 운동과 별·은하·우주론까지 이어진다.</Highlight>

                                    </ScrollArea>
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