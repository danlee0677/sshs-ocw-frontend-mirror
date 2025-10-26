import { useEffect, useState } from "react";
import LessonViewerAppshell from "./LessonViewerAppshell";
import { Lesson, lessonSchema } from "../../libs/types";
import { useParams } from "react-router";
import LessonViewerNavigateCard from "../card/LessonViewerNavigateCard";
import { http } from '../../libs/http'
import LessonBody from "../editor/LessonBody";

const PLACEHOLDER_DOC = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Fetching your lesson..." }] }
  ]
}


function LessonViewer() {
  const { lessonId } = useParams()

  const [lesson, setLesson] = useState<Lesson | null>(null);

  // fetch lesson from routes
  useEffect(() => {
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
      })
    }).catch((err) => {
      console.log(err)
      setLesson(null)
    })
  }, [lessonId])

  return (
    <LessonBody editable={false} content={lesson ? lesson.content : PLACEHOLDER_DOC} Shell={LessonViewerAppshell}
    before={<LessonViewerNavigateCard dir={"/info"} ind={0} pageMin={0} pageMax={0} />} after={<></>} />
  )
}

export default LessonViewer