import { Box, Button, Flex, Group, Image, Pagination, ScrollArea, Space, Stack, Table, Text, Title, Tooltip } from "@mantine/core";
import { recentViewSchema, type User } from "../../libs/types";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { http } from "../../libs/http";
import classes from "./Profile.module.css"
import { useState } from "react";
import { PLACEHOLDER_USER } from "../../libs/utils";
import z from "zod";
import { linkStyle } from "../../libs/styles";

const SubjectResponseSchema = z.array(z.object({
  title: z.string(),
  _id: z.string(),
  description: z.string(),
  image_url: z.string(),
}))

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const pageUserId = params.pageUserId;
    if (!pageUserId) throw new Response("Cannot find user id to display", { status: 404 });

    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/user/${pageUserId}`);
    const userParsed = z.object({
      username: z.string(),
      pfp_url: z.string(),
    }).safeParse(userRes.data);

    if (!userParsed.success) throw new Error("Failed to parse user from server");

    const retUser: User = {
      ...PLACEHOLDER_USER,
      _id: pageUserId,
      pfp_url: userParsed.data.pfp_url,
      username: userParsed.data.username,
    }

    const likedRes = await http.get(`${import.meta.env.VITE_API_URL}/api/subjects/liked/${pageUserId}`)
    const likedParsed = SubjectResponseSchema.safeParse(likedRes.data);
    if (!likedParsed.success) throw new Error("Failed to parse liked subjects from server");

    const progressRes = await http.get(`${import.meta.env.VITE_API_URL}/api/progress/${pageUserId}`)
    const progressParsed = z.array(recentViewSchema).safeParse(progressRes.data);
    if (!progressParsed.success) throw new Error("Failed to parse progress from server");

    return { pageUser: retUser, viewed: progressParsed.data, likedSubjects: likedParsed.data };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw err;
  }
}

export default function Profile() {
  const { pageUser, viewed, likedSubjects } = useLoaderData<typeof clientLoader>();

  const [likedSubjectPage, setLikedSubjectPage] = useState(1);
  const [viewedPage, setViewedPage] = useState<number>(1);

  const likedSubjectPageCnt = 5; // show this amount of subjects for a page(liked subjects)
  const viewedPageCnt = 5;

  return (

    <MainPageAppshell>
      <ScrollArea h="100%" w="100%">
        <Box h="100%" w="100%" px="md">
          <Flex w={'100%'} align={'center'} justify={'center'}>
            { /* 82dvh = total - header */}

            <Stack w="80%">
              <Space h={'10px'}></Space>
              <Group className={classes.ProfileBox} align={'flex-start'} p={'20px'} w={'40%'}>
                <Image w={'150px'} src={pageUser.pfp_url} />
                <Stack h={'100%'} justify={'flex-start'} gap={0} p={'10px'}>
                  <Title m={0} className={classes.JalnanGothic}>{pageUser.username}</Title>
                  <Text h={'60px'}>안녕</Text>
                  <Tooltip label='아직 미완성인 기능입니다.'>
                    <Button disabled>편집</Button>
                  </Tooltip>
                </Stack>
              </Group>
              <Space h="10px" />

              <Group w="100%" gap="md" justify="center" align="align-left">
                <Stack className={classes.GroupBox} w="45%">
                  <Title order={3}>좋아요 한 과목</Title>
                  {likedSubjects.length === 0 ? <>
                    <Text>마음에 드는 강의에 좋아요를 눌러보세요!</Text>
                  </> : <>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>제목</Table.Th>
                          <Table.Th>설명</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {likedSubjects.slice((likedSubjectPage - 1) * likedSubjectPageCnt, likedSubjectPage * likedSubjectPageCnt).map((sub) => {
                          return <Table.Tr key={sub._id} h="50px">
                            <Table.Td><Link to={`/subject/${sub._id}`} style={linkStyle}>{sub.title}</Link></Table.Td>
                            <Table.Td>{sub.description}</Table.Td>
                          </Table.Tr>
                        })}
                      </Table.Tbody>
                    </Table>
                    <Group w="100%" justify="center">
                      <Pagination total={Math.max(1, Math.ceil(likedSubjects.length / likedSubjectPageCnt))}
                        value={likedSubjectPage} onChange={setLikedSubjectPage} />
                    </Group>
                  </>}
                </Stack>

                <Stack className={classes.GroupBox} w="45%" h="90dvh">
                  <Text className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Text>
                  {viewed.length === 0 ? <>
                    <Text>이용한 강의가 없습니다.</Text></> : <>
                    <Stack w={'100%'} h={'70%'} className={`${classes.Vertical_align}`} gap={0}>
                      {viewed.slice((viewedPage - 1) * viewedPageCnt, viewedPage * viewedPageCnt).map((v) => (
                        <Box key={v.lesson._id} className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} h={'20%'} miw={0}>
                          <Group wrap='nowrap' w={'80%'} h={'100%'}>
                            <Link to={`/subject/${v.subject._id}`} className="block"
                              style={{
                                display: 'flex',       // Makes the <a> tag a flex container
                                alignItems: 'center',  // Centers the image vertically
                                height: '100%',        // Forces <a> to fill the Group's height
                              }}>
                              <Image fit='contain' w={'auto'} h={"80%"} src={v.subject.image_url} className={classes.Image1} />
                            </Link>
                            <Stack gap={0} miw={0}>
                              <Link to={`/subject/${v.subject._id}`}>
                                <Text style={{ color: "black" }} truncate fw={'bold'}>{v.subject.title}</Text>
                                <Text style={{ color: "black" }} truncate>{v.subject.description}</Text>
                              </Link>
                              <Link to={`/lesson/${v.lesson._id}`}>
                                <Text style={{ color: "black" }} truncate>{v.lesson.title}</Text>
                              </Link>
                            </Stack>
                          </Group>
                        </Box>
                      ))}
                      <Space h="md" />
                      <Group w="100%" justify="center">
                        <Pagination value={viewedPage} onChange={setViewedPage}
                          total={Math.max(1, Math.ceil(viewed.length / viewedPageCnt))} />
                      </Group>
                    </Stack></>}
                </Stack>
              </Group>
            </Stack>

          </Flex>
        </Box>
      </ScrollArea>
    </MainPageAppshell>
  )
}