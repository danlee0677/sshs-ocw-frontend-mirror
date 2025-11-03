import { useEffect, useState } from "react";
import { Title, Stack, Flex } from "@mantine/core";
import LessonViewerAppshell from "./LessonViewerAppshell";
import { Lesson, lessonSchema, Module, moduleSchema } from "../../libs/types";
import { useNavigate, useParams, useSearchParams } from "react-router";
import LessonViewerNavigateCard from "../card/LessonViewerNavigateCard";
import { http } from '../../libs/http'
import LessonBody from "../editor/LessonBody";
import { PLACEHOLDER_LESSON, PLACEHOLDER_MODULE } from "../../libs/utils";


function LessonViewer() {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const moduleId = searchParams.get('moduleId');

  const [lesson, setLesson] = useState<Lesson>(PLACEHOLDER_LESSON);
  const [module, setModule] = useState<Module>(PLACEHOLDER_MODULE);

  const navigate = useNavigate();

  // fetch lesson from routes
  useEffect(() => {
    if (!lessonId) {
      navigate('/notfound');
      return;
    }
    
    http.get(`${process.env.REACT_APP_API_URL}/api/lessons/${lessonId}`).then((res) => {
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
        module: parsed.data.module
      })
      // if (lesson._id !== lessonId || lesson.module !== moduleId) throw new Error("lesson Id mismatch");
    }).catch((err) => {
      console.log(err)
      navigate('/notfound');
    })

    http.get(`${process.env.REACT_APP_API_URL}/api/modules/${moduleId}`).then((res) => {
      const parsed = moduleSchema.safeParse(res.data)

      if (!parsed.success) throw new Error("Fetched module does not meet Module type");
      setModule(parsed.data);
      // if (module._id !== moduleId || module.subject !== subjectId) throw new Error("moduleId or subjectId mismatch");
    }).catch((err) => {
      console.log(err);
      navigate('/notfound');
    })
  }, [lessonId, moduleId, navigate])
  // todo: give the appshell `module` fetched with useEffect
  return (
    <>
      { lesson._id ? 
        <LessonBody editable={false} content={lesson.content} Shell={LessonViewerAppshell}
        before={
        <Stack gap="md" w="100%">
          <LessonViewerNavigateCard module={module} lesson={lesson} />
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