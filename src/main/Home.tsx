import MainPageAppshell from "../main/MainPageAppshell";
import { Box, Flex, Image, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import classes from './main.module.css'
import { ProgressCard } from '../main/Progress'
import { CustomBadge } from "./CustomBadge";
import { isUser } from "../libs/utils";
import { type User } from "../libs/types";
import { useNavigate } from "react-router";

const array = [0, 1, 2, 3]

function Home({ user, setUser }: { user: User | null, setUser: React.Dispatch<User | null> }) {
    const { ref, width } = useElementSize()
    const isNarrow = width < 150;
    const navigate = useNavigate();

    return (
        <MainPageAppshell user={user} setUser={setUser} navigate={navigate}>
            <Group className={`${classes.Vertical_align} ${classes.Main1}`} w={'100%'} h={'65vh'}>
                <Stack w={'50%'} h={'100%'}>
                    <Paper w={'100%'} h={'50%'} className={`${classes.Box1}`} bg={'#cbd6eaff'}>
                        {isUser(user) ?
                            <Flex w={'100%'} h={'100%'}
                                justify={"flex-start"}
                                align={'center'}>
                                <Flex>
                                    <Box className={classes.SpeechBubble} ta={'center'} bdrs={'50px'}>
                                        <Flex w={'100%'} h={'100%'} align={'center'} justify={'center'}>
                                            이게 조금 길어진다면? ㅋㅋ
                                        </Flex>
                                    </Box>
                                    <Image w={'150px'} src={user?.pfp_url} className={`${classes.Main_pfp_image}`} bdrs={'80px'} mr={'60px'}></Image>
                                    <Flex direction="column" justify={'center'}>
                                        <Title className={`${classes.Inline} ${classes.JalnanGothic}`} mb={'lg'}>{user?.username}님</Title>
                                        <Flex className={classes.Inline}>
                                            <CustomBadge type={1}></CustomBadge>
                                            <CustomBadge type={2}></CustomBadge>
                                            <CustomBadge type={3}></CustomBadge>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex> :
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
                        <Text className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Text>
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

export default Home;