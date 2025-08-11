import React from "react";
import classes from './main.module.css'
import { useMediaQuery } from '@mantine/hooks';
import { Button, Flex, Grid, Group, Image, SimpleGrid, Stack, Space, Table, Text, Title, UnstyledButton } from "@mantine/core";
import MainPageHeader from "./MainPageAppshell";
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react'

const items = [
    { src: '/img/math.png', alt: 'math', sub: '수학' },
    { src: '/img/physics.png', alt: 'physics', sub: '물리' },
    { src: '/img/chemistry.png', alt: 'chemistry', sub: '화학' },
    { src: '/img/biology.png', alt: 'biology', sub: '생물' },
    { src: '/img/geology.png', alt: 'earth-science', sub: '지학' },
    { src: '/img/coding.png', alt: 'coding', sub: '정보' },
];

function Main() {
    const [toggled, setToggled] = useState(Array(items.length).fill(false));
    const toggle = (i: Number) =>
        setToggled((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

    const isMobile = useMediaQuery('(max-width: 60em)');

    return (
        <>
            {isMobile ? (
                <>
                    <Flex w="100vw" h="100vh" justify="center" align="center">
                        <Stack w="100%" h="100%" gap="xl" justify="center" align="center">
                            <Stack w="80%" h="100%" justify="center" align="center">
                                <Title className={classes.Text2}>SSHS OCW</Title>
                                <Text className={classes.Text1}>
                                    SSHS OCW는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.<br></br>
                                    서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
                                </Text>
                                <Button>둘러보기</Button>
                            </Stack>
                            <Space w="md" />
                            <Flex w="80%" h="100%" justify="center" align="center">
                                <Stack gap="md" align="center" justify="center" >
                                    <Text size="xl" className={classes.Title2}>관심 있는 분야가 무엇인가요?</Text>
                                    <SimpleGrid verticalSpacing="md" cols={3}>
                                        {items.map((item, i) => (
                                            <UnstyledButton
                                                onClick={() => toggle(i)}
                                                aria-pressed={toggled[i]}
                                                className={`${classes.selectBox} ${classes.Vertical_align} ${toggled[i] ? classes.selected : ''}`}
                                            >
                                                <Image src={item.src} alt={item.alt} className={classes.UndraggableImage} w='80%'/>
                                                <Text className={classes.ButtonText}>{item.sub}</Text>
                                            </UnstyledButton>
                                        ))}
                                    </SimpleGrid>
                                    <Button>시작하기</Button>
                                    <Text className={classes.Text2}>이미 계정이 있으신가요? <Link to="/login" className={classes.Link}>로그인 하러 가기</Link></Text>
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
                                <Title className={classes.Title2}>SSHS OCW</Title>
                                <Text className={`${classes.Text1} `}>
                                    SSHS OCW는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.<br></br>
                                    서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
                                </Text>
                                <Button>둘러보기</Button>
                            </Stack>
                            <Space w="md" />
                            <Flex w="30%" h="100%" justify="center" align="center">
                                <Stack gap="md" align="center" justify="center" >
                                    <Text size="xl" className={classes.Title2}>관심 있는 분야가 무엇인가요?</Text>
                                    <SimpleGrid verticalSpacing="md" cols={3}>
                                        {items.map((item, i) => (
                                            <UnstyledButton
                                                onClick={() => toggle(i)}
                                                aria-pressed={toggled[i]}
                                                className={`${classes.selectBox} ${classes.Vertical_align} ${toggled[i] ? classes.selected : ''}`}
                                            >
                                                <Image src={item.src} alt={item.alt} className={classes.UndraggableImage} w="80%" />
                                                <Text className={classes.ButtonText}>{item.sub}</Text>
                                            </UnstyledButton>
                                        ))}
                                    </SimpleGrid>
                                    <Button>시작하기</Button>
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

export default Main;