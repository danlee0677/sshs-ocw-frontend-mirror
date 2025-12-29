import { useEffect, useState } from "react";
import { type NavigateFunction, useNavigate, useParams } from "react-router";
import { Button, Stack, TextInput, Flex, Title, Image } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { http } from "../libs/http";
import { type OrderData, type Subject, subjectSchema, type User } from "../libs/types";
import { PLACEHOLDER_SUBJECT } from "../libs/utils";
import OrderTable from "../card/OrderTable";
import classes from "./subjectViewer.module.css"
import z from "zod";
import MainPageAppshell from "../main/MainPageAppshell";

function handleSubjectEdit(navigate: NavigateFunction, subject: Subject, state: OrderData) {
  http.patch(`${import.meta.env.VITE_API_URL}/api/subjects/${subject._id}`, {
    title: subject.title,
    description: subject.description,
    likes: subject.likes,
    contents: state,
  }).then(() => {
    // todo: popup
    navigate(`/subject/${subject._id}`)
  }).catch((err) => {
    console.log(err);
  })
}

function handleSubjectCreate(navigate: NavigateFunction, subject: Subject) {
  http.post(`${import.meta.env.VITE_API_URL}/api/subjects`, {
    title: subject.title,
    image_url: subject.image_url,
    description: subject.description,
    likes: 0,
  }).then((res) => {
    const parsed = z.object({ _id: z.string() }).safeParse(res.data);
    if (!parsed.success) throw new Error("Failed to fetch subject id");
    // todo: add popup(alert, Modals, etc)
    navigate(`/subject/${parsed.data._id}`);
  }).catch((err) => {
    console.log(err);
  })
}

function SubjectEditor({ mode, user, setUser }: { mode: "edit" | "create", user: User | null, setUser: React.Dispatch<User | null> }) {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT)
  const { subjectId } = useParams()
  const navigate = useNavigate();
  const [state, handlers] = useListState(subject.contents);

  useEffect(() => {
    if (mode !== "edit") {
      setSubject((sub) => ({ ...sub, image_url: "https://res.cloudinary.com/dpcig7o5t/image/upload/v1767019358/base_study_o0o20v.png" }))
      return;
    }

    if (!subjectId) {
      console.log("No moduleId passed, ill-formed url");
      navigate("/");
    }

    http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`).then((res) => {
      const parsed = subjectSchema.safeParse(res.data)
      if (!parsed.success) throw new Error("Response fails to match type 'Subject'");

      if (parsed.data._id !== subjectId) throw new Error("Id does not match")

      setSubject(parsed.data);
      handlers.setState(parsed.data.contents);
    }).catch((err) => {
      console.log(err);
    })
  }, [mode, subjectId, navigate])

  return (
    <MainPageAppshell user={user} setUser={setUser}>{
      mode === "edit" ? // edit
        <Flex w={'100%'} justify={'center'} gap={'md'}>
          <Stack w="30%" gap="xs" align="center">
            <Image w={'160px'} src={subject.image_url}></Image>
            <TextInput value={subject.title} placeholder="변경할 과목 제목을 입력하세요(예: 2025 고급프로그래밍 강좌)"
              onChange={(e) => {
                const val = e.currentTarget.value
                setSubject((sub) => {
                  return { ...sub, title: val }
                })
              }} />
          </Stack>
          <Stack w={'50%'} h={'100%'} gap={0} align="center">
            <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>

            <OrderTable state={state} handlers={handlers} navigate={navigate} subjectId={subject._id} />

            <Stack>
              <Button onClick={() => navigate(`/lesson/create?subjectId=${subjectId}`)} >새 강의 생성</Button>
              <Button onClick={() => handleSubjectEdit(navigate, subject, state)}>과목 수정</Button>
            </Stack>
          </Stack>
        </Flex>
        : // create
        <Flex w="100%" h="100%" justify="center">
          <Stack gap="md" w="50%">
            <Title order={3}>과목 이름 입력</Title>
            <TextInput placeholder="과목 이름을 입력하세요(예: 일반물리학)"
              value={subject.title ?? ""}
              onChange={(e) => {
                const v = e.currentTarget?.value ?? "";
                setSubject((sub) => ({ ...sub, title: v }))
              }} />
            <TextInput placeholder="간단한 과목 설명을 입력하세요"
              value={subject.description ?? ""}
              onChange={(e) => {
                const v = e.currentTarget?.value ?? "";
                setSubject((sub) => ({ ...sub, description: v }))
              }} />

            <Button onClick={() => handleSubjectCreate(navigate, subject)}>과목 생성</Button>
          </Stack>
        </Flex>
    }</MainPageAppshell>
  )
}

export default SubjectEditor;