import { Box, Group, Image, Pagination, ScrollArea, Space, Stack, Table, Text, Title } from "@mantine/core";
import { type RecentView, recentViewSchema, type User } from "../libs/types";
import MainPageAppshell from "../main/MainPageAppshell";
import { Link, useNavigate, useParams } from "react-router";
import { http } from "../libs/http";
import classes from "./Profile.module.css"
import { useEffect, useState } from "react";
import { PLACEHOLDER_USER } from "../libs/utils";
import z from "zod";

const SubjectResponseSchema = z.array(z.object({
  title: z.string(),
  _id: z.string(),
  description: z.string(),
  image_url: z.string(),
}))

type SubjectResponse = z.infer<typeof SubjectResponseSchema>

function Profile({ user, setUser }: { user: User | null, setUser: React.Dispatch<User | null> }) {
  const { pageUserId } = useParams();

  const [PageUser, setPageUser] = useState<User>(PLACEHOLDER_USER)
  const [likedSubjects, setLikedSubjects] = useState<SubjectResponse>([])
  const [likedSubjectPage, setLikedSubjectPage] = useState(1);
  const [viewed, setViewed] = useState<RecentView[]>([])
  const [viewedPage, setViewedPage] = useState<number>(1);

  const navigate = useNavigate()

  const likedSubjectPageCnt = 5; // show this amount of subjects for a page(liked subjects)
  const viewedPageCnt = 5;

  useEffect(() => {
    if (!pageUserId) {
      navigate('/notfound')
    }
    else if (user?._id && pageUserId === user._id) {
      setPageUser(user);
    }
    else {
      http.get(`${import.meta.env.VITE_API_URL}/api/user/${pageUserId}`).then((res) => {
        setPageUser((val) => ({ ...val, _id: pageUserId, username: res.data.username, pfp_url: res.data.pfp_url }))
      })
    }

    http.get(`${import.meta.env.VITE_API_URL}/api/subjects/liked`).then((res) => {
      const parsed = SubjectResponseSchema.safeParse(res.data)
      if (!parsed.success) throw new Error("Liked Subjects api does not match required type")
      setLikedSubjects(parsed.data);
    }).catch((err) => {
      console.log(err);
    })
    http.get(`${import.meta.env.VITE_API_URL}/api/progress`).then((res) => {
      const parsed = z.array(recentViewSchema).safeParse(res.data);
      if (!parsed.success) throw new Error("Progress type does not match");
      setViewed(parsed.data);
    }).catch((err) => {
      console.error(err);
    })

  }, [pageUserId, navigate])

  return (
    <Box h="100%" w="100%" px="md">
      <MainPageAppshell user={user} setUser={setUser} navigate={navigate}>
        <ScrollArea h="100%" w="100%">
          {PageUser.pfp_url ? <Image w={'200px'} src={PageUser.pfp_url} /> : <></>}
          <Title className={classes.JalnanGothic}>{PageUser.username}</Title>

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
          <Pagination total={likedSubjects.length / likedSubjectPageCnt + (likedSubjects.length % likedSubjectPageCnt ? 1 : 0)}
            value={likedSubjectPage} onChange={setLikedSubjectPage} />

          <Stack w={'50%'} h={'70%'} className={`${classes.Vertical_align}`} gap={0}>
            <Text className={`${classes.JalnanGothic}`}>최근 이용한 강좌</Text>
            {viewed ? viewed.slice((viewedPage - 1) * viewedPageCnt, viewedPage * viewedPageCnt).map((v) => (
              <Box className={`${classes.Box2} ${classes.Vertical_align}`} w={'100%'} h={'20%'} miw={0}>
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
                    </Link>
                    <Link to={`/lesson/${v.lesson._id}?subjectId=${v.subject._id}`}>
                      <Text style={{ color: "black" }} truncate>{v.lesson.title}</Text>
                    </Link>
                  </Stack>
                </Group>
              </Box>
            )) : <Text>다양한 강좌를 수강해보세요!</Text>}
            <Space h="sm" />
            <Pagination value={viewedPage} onChange={setViewedPage}
              total={viewed.length / viewedPageCnt + (viewed.length % viewedPageCnt ? 1 : 0)} />
            <Space h="md" />
          </Stack>
        </ScrollArea>
      </MainPageAppshell>
    </Box>
  )
}

export default Profile