import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Stack, Title, Button, SimpleGrid, UnstyledButton, Flex } from "@mantine/core";
import { http } from "../libs/http";
import { subjectSchema, type Subject } from "../libs/types";
import { PLACEHOLDER_SUBJECT } from "../libs/utils";
import './subjectViewer.module.css'

function SubjectViewer() {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT);
  const { subjectId } = useParams()
  const navigate = useNavigate();

  useEffect(() => {
    if (!subjectId) navigate("/notfound");

    http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`).then((res) => {
      const parsed = subjectSchema.safeParse(res.data)
      
      if (!parsed.success) throw new Error("Response type is not Subject");
      setSubject(parsed.data);
    }).catch((err) => {
      navigate('/notfound')
      console.log(err);
    })
  }, [subjectId, navigate])

  return (
    // todo: add appshell
    <>
      { subjectId ?
        <Stack w="100vw" h="100vh" align="center">
          <Title order={1}>{subject.title}</Title>
          <Button component={Link} to={`/subjects/${subjectId}/edit`}>과목 수정</Button>
          <SimpleGrid w="80%" h="30%" cols={3}>
            {subject.contents.map((lesson) => {
              return (
                <UnstyledButton h="100%" w="100%"
                style={{
                  backgroundColor: "#acacacff",
                  color: "inherit",
                  "&:hover": {
                    color: "inherit"
                  }
                }}
                component={Link} to={`/lessons/${lesson._id}?subjectId=${subject._id}`}>
                  <Flex h="100%" w="100%" justify="center">
                    <Title h={3}>{lesson.title}</Title>
                  </Flex>
                </UnstyledButton>
              )
            })}
          </SimpleGrid>
        </Stack>
      :
        <></>
      }
    </>
  )
}

export default SubjectViewer;