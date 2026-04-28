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

    if (request.method === "POST") {
      const postSchema = z.object({
        userId: z.string().min(1, "사용자 ID를 입력해주세요."),
        mentoringId: z.string().min(1),
      });

      const parsed = postSchema.safeParse({
        userId: formData.get("userId")?.toString(),
        mentoringId: formData.get("mentoringId")?.toString(),
      });
      if (!parsed.success) return { error: parsed.error.issues[0].message };

      await http.post(`${import.meta.env.VITE_API_URL}/api/permission`, {
        userId: parsed.data.userId,
        mentoringId: parsed.data.mentoringId,
        role: "editor",
      });

      notifications.show({
        title: "편집자가 추가되었습니다.",
        message: "해당 사용자에게 편집 권한이 부여되었습니다.",
        withCloseButton: true,
        position: "bottom-center",
        autoClose: 4000,
      });
      return { ok: true };

    } else if (request.method === "DELETE") {
      const deleteSchema = z.object({
        permissionId: z.string().min(1),
      });

      const parsed = deleteSchema.safeParse({
        permissionId: formData.get("permissionId")?.toString(),
      });
      if (!parsed.success) return { error: parsed.error.issues[0].message };

      await http.delete(
        `${import.meta.env.VITE_API_URL}/api/permission/${parsed.data.permissionId}`
      );

      notifications.show({
        title: "편집자가 제거되었습니다.",
        message: "해당 사용자의 편집 권한이 제거되었습니다.",
        withCloseButton: true,
        position: "bottom-center",
        autoClose: 4000,
      });
      return { ok: true };

    } else if (request.method === "PATCH") {
      const patchSchema = z.object({
        mentoringId: z.string().min(1),
        to: z.string().min(1, "사용자 ID를 입력해주세요."),
      });
      const parsed = patchSchema.safeParse({
        mentoringId: formData.get("mentoringId")?.toString(),
        to: formData.get("to")?.toString(),
      });
      if (!parsed.success) return { error: parsed.error.issues[0].message };

      await http.patch(
        `${import.meta.env.VITE_API_URL}/api/permission/${parsed.data.mentoringId}`,
        { to: parsed.data.to }
      );

      notifications.show({
        title: "소유권 이전 완료",
        message: `${parsed.data.to}에게 소유권이 이전되었습니다.`,
        color: "green",
        withCloseButton: true,
        position: "bottom-center",
        autoClose: 4000,
      });
      throw redirect(`/mentoring/${parsed.data.mentoringId}`);
    }

    return { error: "잘못된 요청입니다." };

  } catch (err) {
    if (err instanceof Response) throw err;
    if (err instanceof AxiosError) {
      console.log(err.response?.data)
      if (err.response?.data === "AlreadyOwner") return { error: "이미 소유자입니다." }
      if (err.response?.data === "NoPermissionRecord") return { error: "소유권 이전 대상이 해당 멘토링의 편집자가 아닙니다." }
      if (err.response?.data === "NoOwner") return { error: "소유자가 존재하지 않는 멘토링입니다. 관리자에게 문의해주시기 바랍니다." }

      if (err.status === 403) return { error: "권한이 없습니다." };
      if (err.status === 404) return { error: "사용자를 찾을 수 없습니다." };
      if (err.status === 409) return { error: "이미 권한이 부여된 사용자입니다." };
    }
    return { error: "오류가 발생했습니다." };
  }
}
