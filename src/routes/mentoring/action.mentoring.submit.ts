import { redirect, type ActionFunctionArgs } from "react-router";
import z from "zod";
import { http } from "../../libs/http";
import { MENTORING_TIPTAP_CREATE_STORAGE_KEY, MENTORING_MARKDOWN_CREATE_STORAGE_KEY, mentoringTiptapEditStorageKey, mentoringMarkdownEditStorageKey } from "../../libs/utils";
import { isAxiosError } from "axios";
import { notifications } from "@mantine/notifications";

const mentoringFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  description: z.string().min(1, "설명을 입력해주세요."),
  image_url: z.string(),
  tags: z.preprocess(v => typeof v === 'string' ? JSON.parse(v) : v, z.array(z.string())),
  tiptapContent: z.string().min(20, "내용이 너무 짧습니다."),
  mentoringId: z.string().optional(), // only for edits
  createdBy: z.preprocess(v => typeof v === 'string' ? JSON.parse(v) : v, z.array(z.string())),
  files: z.preprocess(v => typeof v === 'string' ? JSON.parse(v) : v, z.array(z.object({ name: z.string(), url: z.string() }))),
  registration: z.string().min(1, "신청 링크를 입력해주세요."),
});

export async function clientAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const parsed = mentoringFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.message };

  const { title, description, image_url, tags, tiptapContent, mentoringId, createdBy, files, registration } = parsed.data;

  if (!tiptapContent || tiptapContent === `{"type":"doc","content":[]}`) {
    return { error: "강의 내용을 입력해 주세요! 혹시 마크다운 작성만 하였다면 '마크다운 컴파일' 버튼을 눌렀는지 확인해 주세요!" };
  }

  try {
    if (request.method === "POST") {
      await http.post(`${import.meta.env.VITE_API_URL}/api/mentoring`, {
        title,
        content: tiptapContent,
        createdBy,
        description,
        image_url,
        tags,
        files,
        registration,
      })
    } else if (request.method === "PATCH") {
      if (!mentoringId) throw new Error("lessonId missing for edit!");

      await http.patch(`${import.meta.env.VITE_API_URL}/api/mentoring/${mentoringId}`, {
        title,
        content: tiptapContent,
        createdBy,
        description,
        image_url,
        tags,
        files,
        registration,
      })
    }

    if (request.method === "POST") {
      localStorage.removeItem(MENTORING_TIPTAP_CREATE_STORAGE_KEY);
      localStorage.removeItem(MENTORING_MARKDOWN_CREATE_STORAGE_KEY);
    } else if (request.method === "PATCH" && mentoringId) {
      localStorage.removeItem(mentoringTiptapEditStorageKey(mentoringId));
      localStorage.removeItem(mentoringMarkdownEditStorageKey(mentoringId));
    }

    notifications.show({
      title: `오프라인 멘토링 ${request.method === "POST" ? "생성" : "수정"}이 완료되었습니다!`,
      message: request.method === "POST" ? "오프라인 멘토링이 성공적으로 서버에 생성되었습니다." : "성공적으로 오프라인 멘토링 수정을 서버에 반영했습니다.",
      withCloseButton: true,
      position: "bottom-center",
      autoClose: 5000
    })


    throw redirect(`/mentoring/board`)
  } catch (err) {
    if (err instanceof Response) throw err;

    if (isAxiosError(err)) {
      return { error: err.response?.data?.message || "멘토링 업로드 중 오류가 발생했습니다." };
    }

    throw err;
  }
}

export function clientLoader() {
  throw redirect('/')
}