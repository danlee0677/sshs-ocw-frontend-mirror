import SubjectEditor from "../../components/subject/SubjectEditor";
import { http } from "../../libs/http";
import { userSchema } from "../../libs/types";
import { AxiosError } from "axios";

export async function clientLoader() {
  try {
    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const parsed = userSchema.safeParse(userRes.data);

    if (!parsed.success || (!parsed.data.roles.includes('admin') && !parsed.data.roles.includes('creator')))
      throw new Response("No permission to create subject", { status: 403 });
  } catch (err) {
    if (err instanceof Response) throw err;
    if (err instanceof AxiosError && err.status === 401) throw new Response("Not Logged in", { status: 401 });
    throw err
  }
}

export default function SubjectCreate() {
  return (
    <SubjectEditor initialContent={null} mode="create" />
  )
}