import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { Box, Flex, Image, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import classes from './main.module.css'
import { ProgressCard } from './Progress'
import { CustomBadge } from "./CustomBadge";
import { recentViewSchema, userSchema, type RecentView } from "../../libs/types";
import { Link, redirect, useLoaderData } from "react-router";
import { http } from "../../libs/http";
import z from "zod";
import { useUserContext } from "../../root";
import { isAxiosError } from "axios";

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

export async function clientLoader() {
  try {
    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);

    const userParsed = userSchema.safeParse(userRes.data);
    if (!userParsed.success) throw new Error("Failed to verify user")

    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/progress/${userParsed.data._id}/recent-subjects`)
    const parsed = z.array(recentViewSchema).safeParse(res.data);

    if (!parsed.success) {
      throw new Error("failed to get intact progress from server")
    }
    return { recentViewed: parsed.data }
  } catch (err) {
    console.log(err)
    if (err instanceof Response) throw err;
    
    // if user is not logged in, throw
    if (isAxiosError(err) && err.response?.status === 401)
      throw redirect("/")

    throw err;
  }
  
}

function Home() {
  const { ref, width } = useElementSize()
  const isNarrow = width < 150;

  const { recentViewed } = useLoaderData<typeof clientLoader>();

  const { user } = useUserContext();

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
  const paddedProgress = padArray(recentViewed, minLength);

  if (!user) return null;

  return (
    <MainPageAppshell>
      <Box p="md" w="100%" h="100%">
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
                  <Image w="150px" h="150px" fit="cover" src={user.pfp_url} className={`${classes.Main_pfp_image}`} radius="80px" mr={'60px'}></Image>
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
            <Stack ref={ref} w={'100%'} h={'100%'} className={`${classes.Vertical_align}`} gap={0}>
              <Text className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Text>
              {paddedProgress.map((v, i) => (
                v.subject._id ?
                  <Box className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} h={'20%'} miw={0} key={v.lesson._id}>
                    <Group wrap='nowrap' w={'80%'} h={'100%'}>
                      <Link to={`/subject/${v.subject._id}`} className="block"
                        style={{
                          display: 'flex',       // Makes the <a> tag a flex container
                          alignItems: 'center',  // Centers the image vertically
                          height: '100%',        // Forces <a> to fill the Group's height
                        }}>
                        <Image fit="cover" w='75' h={'75'} src={v.subject.image_url} className={classes.Image1} />
                      </Link>
                      {!isNarrow && (
                        <Stack gap={0} miw={0}>
                          <Link to={`/subject/${v.subject._id}`}>
                            <Text style={{ color: "black" }} truncate fw={'bold'}>{v.subject.title}</Text>
                          </Link>
                          <Link to={`/lesson/${v.lesson._id}`}>
                            <Text style={{ color: "black" }} truncate>{v.lesson.title}</Text>
                          </Link>
                        </Stack>
                      )}
                    </Group>
                  </Box>
                  : (i == 0 ?
                    <Box ref={ref} w="100%" h="80%" className={`${classes.Vertical_align}`} key={i}>
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

      </Box>
    </MainPageAppshell>
  )
}

export default Home;