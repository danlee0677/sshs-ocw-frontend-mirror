import { type Lesson, lessonSchema, recentViewSchema, subjectSchema, userSchema } from "../../libs/types";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { http } from '../../libs/http'
import LessonViewerBody from "../../components/lesson/LessonViewerBody";
import z from "zod";


export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const parsed = z.object({ lessonId: z.string() }).safeParse(params)

    if (!parsed.success) throw new Response("존재하지 않는 강의입니다!", { status: 404 });

    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/lessons/${parsed.data.lessonId}`)
    const lessonParse = lessonSchema.safeParse(res.data);

    if (!lessonParse.success) throw new Response("Failed to parse lesson from server", { status: 400 })
    const content = JSON.parse(lessonParse.data.content);

    const lesson: Lesson = {
      _id: lessonParse.data._id,
      title: lessonParse.data.title,
      content: content,
      subject: lessonParse.data.subject,
      createdBy: lessonParse.data.createdBy.username,
      student_only: lessonParse.data.student_only,
    }

    const subRes = await http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${lesson.subject}`)
    const subjectParsed = subjectSchema.safeParse(subRes.data);

    if (!subjectParsed.success) throw new Response("존재하지 않는 과목의 강의입니다!", { status: 404 });

    try {
      const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
      const userParse = userSchema.safeParse(userRes.data);
      if (!userParse.success) throw new Error("no user");

      const progressRes = await http.get(`${import.meta.env.VITE_API_URL}/api/progress/${userParse.data._id}?subjectId=${lesson.subject}`)
      const progressParsed = z.array(recentViewSchema).safeParse(progressRes.data);

      if (!progressParsed.success) throw new Response("Failed to parse progress from server", { status: 400 })
      return { lesson, subject: subjectParsed.data, progress: progressParsed.data };
    } catch (err) {
      if (err instanceof Response) throw err;

      return { lesson, subject: subjectParsed.data, progress: [] }
    }
  } catch (err) {
    if (err instanceof Response) throw err;
    throw err;
  }
}

export default function LessonViewer() {
  const { lesson, subject, progress } = useLoaderData<typeof clientLoader>();

  return (
    <LessonViewerBody lesson={lesson} subject={subject} progress={progress} />
  )
}