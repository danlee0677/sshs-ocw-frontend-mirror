import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { http } from "../../libs/http";
import { mentoringResponseSchema, permissionCheckSchema, tiptapDocSchema, userSchema, type Mentoring } from "../../libs/types";
import {
  mentoringTiptapEditStorageKey,
  mentoringMarkdownEditStorageKey,
  PLACEHOLDER_LESSON,
  PLACEHOLDER_MARKDOWN,
  tryParseJSON,
} from "../../libs/utils";
import MentoringEditor from "../../components/mentoring/MentoringEditor";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const authRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const userParse = userSchema.safeParse(authRes.data);
    if (!userParse.success) throw redirect("/home");

    const mentoringId = params.mentoringId;
    if (!mentoringId) throw new Response("No mentoringId in url.", { status: 400 });

    const [mentoringRes, permRes] = await Promise.all([
      http.get(`${import.meta.env.VITE_API_URL}/api/mentoring/${mentoringId}`),
      http
        .get(`${import.meta.env.VITE_API_URL}/api/permission/check/${mentoringId}`)
        .catch(() => ({ data: { canEdit: false, role: null } })),
    ]);

    const raw = mentoringResponseSchema.safeParse(mentoringRes.data);
    if (!raw.success) throw new Response("Failed to parse mentoring.", { status: 500 });

    const permission = permissionCheckSchema.parse(permRes.data);
    if (!permission.canEdit) throw new Response("No permission to edit.", { status: 403 });

    const content =
      tiptapDocSchema.safeParse(tryParseJSON(raw.data.content))?.data ?? PLACEHOLDER_LESSON.content;

    const initialContent: Mentoring = { ...raw.data, content };

    const storageKey = mentoringTiptapEditStorageKey(mentoringId);
    const markdownStorageKey = mentoringMarkdownEditStorageKey(mentoringId);
    const parsedTiptap = tryParseJSON(localStorage.getItem(storageKey));
    const rawMarkdown = localStorage.getItem(markdownStorageKey);

    return {
      initialContent,
      tiptapCached: parsedTiptap ?? PLACEHOLDER_LESSON.content,
      markdownCached: rawMarkdown ?? PLACEHOLDER_MARKDOWN,
      hasCached: parsedTiptap !== null || rawMarkdown !== null,
      storageKey,
      markdownStorageKey,
    };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw redirect("/home");
  }
}

export default function MentoringEdit() {
  const { initialContent, tiptapCached, markdownCached, storageKey, markdownStorageKey, hasCached } =
    useLoaderData<typeof clientLoader>();
  return (
    <MentoringEditor
      mode="edit"
      initialContent={initialContent}
      tiptapCached={tiptapCached}
      markdownCached={markdownCached}
      storageKey={storageKey}
      markdownStorageKey={markdownStorageKey}
      hasCached={hasCached}
    />
  );
}
