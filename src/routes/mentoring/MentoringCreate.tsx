import { redirect, useLoaderData } from "react-router";
import { http } from "../../libs/http";
import { userSchema } from "../../libs/types";
import {
  MENTORING_TIPTAP_CREATE_STORAGE_KEY,
  MENTORING_MARKDOWN_CREATE_STORAGE_KEY,
  MENTORING_META_CREATE_STORAGE_KEY,
  PLACEHOLDER_LESSON,
  PLACEHOLDER_MARKDOWN,
  tryParseJSON,
} from "../../libs/utils";
import type { MentoringFile } from "../../libs/types";

type MentoringMetaCache = {
  title?: string;
  description?: string;
  image_url?: string;
  registration?: string;
  tags?: string[];
  createdBy?: string[];
  files?: MentoringFile[];
};
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
    const parsedMeta = tryParseJSON<MentoringMetaCache>(localStorage.getItem(MENTORING_META_CREATE_STORAGE_KEY));

    return {
      tiptapCached: parsedTiptap ?? PLACEHOLDER_LESSON.content,
      markdownCached: rawMarkdown ?? PLACEHOLDER_MARKDOWN,
      metaCached: parsedMeta,
      hasCached: parsedTiptap !== null || rawMarkdown !== null || parsedMeta !== null,
    };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw redirect("/home");
  }
}

export default function MentoringCreate() {
  const { tiptapCached, markdownCached, metaCached, hasCached } = useLoaderData<typeof clientLoader>();
  return (
    <MentoringEditor
      mode="create"
      initialContent={null}
      tiptapCached={tiptapCached}
      markdownCached={markdownCached}
      metaCached={metaCached}
      storageKey={MENTORING_TIPTAP_CREATE_STORAGE_KEY}
      markdownStorageKey={MENTORING_MARKDOWN_CREATE_STORAGE_KEY}
      metaStorageKey={MENTORING_META_CREATE_STORAGE_KEY}
      hasCached={hasCached}
    />
  );
}
