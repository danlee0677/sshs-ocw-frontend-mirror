import MainPageAppshell from "../main/MainPageAppshell";
import { Box, Flex, Image, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import classes from './main.module.css'
import { ProgressCard } from '../main/Progress'
import { CustomBadge } from "./CustomBadge";
import { isUser } from "../libs/utils";
import { recentViewSchema, type RecentView, type User } from "../libs/types";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { http } from "../libs/http";
import z from "zod";

const PLACEHOLDER_RECENT_VIEW: RecentView = {
  subject: {
    _id: "",
    title: "",
    image_url: "https://res.cloudinary.com/dpcig7o5t/image/upload/v1760317295/samples/cloudinary-icon.png",
    description: "",
  },
  lesson: {
    _id: "",
    title: "",
  },
  viewedAt: new Date(),
  userId: "",
}

function Home({ user, setUser }: { user: User | null, setUser: React.Dispatch<User | null> }) {
  const { ref, width } = useElementSize()
  const isNarrow = width < 150;
  const navigate = useNavigate();

  const [recentViewed, setRecentViewed] = useState<RecentView[]>([]);

  useEffect(() => {
    http.get(`${import.meta.env.VITE_API_URL}/api/progress?count=4`).then((res) => {
      const parsed = z.array(recentViewSchema).safeParse(res.data);
      if (!parsed.success) throw new Error("recentView does not match type");
      setRecentViewed(parsed.data);
    }).catch((err) => {
      console.error(err);
    })
  }, [recentViewed])

  const padArray = (array: Array<RecentView>, minLength: number): Array<RecentView> => {
    const safeArray = array ?? []
    if (safeArray.length === 0) return [PLACEHOLDER_RECENT_VIEW]

    const copy: Array<RecentView> = [
      ...(safeArray.sort(
        (a: RecentView, b: RecentView) =>
          (new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())))
    ].slice(0, minLength);

    if (copy.length < minLength) {
      const originalLength = copy.length
      copy.length = minLength;
      copy.fill(PLACEHOLDER_RECENT_VIEW, originalLength);
    }

    return copy;
  }

  const minLength = 4;

  return (
    <MainPageAppshell user={user} setUser={setUser} navigate={navigate}>
      <Box p="md" w="100%" h="100%">
      {isUser(user) ?
        <Group className={`${classes.Vertical_align} ${classes.Main1}`} w={'100%'} h={'65vh'}>
          <Stack w={'50%'} h={'100%'}>
            <Paper w={'100%'} h={'50%'} className={`${classes.Box1}`} bg={'#cbd6eaff'} component={Link} to={`/profile/${user._id}`} c={'black'}>
              <Flex w={'100%'} h={'100%'}
                justify={"flex-start"}
                align={'center'}>
                <Flex>
                  <Box className={classes.SpeechBubble} ta={'center'} bdrs={'50px'}>
                    <Flex w={'100%'} h={'100%'} align={'center'} justify={'center'}>
                      나의 생각
                    </Flex>
                  </Box>
                  <Image w={'150px'} src={user.pfp_url} className={`${classes.Main_pfp_image}`} bdrs={'80px'} mr={'60px'}></Image>
                  <Flex direction="column" justify={'center'}>
                    <Title className={`${classes.Inline} ${classes.JalnanGothic}`} mb={'lg'}>{user?.username}님</Title>
                    <Flex className={classes.Inline}>
                      <CustomBadge type={1}></CustomBadge>
                      <CustomBadge type={2}></CustomBadge>
                      <CustomBadge type={3}></CustomBadge>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Paper>
            <Group w={'100%'} h={'50%'} className={`${classes.Box1}`}>
              <>
                <ProgressCard type={1}></ProgressCard>
                <ProgressCard type={2}></ProgressCard>
              </>
            </Group>
          </Stack>
          <Group className={`${classes.Box1}`} w={'25%'} h={'100%'}>
            <Stack w={'100%'} h={'100%'} className={`${classes.Vertical_align}`} gap={0}>
              <Text className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Text>
              {padArray(recentViewed, minLength).map((v, i) => (
                v.subject._id ?
                  <Box ref={ref} className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} h={'20%'} miw={0}>
                    <Group wrap='nowrap' w={'80%'} h={'100%'}>
                      <Link to={`/subject/${v.subject._id}`} className="block"
                        style={{
                          display: 'flex',       // Makes the <a> tag a flex container
                          alignItems: 'center',  // Centers the image vertically
                          height: '100%',        // Forces <a> to fill the Group's height
                        }}>
                        <Image fit='contain' w={'auto'} h={'80%'} src={v.subject.image_url} className={classes.Image1}/>
                      </Link>
                      {!isNarrow && (
                        <Stack gap={0} miw={0}>
                          <Link to={`/subject/${v.subject._id}`}>
                            <Text style={{ color: "black" }} truncate fw={'bold'}>{v.subject.title}</Text>
                          </Link>
                          <Link to={`/lesson/${v.lesson._id}?subjectId=${v.subject._id}`}>
                            <Text style={{ color: "black" }} truncate>{v.lesson.title}</Text>
                          </Link>
                        </Stack>
                      )}
                    </Group>
                  </Box>
                  : (i == 0 ?
                    <Box ref={ref} w="100%" h="80%" className={`${classes.Vertical_align}`}>
                      <Text>다양한 강의를 수강해보세요!</Text>
                    </Box>
                    :
                    <Box ref={ref} w="100%" h="20%" miw={0} />
                  )
              ))}
              <Link to={`/profile/${user._id}`}>
                <Text style={{ color: "black" }}>더보기</Text>
              </Link>
            </Stack>
          </Group>
        </Group>
        : <Title className={classes.JalnanGothic}>로그인 후 이용할 수 있는 곳입니다.</Title>}
      </Box>
    </MainPageAppshell>
  )
}

export default Home;