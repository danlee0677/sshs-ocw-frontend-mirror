import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import SubjectEditor from "../../components/subject/SubjectEditor";
import { http } from "../../libs/http";
import { permissionCheckSchema, subjectSchema, userSchema } from "../../libs/types";
import { AxiosError } from "axios";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const parsed = userSchema.safeParse(userRes.data);

    if (!parsed.success) throw new Response("Not Logged in", { status: 401 });

    const subjectId = params.subjectId;

    let userRole: 'admin' | 'owner' | 'editor' | null = null;

    if (parsed.data.roles.includes('admin')) {
      userRole = 'admin';
    } else {
      const permRes = await http.get(`${import.meta.env.VITE_API_URL}/api/permission/check/${subjectId}`);
      const permParsed = permissionCheckSchema.safeParse(permRes.data);
      if (!permParsed.success || !permParsed.data.canEdit)
        throw new Response("No permission to edit subject", { status: 403 });
      userRole = permParsed.data.role;
    }

    const subjectRes = await http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`)

    const subjectParsed = subjectSchema.safeParse(subjectRes.data);
    if (!subjectParsed.success) throw new Error("Failed to parse subject from server");

    return { initialContent: subjectParsed.data, userRole };
  } catch (err) {
    if (err instanceof Response) throw err;
    if (err instanceof AxiosError && err.status === 401) throw new Response("Not Logged in", { status: 401 });
    throw err
  }
}

export default function SubjectEdit() {
  const { initialContent: initalContent, userRole } = useLoaderData<typeof clientLoader>();
  return (
    <SubjectEditor mode="edit" initialContent={initalContent} userRole={userRole}/>
  )
}