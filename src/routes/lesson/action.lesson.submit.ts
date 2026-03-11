import { redirect, type ActionFunctionArgs } from "react-router";
import z from "zod";
import { http } from "../../libs/http";
import { LESSON_CREATE_STORAGE_KEY, MARKDOWN_CREATE_STORAGE_KEY, lessonEditStorageKey, markdownEditStorageKey } from "../../libs/utils";
import { isAxiosError } from "axios";
import { notifications } from "@mantine/notifications";

const lessonFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  tiptapContent: z.string().min(20, "내용이 너무 짧습니다."),
  // The HTML Checkbox hack: if it equals "on", true. Otherwise, false.
  studentOnly: z.literal("on").optional().transform((val) => val === "on"),
  subjectId: z.string(),
  userId: z.string(),
  lessonId: z.string().optional(), // Only there for edits
});

export async function clientAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const parsed = lessonFormSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: parsed.error.message };

  const { title, tiptapContent, subjectId, userId, lessonId, studentOnly } = parsed.data;

  if (!tiptapContent || tiptapContent === `{"type":"doc","content":[]}`) {
    return { error: "강의 내용을 입력해 주세요! 혹시 마크다운 작성만 하였다면 '마크다운 컴파일' 버튼을 눌렀는지 확인해 주세요!" };
  }

  try {
    if (request.method === "POST") {
      await http.post(`${import.meta.env.VITE_API_URL}/api/lessons`, {
        subject: subjectId,
        title: title,
        content: tiptapContent,
        createdBy: userId,
        student_only: studentOnly,
      })
    } else if (request.method === "PATCH") {
      if (!lessonId) throw new Error("lessonId missing for edit!");

      await http.patch(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`, {
        title: title,
        content: tiptapContent,
        student_only: studentOnly,
      })
    }

    if (request.method === "POST") {
      localStorage.removeItem(LESSON_CREATE_STORAGE_KEY);
      localStorage.removeItem(MARKDOWN_CREATE_STORAGE_KEY);
    } else if (request.method === "PATCH" && lessonId) {
      localStorage.removeItem(lessonEditStorageKey(lessonId));
      localStorage.removeItem(markdownEditStorageKey(lessonId));
    }

    notifications.show({
      title: `강의 ${request.method === "POST" ? "생성" : "수정"}이 완료되었습니다!`,
      message: request.method === "POST" ? "강의가 성공적으로 서버에 생성되었습니다." : "성공적으로 강의 수정을 서버에 반영했습니다.",
      withCloseButton: true,
      position: "bottom-center",
      autoClose: 5000
    })

    throw redirect(`/subject/${subjectId}`)
  } catch (err) {
    if (err instanceof Response) throw err;

    if (isAxiosError(err)) {
      return { error: err.response?.data?.message || "강의 업로드 중 오류가 발생했습니다." };
    }

    throw err;
  }
}

export function clientLoader() {
  throw redirect('/')
}