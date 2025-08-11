import React from "react"
import { Button, Center, Flex, Stack, Text, UnstyledButton } from '@mantine/core'
import classes from './login.module.css'
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react'


function Login() {
    return (
        <Flex h='100vh' w='100vw' justify={"center"} align={"center"}>
            <Stack w='30vw' justify={"center"} align={"center"}>
                <UnstyledButton className={classes.LoginButton}>구글 계정으로 로그인</UnstyledButton>
                <UnstyledButton className={classes.LoginButton}>카카오 계정으로 로그인</UnstyledButton>
                <UnstyledButton className={classes.LoginButton}>네이버 계정으로 로그인</UnstyledButton>
            </Stack>
        </Flex>
    
    )
}

export default Login;