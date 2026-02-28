import { redirect, type LoaderFunctionArgs } from "react-router";
import z from "zod";
import { http } from "../../libs/http";
import { PLACEHOLDER_SUBJECT } from "../../libs/utils";

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
      const idParsed = z.object({ _id: z.string() }).safeParse(res.data);
      if (!idParsed.success) throw new Error("Failed to fetch new subject _id");

      return redirect(`/subject/${idParsed.data._id}`);
    } else if (request.method === "PATCH") {
      if (!parsed.data.subjectId) return { error: "수정할 과목의 ID를 찾을 수 없습니다: 삭제되었을 가능성이 있나요?" };

      await http.patch(`${import.meta.env.VITE_API_URL}/api/subjects/${parsed.data.subjectId}`, {
        title: parsed.data.title,
        image_url: parsed.data.image_url,
        description: parsed.data.description,
        contents: parsed.data.contents,
        tags: parsed.data.tags,
      })

      return redirect(`/subject/${parsed.data.subjectId}`);
    }

    return {error: "잘못된 요청입니다."}
  } catch (err) {
    if (err instanceof Response) throw err;

    throw err;
  }
}

export function clientLoader() {
  throw redirect("/")
}