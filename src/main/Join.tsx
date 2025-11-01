import classes from './join.module.css'
import { ActionIcon, Button, Flex, Stack, Title, UnstyledButton } from "@mantine/core";
import { IconArrowBack } from '@tabler/icons-react'

const course = [
    { sub: '중등 과정' },
    { sub: '고등 과정' },
    { sub: '대학 과정' },
    { sub: '그 외' }
]


function Join(courseToggled: any, setCourseToggled: Function, courseToggle: Function, step: number, setStep: Function) {
    return (
        <>
            <Flex w={'100vw'} h={'100vh'} align={'center'} justify={'center'}>

                <ActionIcon onClick={() => { setStep(step - 1) }} size={42} variant={'default'} className={classes.IconContainer}>
                    <IconArrowBack size={30}></IconArrowBack>
                </ActionIcon>


                <Stack w={'40%'}>
                    {step === 1 && (
                        <>
                            <Title className={classes.Title}>원하는 교육 과정을 선택해 주세요</Title>
                            {course.map((item, i) => (
                                <UnstyledButton
                                    className={`${classes.longSelectBox} ${courseToggled[i] ? classes.selected : ''}`}
                                    onClick={() => courseToggle(i)}>{item.sub}
                                </UnstyledButton>
                            ))}
                        </>
                    )}


                    <Button w={'20%'} onClick={() => {
                        if (courseToggled.every((v: Boolean) => !v)) {
                            alert("한 개 이상 선택해 주세요!")
                        }
                        else {
                            setStep(step + 1)
                        }
                    }}>다음</Button>
                </Stack>
            </Flex>
        </>
    )
}

export default Join