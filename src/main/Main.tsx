import React from "react";
import '@mantine/core/styles.css'
import classes from './main.module.css'
import { Button, Table, Text, Title } from "@mantine/core";
import MainPageHeader from "./MainPageAppshell";
import { Link, useNavigate } from 'react-router';

function Main() {
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
          <form className={classes.flex1}>
            <input className={classes.LoginInput} placeholder="아이디"></input>
            <input className={classes.LoginInput} placeholder="비밀번호"></input>
            <Button>로그인</Button>
            <p>회원이 아니신가요? <Link to="/">회원가입 하기</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Main;