  import { useEffect, useState } from "react";
import { Title, Stack, Flex } from "@mantine/core";
import LessonViewerAppshell from "./LessonViewerAppshell";
import { type Lesson, lessonSchema, type Subject, subjectSchema } from "../libs/types";
import { useNavigate, useParams, useSearchParams } from "react-router";
import LessonViewerNavigateCard from "../card/LessonViewerNavigateCard";
import { http } from '../libs/http'
import LessonBody from "./LessonBody";
import { PLACEHOLDER_LESSON, PLACEHOLDER_SUBJECT } from "../libs/utils";

function LessonViewer() {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subjectId');

  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT);
  const [lesson, setLesson] = useState<Lesson>(PLACEHOLDER_LESSON);

  const navigate = useNavigate();

  // fetch lesson from routes
  useEffect(() => {
    if (!lessonId) {
      navigate('/notfound');
      return;
    }
    
    http.get(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`).then((res) => {
      const parsed = lessonSchema.safeParse(res.data)

      if (!parsed.success) {
        throw new Error("Fetched lesson does not meet res type")
      }

      const contentJSON = JSON.parse(parsed.data.content)
      setLesson({
        title: parsed.data.title,
        content: contentJSON,
        createdBy: parsed.data.createdBy,
        _id: parsed.data._id,
        subject: parsed.data.subject
      })
      // if (lesson._id !== lessonId || lesson.module !== moduleId) throw new Error("lesson Id mismatch");
    }).catch((err) => {
      console.log(err)
      navigate('/notfound');
    })
    http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`).then((res) => {
      const parsed = subjectSchema.safeParse(res.data);
      if (!parsed.success) throw new Error("Fetched Subject does not meet type");

      setSubject({
        _id: parsed.data._id,
        title: parsed.data.title,
        description: parsed.data.description,
        contents: parsed.data.contents,
      })
    }).catch((err) => {
      console.log(err);
      navigate("/notfound");
    })
  }, [lessonId, subjectId, navigate])
  // todo: give the appshell `module` fetched with useEffect
  return (
    <>
      { lesson._id ? 
        <LessonBody editable={false} content={lesson.content} Shell={LessonViewerAppshell}
        before={
        <Stack gap="md" w="100%">
          <LessonViewerNavigateCard subject={subject} lesson={lesson} />
          <Title order={1}>{lesson.title}</Title>
          <Flex w="100%" justify="flex-end">
            <Title order={4}>{lesson.createdBy}</Title>
          </Flex> 
        </Stack>
        } after={<></>} />  
      : 
        <></>
      }
    </>
  )
}

export default LessonViewer