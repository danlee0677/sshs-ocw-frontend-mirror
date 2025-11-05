import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router";
import { Button, Stack, TextInput, Flex, Title } from "@mantine/core";
import { http } from "../../libs/http";
import { Subject, subjectSchema } from "../../libs/types";
import { PLACEHOLDER_SUBJECT } from "../../libs/utils";
import z from "zod";


function handleSubjectSubmit(mode: "edit" | "create", navigate: NavigateFunction, subject: Subject) {
  if (mode === "edit") {
    
  } else if (mode === "create") {
    http.post(`${process.env.REACT_APP_API_URL}/api/subjects`, {
      title: subject.title,
    }).then((res) => {
      const parsed = z.object({_id: z.string()}).safeParse(res.data);
      if (!parsed.success) throw new Error("Failed to fetch subject id");
      // todo: add popup(alert, Modals, etc)
      navigate(`/subjects/${parsed.data._id}`);
    }).catch((err) => {
      console.log(err);
    })
  }
}

function SubjectEditor({ mode }: { mode: "edit" | "create" }) {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT)
  const { subjectId } = useParams()
  const navigate = useNavigate();
  
  useEffect(() => {
    if (mode !== "edit") return;

    if (!subjectId) {
      console.log("No moduleId passed, ill-formed url");
      navigate("/");
    }

    http.get(`${process.env.REACT_APP_API_URL}/api/subjects/${subjectId}`).then((res) => {
      const parsed = subjectSchema.safeParse(res.data)
      if (!parsed.success) throw new Error("Response fails to match type 'Subject'");

      if (parsed.data._id !== subjectId) throw new Error("Id does not match")

      setSubject(parsed.data);
    }).catch((err) => {
      console.log(err);
    })
  }, [mode, subjectId, navigate])
  
  return (
    <>{
      mode === "edit" ? // edit
        <>
        </>
      : // create
        <Flex w="100%" h="100%" justify="center">
          <Stack gap="md" w="50%">
            <Title order={3}>과목 이름 입력</Title>
            <TextInput placeholder="과목 이름을 입력하세요(예: 일반물리학)"
            value={subject.title ?? ""}
            onChange={(e) => {
                const v = e.currentTarget?.value ?? ""; 
                setSubject((sub) => ({ ...sub, title: v }))}} />
            <Button onClick={() => handleSubjectSubmit(mode, navigate, subject)}>과목 생성</Button>
          </Stack>
        </Flex>
    }</>
  )
}

export default SubjectEditor;