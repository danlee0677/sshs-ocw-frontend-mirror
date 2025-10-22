import { useEffect, useState } from "react";
import LectureAppshell from "./LectureAppshell";
import { ScrollArea, Stack, Space } from "@mantine/core";
import { z } from 'zod'
import { Lesson } from "../libs/types";
import { useParams } from "react-router";
import NavigateCard from "./card/NavigateCard";
import { http } from '../libs/http'
import LectureEditor from "../editor/LectureEditor";

const PLACEHOLDER_DOC = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Fetching your lesson..." }] }
  ]
}


function Lecture() {
  const { lessonId } = useParams()

  const [lesson, setLesson] = useState<Lesson | null>(null);

  // fetch lesson from routes
  useEffect(() => {
    http.get(`${process.env.REACT_APP_API_URL}/api/lessons/${lessonId}`).then((res) => {
      const parsed = z.object({
        title: z.string(),
        content: z.string(),
        createdBy: z.string()
      }).safeParse(res.data)

      if (!parsed.success) {
        throw new Error("Fetched lesson does not meet res type")
      }

      const contentJSON = JSON.parse(parsed.data.content)
      setLesson({
        title: parsed.data.title,
        content: contentJSON,
        createdBy: parsed.data.createdBy
      })
    }).catch((err) => {
      console.log(err)
      setLesson(null)
    })
  }, [lessonId])

  return (
    <LectureAppshell>
      <ScrollArea h="100%" type="auto" scrollbarSize={5}>
        <Stack w="100%" gap="md" align="center">
          <Space h="md"/>
          <NavigateCard dir={"/info"} ind={0} pageMin={0} pageMax={0} />
          <LectureEditor editable={false} content={lesson ? lesson.content : PLACEHOLDER_DOC} Shell={LectureAppshell}/>
        </Stack>
      </ScrollArea>

    </LectureAppshell>
  )
}

export default Lecture