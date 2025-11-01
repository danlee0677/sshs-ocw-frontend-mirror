import MainPageHeader from "../main/MainPageAppshell";
import { Box, Image, Group, Stack, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import classes from './main.module.css'

const array = [0, 1, 2, 3]

function Home() {

    const { ref, width } = useElementSize()
    const isNarrow = width < 150;

    return (
        <MainPageHeader>
            <Group className={`${classes.Vertical_align} ${classes.Main1}`} w={'100%'} h={'60vh'}>
                <Stack w={'50%'} h={'100%'}>
                    <Group w={'100%'} h={'50%'} className={`${classes.Box1}`}></Group>
                    <Group w={'100%'} h={'50%'} className={`${classes.Box1}`}></Group>
                    로그인 해 이용해 주세요!
                </Stack>
                <Group className={`${classes.Box1}`} w={'25%'} h={'100%'}>
                    <Stack w={'100%'} h={'100%'} className={`${classes.Vertical_align}`} gap={0}>
                        <Text className={`${classes.Title2}`}>최근 이용한 강좌</Text>
                        {array.map(() => (
                            <Box ref={ref} className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} h={'20%'} miw={0}>
                                <Group wrap='nowrap' w={'80%'} h={'100%'}>
                                    <Image fit='contain' w={'auto'} h={'80%'} src={"https://res.cloudinary.com/dpcig7o5t/image/upload/v1760317295/samples/cloudinary-icon.png"}></Image>
                                    {!isNarrow && (
                                        <Stack gap={0} miw={0}>
                                            <Text truncate fw={'bold'}>강의제목이 너무길어지면?</Text>
                                            <Text>성취율: </Text>
                                        </Stack>
                                    )}
                                </Group>
                            </Box>
                        ))}
                        <Text>더보기</Text>
                    </Stack>
                </Group>
            </Group>
        </MainPageHeader>
    )
}

export default Home