import axios from "axios";
import { useEffect, useState, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router";
import { z } from 'zod'
import MainPageAppshell from "../main/MainPageAppshell";
import type { User } from "../libs/types";
import { Button, Checkbox, Flex, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";

interface ResultType {
  subjectTitle: { _id: string, title: string }[],
  subjectDescription: { _id: string, description: string }[],
  lessonTitle: { _id: string, title: string, subject: string }[],
}

const PLACEHOLDER_RESULT: ResultType = {
  subjectTitle: [],
  subjectDescription: [],
  lessonTitle: []
}

function SearchResult({ user, setUser }: { user: User | null, setUser: React.Dispatch<SetStateAction<User | null>>}) {
  const [subjectTitle, setSubjectTitle] = useState<boolean>(true);
  const [subjectDescription, setSubjectDescription] = useState<boolean>(true);
  const [lessonTitle, setLessonTitle] = useState<boolean>(false);

  const [searchResult, setSearchResult] = useState<ResultType>(PLACEHOLDER_RESULT);

  const navigate = useNavigate();

  const location = useLocation();
  const state = z.object({
    keyword: z.string(),
  }).safeParse(location.state)

  useEffect(() => {
    if (state.success) {
      const keyword = state.data.keyword
      if (2 <= keyword.length && keyword.length <= 20) {
        axios.post(`${import.meta.env.VITE_API_URL}/api/search`, {
          subjectTitle: subjectTitle,
          subjectDescription: subjectDescription,
          lessonTitle: lessonTitle,
          keyword: keyword,
        }).then((res) => {
          console.log(res.data)
          setSearchResult(res.data)
        }).catch((err) => {
          console.log(err);
        })
      }
    }
  }, [state, subjectTitle, subjectDescription, lessonTitle])

  const texthighlight = (text: string, keyword: string) => {
    if (!keyword) return text;
    const index = text.indexOf(keyword)
    if (index === -1) return <Text>{text}</Text>

    const before = text.slice(0, index)
    const match = text.slice(index, index + keyword.length)
    const after = text.slice(index + keyword.length)

    return <>
      <Text span truncate="start">{before}</Text>
      <Text span fw={700}>{match}</Text>
      <Text span truncate="end">{after}</Text>
    </>
  } 

  return (
    <MainPageAppshell navigate={navigate} setUser={setUser} user={user}>
      <Flex>
        <Paper>
          <Checkbox label="과목 제목" checked={subjectTitle} 
          onChange={(e) => (setSubjectTitle(e.currentTarget.checked))} />
          <Checkbox label="과목 내용" checked={subjectDescription} 
          onChange={(e) => (setSubjectDescription(e.currentTarget.checked))}/>
          <Checkbox label="강의 제목" checked={lessonTitle} 
          onChange={(e) => (setLessonTitle(e.currentTarget.checked))}/>
        </Paper>
      </Flex>
      <Group gap="md">
        { subjectTitle && state.success ?
          <Flex>
            <Stack>
              <Title order={3}>과목 제목</Title>
              <Table>
                <Table.Thead>
                  <Table.Td w={300}>제목</Table.Td>
                  <Table.Td w={100}>링크</Table.Td>
                </Table.Thead>
                <Table.Tbody>
                  {searchResult.subjectTitle.map((val) => {
                    return <Table.Tr key={val._id}>
                      <Table.Td>{texthighlight(val.title, state.data.keyword)}</Table.Td>
                      <Table.Td>
                        <Button onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                      </Table.Td>
                    </Table.Tr>
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Flex>
        :
          <></>
        }
        { subjectDescription && state.success ?
          <Flex>
            <Stack>
              <Title order={3}>과목 설명</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Td w={200}>설명</Table.Td>
                    <Table.Td w={100}>링크</Table.Td>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {searchResult.subjectDescription.map((val) => {
                    return <Table.Tr key={val._id}>
                      <Table.Td>{texthighlight(val.description, state.data.keyword)}</Table.Td>
                      <Table.Td>
                        <Button onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                      </Table.Td>
                    </Table.Tr>
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Flex>
        :
          <></>
        }
        { lessonTitle && state.success ?
          <Flex>
            <Stack>
              <Title order={3}>강의 제목</Title>
              <Table>
                <Table.Thead>
                  <Table.Td w={200}>제목</Table.Td>
                  <Table.Td w={100}>링크</Table.Td>
                </Table.Thead>
                <Table.Tbody>
                  {searchResult.lessonTitle.map((val) => {
                    return <Table.Tr key={val._id}>
                      <Table.Td>{texthighlight(val.title, state.data.keyword)}</Table.Td>
                      <Table.Td>
                        <Button onClick={() => navigate(`/lesson/${val._id}?subjectId=${val.subject}`)}>바로가기</Button>
                      </Table.Td>
                    </Table.Tr>
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Flex>
        :
          <></>
        }
      </Group>
    </MainPageAppshell>
  )
}

export default SearchResult;