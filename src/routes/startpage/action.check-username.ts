import z from 'zod';
import { http } from '../../libs/http';
import { redirect } from 'react-router';

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username") as string;

  const res = await http.post(`${import.meta.env.VITE_API_URL}/api/auth/check-username`, { username });
  const parsed = z.object({ available: z.boolean(), reason: z.string().optional() }).safeParse(res.data);

  if (!parsed.success) throw new Response(null, {
    status: 400,
    statusText: "Failed to parse server response."
  })

  if (parsed.data.available) {
    throw redirect(`/login?new=1&username=${encodeURIComponent(username)}`);
  }

  return {
    available: false,
    message: parsed.data.reason === "InvalidUsername"
      ? "닉네임은 2~20자의 한글, 영문, 숫자, _만 사용할 수 있습니다."
      : "이미 존재하는 닉네임입니다.",
    username,
  }
}