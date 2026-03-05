import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { http } from "../../libs/http";
import { permissionCheckSchema, userSchema } from "../../libs/types";
import LessonEditor from "../../components/lesson/LessonEditor";
import { LESSON_STORAGE_KEY, MARKDOWN_STORAGE_KEY, PLACEHOLDER_LESSON, PLACEHOLDER_MARKDOWN } from "../../libs/utils";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const parsed = userSchema.safeParse(res.data);

    if (!parsed.success) throw new Error("Cannot parse user from server");

    const url = new URL(request.url);
    const subjectId = url.searchParams.get('subjectId');

    if (!subjectId) throw new Error("Failed to identify subjectId");

    if (!parsed.data.roles.includes("admin")) {
      const permRes = await http.get(`${import.meta.env.VITE_API_URL}/api/permission/check/${subjectId}`);
      const permParsed = permissionCheckSchema.safeParse(permRes.data);
      if (!permParsed.success || !permParsed.data.canEdit)
        throw new Response("No permission to create lesson", { status: 403 });
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

    return { tiptapCached, markdownCached, subjectId }
  } catch (err) {
    if (err instanceof Response) throw err;

    throw redirect("/home")
  }
}

export default function LessonCreate() {
  const { tiptapCached, markdownCached, subjectId } = useLoaderData<typeof clientLoader>();
  return <LessonEditor mode="create" initialContent={null} 
  tiptapCached={tiptapCached} markdownCached={markdownCached} subjectId={subjectId} />
}