import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import LessonEditor from "../../components/lesson/LessonEditor"
import { http } from "../../libs/http";
import { lessonSchema, permissionCheckSchema, tiptapDocSchema, userSchema } from "../../libs/types";
import { lessonTiptapEditStorageKey, lessonMarkdownEditStorageKey, PLACEHOLDER_LESSON, PLACEHOLDER_MARKDOWN, tryParseJSON } from "../../libs/utils";
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

    const storageKey = lessonTiptapEditStorageKey(parsed.data._id);
    const markdownStorageKey = lessonMarkdownEditStorageKey(parsed.data._id);

    const parsedTiptap = tryParseJSON(localStorage.getItem(storageKey));
    const rawMarkdown = localStorage.getItem(markdownStorageKey);

    const tiptapCached = parsedTiptap ?? PLACEHOLDER_LESSON.content;
    const markdownCached = rawMarkdown ?? PLACEHOLDER_MARKDOWN;
    const hasCached = parsedTiptap !== null || rawMarkdown !== null;

    const content = tiptapDocSchema.safeParse(tryParseJSON(parsed.data.content))?.data
                 ?? PLACEHOLDER_LESSON.content;

    return {
      initialContent: {
        title: parsed.data.title,
        subject: parsed.data.subject,
        _id: parsed.data._id,
        content,
        student_only: parsed.data.student_only,
        createdBy: parsed.data.createdBy.username,
      }, tiptapCached, markdownCached, subjectId: parsed.data.subject, storageKey, markdownStorageKey, hasCached
    };
  } catch (err) {
    if (err instanceof Response) throw err;
    // if AxiosError or any other - throw!
    throw err;
  }
}

export default function EditLessonRoute() {
  const { initialContent, markdownCached, tiptapCached, subjectId, storageKey, markdownStorageKey, hasCached } = useLoaderData<typeof clientLoader>();

  // Render the shared component in "edit" mode, passing the fetched data
  return <LessonEditor mode="edit" initialContent={initialContent}
  markdownCached={markdownCached} tiptapCached={tiptapCached} subjectId={subjectId}
  storageKey={storageKey} markdownStorageKey={markdownStorageKey} hasCached={hasCached} />
}