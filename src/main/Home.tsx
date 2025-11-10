import MainPageAppshell from "../main/MainPageAppshell";
import { Box, Image, Group, Paper, Stack, Text, Title} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import classes from './main.module.css'
import { ProgressCard } from '../main/Progress'
import { isUser } from "../libs/utils";
import { User } from "../libs/types";

const array = [0, 1, 2, 3]

function Home({ user, setUser }: { user: User | null, setUser: React.Dispatch<User | null> }) {
    const { ref, width } = useElementSize()
    const isNarrow = width < 150;

    return (
        <MainPageAppshell setUser={setUser}>
            <Group className={`${classes.Vertical_align} ${classes.Main1}`} w={'100%'} h={'60vh'}>
                <Stack w={'50%'} h={'100%'}>
                    <Paper w={'100%'} h={'50%'} className={`${classes.Box1}`}>
                        {isUser(user) ? 
                            <>
                                <Title>{user?.name}님! 환영합니다.</Title>
                            </> :
                            <>
                                <Title>로그인 후 이용할 수 있는 기능입니다.</Title>
                            </>
                        }
                    </Paper>
                    <Group w={'100%'} h={'50%'} className={`${classes.Box1}`}>
                        {isUser(user) ?
                            <>
                                <ProgressCard type={1}></ProgressCard>
                                <ProgressCard type={2}></ProgressCard>
                            </> : 
                            <>
                                <Text>로그인하셈</Text>
                            </>
                        }
                    </Group>
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
        </MainPageAppshell>
    )
}

export default Home