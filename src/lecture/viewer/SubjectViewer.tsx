import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router";
import { Stack, Title, Button } from "@mantine/core";
import { http } from "../../libs/http";
import { subjectSchema, Subject } from "../../libs/types";
import { PLACEHOLDER_SUBJECT } from "../../libs/utils";

function handleModuleCreate(navigate: NavigateFunction, subjectId: string) {
  navigate(`/modules/create?subjectId=${subjectId}`)
}

function SubjectViewer() {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT);
  const { subjectId } = useParams()
  const navigate = useNavigate();

  useEffect(() => {
    if (!subjectId) navigate("/notfound");

    http.get(`${process.env.REACT_APP_API_URL}/api/subjects/${subjectId}`).then((res) => {
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
          <Button onClick={() => handleModuleCreate(navigate, subjectId)}>모듈 생성</Button>
        </Stack>
      :
        <></>
      }
    </>
  )
}

export default SubjectViewer;