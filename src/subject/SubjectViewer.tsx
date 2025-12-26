import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Group, Stack, Title, Button, SimpleGrid, UnstyledButton, Flex, Text, Image, ThemeIcon } from "@mantine/core";
import { IconPencilPlus } from "@tabler/icons-react";
import { http } from "../libs/http";
import { subjectSchema, type Subject, type User } from "../libs/types";
import { PLACEHOLDER_SUBJECT } from "../libs/utils";
import './subjectViewer.module.css'
import MainPageAppshell from "../main/MainPageAppshell";
import classes from "./subjectViewer.module.css"

function SubjectViewer({ user, setUser }: { user: User | null, setUser: React.Dispatch<User | null> }) {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT);
  const { subjectId } = useParams()
  const navigate = useNavigate();

  useEffect(() => {
    if (!subjectId) navigate("/notfound");

    http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`).then((res) => {
      console.log(res.data)
      const parsed = subjectSchema.safeParse(res.data)

      if (!parsed.success) throw new Error("Response type is not Subject");
      setSubject(parsed.data);
    }).catch((err) => {
      navigate('/notfound')
      console.log(err);
    })
  }, [subjectId, navigate])

  return (
    <MainPageAppshell user={user} setUser={setUser}>
      {subjectId ?
        <Flex w={'100%'} justify={'center'} gap={'md'}>
          <Stack w={'30%'} align={'center'} gap={'xs'}>
            <Image mt={'lg'} w={'160px'} h={'160px'}></Image>
            <Title order={1} className={classes.JalnanGothic}>{subject.title}</Title>
            <Text className={classes.Paperozi}>{subject.description}</Text>
            {(user && user.roles.includes('admin')) ? 
              <UnstyledButton component={Link} to={`/subject/${subjectId}/edit`}  >
                <ThemeIcon><IconPencilPlus></IconPencilPlus></ThemeIcon>
              </UnstyledButton>
            : 
            <></>}
          </Stack>
          <Stack w={'50%'} h={'100%'} gap={0} align={'center'}>
            <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>
            {subject.contents.map((lesson, i) => {
              return (
                <UnstyledButton h="100%" w="100%"
                  style={{
                    backgroundColor: i % 2 === 0 ? "#e0e0e0ff" : "#ffffffff",
                    color: "inherit",
                    "&:hover": {
                      color: "inherit"
                    }
                  }}
                  component={Link} to={`/lesson/${lesson._id}?subjectId=${subject._id}`}>
                  <Flex className={classes.List} h="100%" w="100%" justify="center" align={'center'}>
                    <Text mt={'lg'} mb={'lg'} className={`${classes.JalnanGothic}`}>{lesson.title}</Text>
                  </Flex>
                </UnstyledButton>
              )
            })}
          </Stack>
        </Flex>
        :
        <></>
      }
    </MainPageAppshell>
  )
}

export default SubjectViewer;