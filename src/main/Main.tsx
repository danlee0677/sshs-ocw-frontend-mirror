import React from "react";
import '@mantine/core/styles.css'
import classes from './main.module.css'
import { Button, Flex, Grid, Image, Table, Text, Title, UnstyledButton } from "@mantine/core";
import MainPageHeader from "./MainPageAppshell";
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react'

const items = [
  { src: '/img/math.png', alt: 'math' },
  { src: '/img/physics.png', alt: 'physics' },
  { src: '/img/chemistry.png', alt: 'chemistry' },
  { src: '/img/biology.png', alt: 'biology' },
  { src: '/img/geology.png', alt: 'earth-science' },
  { src: '/img/coding.png', alt: 'etc' },
];

function Main() {
  const [toggled, setToggled] = useState(Array(items.length).fill(false));
    const toggle = (i:Number) =>
    setToggled((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className={classes.Container1}>
      <div className={classes.flex1}>
        <Title>SSHS OCW</Title>
        <Text className={classes.Text1}>
          SSHS OCW는 서울과학고 학생들이 직접 제작·공유하는 100% 학생 주도형 온라인 강의 플랫폼입니다.<br></br>
          서울과학고 재학생·졸업생들은 국제올림피아드 다수 수상 경력과 깊이 있는 학습 경험을 바탕으로, 내신 대비부터 고난도 수학·물리 등 심화 학습까지 폭넓은 콘텐츠를 제공합니다.
        </Text>
        <Button>둘러보기</Button>
      </div>
      <div className={classes.Vertical_align}>
        <div className={classes.Container2}>
          <Flex direction="column" align="center">
            <Text size="xl" className={classes.Title2}>관심 있는 분야가 무엇인가요?</Text>
            <Grid gutter={'xs'}>
              {items.map((item, i) => (
                <Grid.Col key={i} span={4}>
                  <UnstyledButton
                    onClick={() => toggle(i)}
                    aria-pressed={toggled[i]}
                    className={`${classes.selectBox} ${classes.Vertical_align} ${toggled[i] ? classes.selected : ''}`}
                  >
                    <Image src={item.src} alt={item.alt} w="80%" />
                  </UnstyledButton>
                </Grid.Col>
              ))}
            </Grid>
            <br></br>
            <Button>시작하기</Button>
            <Text className={classes.Text2}>이미 계정이 있으신가요? <Link to="/" className={classes.Li}>로그인 하기</Link></Text>
          </Flex>
        </div>
      </div>
    </div>
  )
}

export default Main;