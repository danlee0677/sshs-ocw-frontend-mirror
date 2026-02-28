import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import SubjectEditor from "../../components/subject/SubjectEditor";
import { http } from "../../libs/http";
import { subjectSchema, userSchema } from "../../libs/types";
import { AxiosError } from "axios";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const userRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const parsed = userSchema.safeParse(userRes.data);

    if (!parsed.success || !parsed.data.roles.includes('admin')) throw new Response("No permission to create subject", { status: 401 });
    
    const subjectId = params.subjectId;
    const subjectRes = await http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`)

    const subjectParsed = subjectSchema.safeParse(subjectRes.data);
    if (!subjectParsed.success) throw new Error("Failed to parse subject from server");

    return { initalContent: subjectParsed.data };
  } catch (err) {
    if (err instanceof Response) throw err;
    if (err instanceof AxiosError && err.status === 401) throw new Response("Not Logged in", { status: 401 });
    throw err
  }
}

export default function SubjectEdit() {
  const { initalContent } = useLoaderData<typeof clientLoader>();
  return (
    <SubjectEditor mode="edit" initialContent={initalContent}/>
  )
}