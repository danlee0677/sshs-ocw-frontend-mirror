import { redirect, type LoaderFunctionArgs } from "react-router";
import z from "zod";
import { http } from "../../libs/http";
import { PLACEHOLDER_SUBJECT } from "../../libs/utils";
import { notifications } from "@mantine/notifications";

const contentSchema = z.object({
  _id: z.string(),
  title: z.string(),
});

const formSchema = z.object({
  subjectId: z.string().optional(),
  title: z.string().min(1, "과목 이름을 입력해주세요."),
  description: z.string().min(1, "과목 설명을 입력해주세요."),
  image_url: z.string(),
  tags: z.array(z.string()),
  contents: z.array(contentSchema).optional(),
  teacher_certified: z.boolean(),
});

export async function clientAction({ request }: LoaderFunctionArgs) {
  try {
    const formData = await request.formData();

    const rawData = {
      subjectId: formData.get("subjectId")?.toString(),
      title: formData.get("title")?.toString(),
      description: formData.get("description")?.toString(),
      image_url: formData.get("imageUrl")?.toString() || "", // match hidden input "imageUrl"
      tags: formData.getAll("tags").map((t) => t.toString()),
      contents: formData.getAll("contents").map((c) => JSON.parse(c.toString())), // Parse the JSON strings back into objects!
      teacher_certified: formData.get("teacher_certified") === "on",
    };

    const parsed = formSchema.safeParse(rawData);
    if (!parsed.success) return { error: parsed.error.message };

    if (request.method === "POST") {
      const res = await http.post(`${import.meta.env.VITE_API_URL}/api/subjects`, {
        title: parsed.data.title,
        image_url: PLACEHOLDER_SUBJECT.image_url,
        description: parsed.data.description,
        likes: 0,
        tags: parsed.data.tags,
      })
      console.log(res)
      const idParsed = z.object({ _id: z.string() }).safeParse(res.data);
      if (!idParsed.success) throw new Error("Failed to fetch new subject _id");
      notifications.show({
        title: `과목 생성이 완료되었습니다!`,
        message: "과목이 성공적으로 서버에 생성되었습니다.",
        withCloseButton: true,
        position: "bottom-center",
        autoClose: 5000
      })
      return redirect(`/subject/${idParsed.data._id}`);
    } else if (request.method === "PATCH") {
      if (!parsed.data.subjectId) return { error: "수정할 과목의 ID를 찾을 수 없습니다: 삭제되었을 가능성이 있나요?" };

      await http.patch(`${import.meta.env.VITE_API_URL}/api/subjects/${parsed.data.subjectId}`, {
        title: parsed.data.title,
        image_url: parsed.data.image_url,
        description: parsed.data.description,
        contents: parsed.data.contents,
        tags: parsed.data.tags,
        teacher_certified: parsed.data.teacher_certified,
      })
      notifications.show({
        title: `과목 수정이 완료되었습니다!`,
        message: "과목 수정사항이 성공적으로 서버에 반영되었습니다.",
        withCloseButton: true,
        position: "bottom-center",
        autoClose: 5000
      })
      return redirect(`/subject/${parsed.data.subjectId}`);
    }

    return {error: "잘못된 요청입니다."}
  } catch (err) {
    console.log(err);
    if (err instanceof Response) throw err;

    throw err;
  }
}

export function clientLoader() {
  throw redirect("/")
}