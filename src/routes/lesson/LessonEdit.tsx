import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import LessonEditor from "../../components/lesson/LessonEditor"
import { http } from "../../libs/http";
import { isAxiosError } from "axios";
import { lessonSchema, userSchema } from "../../libs/types";
// import your Zod schemas here!

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const userParse = userSchema.safeParse(res.data);
    if (!userParse.success) throw new Error("Failed to parse user from server");

    if (!userParse.data.roles.includes('admin')) throw new Response(null, { status: 403, statusText: "No permission to edit this lesson." })

    const lessonRes = await http.get(`${import.meta.env.VITE_API_URL}/api/lessons/${params.lessonId}`);
    
    const parsed = lessonSchema.safeParse(lessonRes.data);
    if (!parsed.success) throw new Error("Failed to parse lesson from server");

    return { initialContent: {
      title: parsed.data.title,
      subject: parsed.data.subject,
      _id: parsed.data._id,
      content: JSON.parse(parsed.data.content),
      student_only: parsed.data.student_only,
      createdBy: parsed.data.createdBy,
    }};
  } catch (err) {
    if (err instanceof Response) throw err;
    
    throw err;
  }
}

export default function EditLessonRoute() {
  const { initialContent } = useLoaderData<typeof clientLoader>();

  // Render the shared component in "edit" mode, passing the fetched data
  return <LessonEditor mode="edit" initialContent={initialContent} />
}