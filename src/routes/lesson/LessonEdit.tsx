import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import LessonEditor from "../../components/lesson/LessonEditor"
import { http } from "../../libs/http";
import { lessonSchema, permissionCheckSchema, userSchema } from "../../libs/types";
import { LESSON_STORAGE_KEY, MARKDOWN_STORAGE_KEY, PLACEHOLDER_LESSON, PLACEHOLDER_MARKDOWN } from "../../libs/utils";
// import your Zod schemas here!

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const userParse = userSchema.safeParse(res.data);
    if (!userParse.success) throw new Error("Failed to parse user from server");

    const lessonId = params.lessonId
    if (!lessonId) throw new Response("No lessonId in url.", { status: 400 });

    const lessonRes = await http.get(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`);

    const parsed = lessonSchema.safeParse(lessonRes.data);
    if (!parsed.success) throw new Error("Failed to parse lesson from server");

    if (!userParse.data.roles.includes('admin')) {
      const permRes = await http.get(`${import.meta.env.VITE_API_URL}/api/permission/check/${parsed.data.subject}`);
      const permParsed = permissionCheckSchema.safeParse(permRes.data);
      if (!permParsed.success || !permParsed.data.canEdit)
        throw new Response("No permission to edit this lesson.", { status: 403 });
    }

    let tiptapCached: object = {};
    let markdownCached: string = "";
    try {
      const raw = localStorage.getItem(LESSON_STORAGE_KEY)
      tiptapCached = raw ? JSON.parse(raw) : PLACEHOLDER_LESSON.content
    } catch {
      tiptapCached = PLACEHOLDER_LESSON.content
    }
    try {
      const raw = localStorage.getItem(MARKDOWN_STORAGE_KEY)
      markdownCached = raw ? JSON.parse(raw) : PLACEHOLDER_MARKDOWN
    } catch {
      markdownCached = PLACEHOLDER_MARKDOWN
    }

    return {
      initialContent: {
        title: parsed.data.title,
        subject: parsed.data.subject,
        _id: parsed.data._id,
        content: JSON.parse(parsed.data.content),
        student_only: parsed.data.student_only,
        createdBy: parsed.data.createdBy.username,
      }, tiptapCached, markdownCached, subjectId: parsed.data.subject
    };
  } catch (err) {
    if (err instanceof Response) throw err;
    // if AxiosError or any other - throw!
    throw err;
  }
}

export default function EditLessonRoute() {
  const { initialContent, markdownCached, tiptapCached, subjectId } = useLoaderData<typeof clientLoader>();

  // Render the shared component in "edit" mode, passing the fetched data
  return <LessonEditor mode="edit" initialContent={initialContent} 
  markdownCached={markdownCached} tiptapCached={tiptapCached} subjectId={subjectId} />
}