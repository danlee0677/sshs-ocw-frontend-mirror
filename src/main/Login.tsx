import React from "react"
import { ActionIcon, Button, Center, Flex, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import classes from './login.module.css'
import { IconArrowBack } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react'
import axios from "axios";

function googleLogin() { // withcredentials: send http-only cookie with the request
  axios.get(`${process.env.BACKEND_URL}/api/auth/login/google`, { withCredentials: true }).then((res) => {
    res.data
  })
}

function Login() {
    return (
        <>
            <ActionIcon component={Link} to={'/'} size={42} variant={'default'} className={classes.IconContainer}>
                <IconArrowBack size={30}></IconArrowBack>
            </ActionIcon>
            <Flex h='100vh' w='100vw' justify={"center"} align={"center"}>
                <Stack w='30vw' justify={"center"} align={"center"}>
                    <Title className={classes.Title}>SSHS OCW</Title>
                    <UnstyledButton className={`${classes.LoginButton} ${classes.Google}`} onClick={googleLogin}>구글 계정으로 로그인</UnstyledButton>
                    <UnstyledButton className={`${classes.LoginButton} ${classes.Kakao}`}>카카오 계정으로 로그인</UnstyledButton>
                    <UnstyledButton className={`${classes.LoginButton} ${classes.Naver}`}>네이버 계정으로 로그인</UnstyledButton>
                </Stack>
            </Flex>
        </>
    )
}

export default Login;