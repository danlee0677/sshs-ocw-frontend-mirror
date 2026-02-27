import { Box, Group, Image, Pagination, ScrollArea, Space, Stack, Table, Text, Title } from "@mantine/core";
import { recentViewSchema, type User } from "../../libs/types";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { http } from "../../libs/http";
import classes from "./Profile.module.css"
import { useState } from "react";
import { PLACEHOLDER_USER } from "../../libs/utils";
import z from "zod";

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
    <Box h="100%" w="100%" px="md">
      <MainPageAppshell>
        <ScrollArea h="100%" w="100%">
          <Image w={'200px'} src={pageUser.pfp_url} />
          <Title className={classes.JalnanGothic}>{pageUser.username}</Title>

          <Space h="10px" />

          <Title order={3}>좋아요 한 과목</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Td>제목</Table.Td>
                <Table.Td>설명</Table.Td>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {likedSubjects.slice((likedSubjectPage - 1) * likedSubjectPageCnt, likedSubjectPage * likedSubjectPageCnt).map((sub) => {
                return <Table.Tr key={sub._id}>
                  <Table.Td><Link to={`/subject/${sub._id}`}>{sub.title}</Link></Table.Td>
                  <Table.Td>{sub.description}</Table.Td>
                </Table.Tr>
              })}
            </Table.Tbody>
          </Table>
          <Pagination total={Math.max(1, Math.ceil(likedSubjects.length / likedSubjectPageCnt))}
            value={likedSubjectPage} onChange={setLikedSubjectPage} />

          <Stack w={'50%'} h={'70%'} className={`${classes.Vertical_align}`} gap={0}>
            <Text className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Text>
            {viewed.slice((viewedPage - 1) * viewedPageCnt, viewedPage * viewedPageCnt).map((v) => (
              <Box key={v.lesson._id} className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} h={'20%'} miw={0}>
                <Group wrap='nowrap' w={'80%'} h={'100%'}>
                  <Link to={`/subject/${v.subject._id}`} className="block"
                    style={{
                      display: 'flex',       // Makes the <a> tag a flex container
                      alignItems: 'center',  // Centers the image vertically
                      height: '100%',        // Forces <a> to fill the Group's height
                    }}>
                    <Image fit='contain' w={'auto'} h={'40'} src={v.subject.image_url} className={classes.Image1} />
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
            <Space h="sm" />
            <Pagination value={viewedPage} onChange={setViewedPage}
              total={Math.max(1, Math.ceil(viewed.length / viewedPageCnt))} />
            <Space h="md" />
          </Stack>
        </ScrollArea>
      </MainPageAppshell>
    </Box>
  )
}