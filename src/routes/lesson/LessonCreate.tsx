import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { http } from "../../libs/http";
import { permissionCheckSchema, userSchema } from "../../libs/types";
import LessonEditor from "../../components/lesson/LessonEditor";
import { LESSON_TIPTAP_CREATE_STORAGE_KEY, LESSON_MARKDOWN_CREATE_STORAGE_KEY, LESSON_META_CREATE_STORAGE_KEY, PLACEHOLDER_LESSON, PLACEHOLDER_MARKDOWN, tryParseJSON } from "../../libs/utils";

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

    const parsedTiptap = tryParseJSON(localStorage.getItem(LESSON_TIPTAP_CREATE_STORAGE_KEY));
    const rawMarkdown = localStorage.getItem(LESSON_MARKDOWN_CREATE_STORAGE_KEY);
    const parsedMeta = tryParseJSON<{ title?: string; studentOnly?: boolean }>(localStorage.getItem(LESSON_META_CREATE_STORAGE_KEY));

    const tiptapCached = parsedTiptap ?? PLACEHOLDER_LESSON.content;
    const markdownCached = rawMarkdown ?? PLACEHOLDER_MARKDOWN;
    const metaCached = parsedMeta;
    const hasCached = parsedTiptap !== null || rawMarkdown !== null || parsedMeta !== null;

    return { tiptapCached, markdownCached, metaCached, subjectId, hasCached }
  } catch (err) {
    if (err instanceof Response) throw err;

    throw redirect("/home")
  }
}

export default function LessonCreate() {
  const { tiptapCached, markdownCached, metaCached, subjectId, hasCached } = useLoaderData<typeof clientLoader>();
  return <LessonEditor mode="create" initialContent={null}
  tiptapCached={tiptapCached} markdownCached={markdownCached} metaCached={metaCached} subjectId={subjectId}
  storageKey={LESSON_TIPTAP_CREATE_STORAGE_KEY} markdownStorageKey={LESSON_MARKDOWN_CREATE_STORAGE_KEY} metaStorageKey={LESSON_META_CREATE_STORAGE_KEY} hasCached={hasCached} />
}