import { redirect, type ActionFunctionArgs } from "react-router";
import z from "zod";
import { http } from "../../libs/http";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";

export function clientLoader() {
  throw redirect("/");
}

export async function clientAction({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    const schema = z.object({
      userId: z.string().min(1, "사용자 ID를 입력해주세요."),
      intent: z.enum(["grant", "revoke"]),
    });

    const parsed = schema.safeParse({
      userId: formData.get("userId")?.toString(),
      intent: formData.get("intent")?.toString(),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { userId, intent } = parsed.data;

    if (intent === "grant") {
      await http.patch(
        `${import.meta.env.VITE_API_URL}/api/user/${userId}/roles`,
        { grant: ["creator"] }
      );
      notifications.show({
        title: "Creator 권한이 부여되었습니다.",
        message: `${userId} 사용자에게 creator 역할이 추가되었습니다.`,
        withCloseButton: true,
        position: "bottom-center",
        autoClose: 4000,
      });
      return { ok: true };

    } else {
      await http.patch(
        `${import.meta.env.VITE_API_URL}/api/user/${userId}/roles`,
        { revoke: ["creator"] }
      );
      notifications.show({
        title: "Creator 권한이 제거되었습니다.",
        message: `${userId} 사용자의 creator 역할이 제거되었습니다.`,
        withCloseButton: true,
        position: "bottom-center",
        autoClose: 4000,
      });
      return { ok: true };
    }

  } catch (err) {
    if (err instanceof Response) throw err;
    if (err instanceof AxiosError) {
      if (err.status === 403) return { error: "권한이 없습니다." };
      if (err.status === 404) return { error: "사용자를 찾을 수 없습니다." };
    }
    return { error: "오류가 발생했습니다." };
  }
}
