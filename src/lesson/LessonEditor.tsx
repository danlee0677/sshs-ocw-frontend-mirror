import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, type NavigateFunction } from "react-router";
import LessonBody from "./LessonBody";
import { type Lesson, lessonSchema, type User } from "../libs/types";
import LessonSubmitCard from "../card/LessonSubmitCard";
import { http } from "../libs/http";
import LessonHeadingCard from "../card/LessonHeadingCard";
import MainPageAppshell from "../main/MainPageAppshell";



function LessonEditor({ mode, user, setUser } : { mode: "edit" | "create", user: User | null, setUser: React.Dispatch<User | null> }) {
  const [initialContent, setInitialContent] = useState<null | Lesson>(null)
  const [title, setTitle] = useState("");
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subjectId');

  const { lessonId } = useParams();
  
  const navigate = useNavigate();
  useEffect(() => {
    http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`).catch(() => {
      navigate('/notfound');
    })
  })

  useEffect(() => {
    if (mode !== "edit") return;
    
    if (!lessonId || !subjectId) navigate('/notfound');

    http.get(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`).then((res) => {
      const parsed = lessonSchema.safeParse(res.data);
      if (!parsed.success) throw new Error("Malformed lesson data on fetch");
      if (!lessonId) throw new Error("no lessonId provided");

      const JSONcontent = JSON.parse(parsed.data.content)

      setInitialContent({
        title: parsed.data.title,
        content: JSONcontent,
        createdBy: parsed.data.createdBy,
        _id: parsed.data._id,
        subject: parsed.data.subject,
      })
    }).catch((err) => {
      console.log(err)
      setInitialContent(null);
    })
  }, [mode, lessonId, navigate, subjectId])

  if ((mode === "edit" && !lessonId) || !subjectId || !user) return;

  return (
    <>
      <LessonBody content={initialContent} editable={true} Shell={(props) => (
        <MainPageAppshell {...props} user={user} setUser={setUser}></MainPageAppshell>
      )}
      before={<LessonHeadingCard editable={true} title={title} setTitle={setTitle} content={initialContent} />} 
      after={<LessonSubmitCard mode={mode} lessonId={lessonId} title={title} subjectId={subjectId} navigate={navigate} user={user} />} />
    </>
    
  )
}

export default LessonEditor