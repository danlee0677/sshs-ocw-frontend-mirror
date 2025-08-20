import React from "react";
import classes from './join.module.css'
import { ActionIcon, Button, Flex, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconArrowBack } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react'

const course = [
    { sub: '중등 과정' },
    { sub: '고등 과정' },
    { sub: '대학 과정' },
    { sub: '그 외' }
]

const types = [
    { sub: '영상 위주' },
    { sub: '글 위주' },
    { sub: '퀴즈 위주' },
    { sub: '혼합' },
    { sub: '그 외' },
]

function Join(courseToggled: any, setCourseToggled: Function, courseToggle: Function, typeToggled: any, setTypeToggled: Function, typeToggle: Function, step: number, setStep: Function) {
    return (
        <>
            <Flex w={'100vw'} h={'100vh'} align={'center'} justify={'center'}>

            <ActionIcon onClick={() => { setStep(step - 1) }} size={42} variant={'default'} className={classes.IconContainer}>
                <IconArrowBack size={30}></IconArrowBack>
            </ActionIcon>


                <Stack w={'40%'}>
                    {step === 1 ? (
                        <>
                            <Title className={classes.Title}>원하는 교육 과정을 선택해 주세요</Title>
                            {course.map((item, i) => (
                                <UnstyledButton
                                    className={`${classes.longSelectBox} ${courseToggled[i] ? classes.selected : ''}`}
                                    onClick={() => courseToggle(i)}>{item.sub}
                                </UnstyledButton>
                            ))}
                        </>
                    ) : (
                        <>
                            <Title className={classes.Title}>선호하는 교육 방식은 무엇인가요?</Title>
                            {types.map((item, i) => (
                                <UnstyledButton
                                    className={`${classes.longSelectBox} ${typeToggled[i] ? classes.selected : ''}`}
                                    onClick={() => typeToggle(i)}>{item.sub}
                                </UnstyledButton>
                            ))}
                        </>
                    )}

                    
                    <Button w={'20%'} onClick={() => { setStep(step + 1) }}>다음</Button>
                </Stack>
            </Flex>
        </>
    )
}

export default Join