import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LessonEditorAppshell from "./LessonEditorAppshell";
import LessonBody from "./LessonBody";
import { Lesson, lessonSchema } from "../../libs/types";
import LessonSubmitCard from "../card/LessonSubmitCard";
import { http } from "../../libs/http";
import LessonHeadingCard from "../card/LessonHeadingCard";

function LessonEditor({mode} : {mode: "edit" | "create"}) {
  const [initialContent, setInitialContent] = useState<null | Lesson>(null)
  const [title, setTitle] = useState("");

  const { lessonId } = useParams();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "edit") return;
    
    if (!lessonId) navigate('/notfound');

    http.get(`${process.env.REACT_APP_API_URL}/api/lessons/${lessonId}`).then((res) => {
      const parsed = lessonSchema.safeParse(res.data);
      if (!parsed.success) throw new Error("Malformed lesson data on fetch");
      if (!lessonId) throw new Error("no lessonId provided");

      const JSONcontent = JSON.parse(parsed.data.content)

      setInitialContent({
        title: parsed.data.title,
        content: JSONcontent,
        createdBy: parsed.data.createdBy,
        _id: parsed.data._id,
        module: parsed.data.module,
      })
    }).catch((err) => {
      console.log(err)
      setInitialContent(null);
    })
  }, [mode, lessonId, navigate])

  return (
    <>
      <LessonBody content={initialContent} editable={true} Shell={LessonEditorAppshell}
      before={<LessonHeadingCard editable={true} title={title} setTitle={setTitle} content={initialContent} />} 
      after={<LessonSubmitCard mode={mode} lessonId={lessonId} title={title} />} />
    </>
    
  )
}

export default LessonEditor