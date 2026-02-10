import { Image, Pagination, Space, Table, Title } from "@mantine/core";
import { type User } from "../libs/types";
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

  const navigate = useNavigate()

  const likedSubjectPageCnt = 5;

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

  }, [pageUserId, navigate])

  return (
    <>
      <MainPageAppshell user={user} setUser={setUser} navigate={navigate}>
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
            {likedSubjects.map((sub) => {
              return <Table.Tr key={sub._id}>
                <Table.Td><Link to={`/subject/${sub._id}`}>{sub.title}</Link></Table.Td>
                <Table.Td>{sub.description}</Table.Td>
              </Table.Tr>
            })}
          </Table.Tbody>
        </Table>
        <Pagination total={Math.ceil(likedSubjects.length / likedSubjectPageCnt)} 
        value={likedSubjectPage} onChange={setLikedSubjectPage} />

      </MainPageAppshell>
    </>
  )
}

export default Profile