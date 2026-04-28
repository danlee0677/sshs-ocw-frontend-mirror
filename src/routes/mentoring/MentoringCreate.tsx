import { redirect, useLoaderData } from "react-router";
import { http } from "../../libs/http";
import { userSchema } from "../../libs/types";
import {
  MENTORING_TIPTAP_CREATE_STORAGE_KEY,
  MENTORING_MARKDOWN_CREATE_STORAGE_KEY,
  PLACEHOLDER_LESSON,
  PLACEHOLDER_MARKDOWN,
  tryParseJSON,
} from "../../libs/utils";
import MentoringEditor from "../../components/mentoring/MentoringEditor";

export async function clientLoader() {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const parsed = userSchema.safeParse(res.data);
    if (!parsed.success) throw new Error("Not authenticated");

    if (!parsed.data.roles.includes("admin") && !parsed.data.roles.includes("creator"))
      throw redirect("/home");

    const parsedTiptap = tryParseJSON(localStorage.getItem(MENTORING_TIPTAP_CREATE_STORAGE_KEY));
    const rawMarkdown = localStorage.getItem(MENTORING_MARKDOWN_CREATE_STORAGE_KEY);

    return {
      tiptapCached: parsedTiptap ?? PLACEHOLDER_LESSON.content,
      markdownCached: rawMarkdown ?? PLACEHOLDER_MARKDOWN,
      hasCached: parsedTiptap !== null || rawMarkdown !== null,
    };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw redirect("/home");
  }
}

export default function MentoringCreate() {
  const { tiptapCached, markdownCached, hasCached } = useLoaderData<typeof clientLoader>();
  return (
    <MentoringEditor
      mode="create"
      initialContent={null}
      tiptapCached={tiptapCached}
      markdownCached={markdownCached}
      storageKey={MENTORING_TIPTAP_CREATE_STORAGE_KEY}
      markdownStorageKey={MENTORING_MARKDOWN_CREATE_STORAGE_KEY}
      hasCached={hasCached}
    />
  );
}
