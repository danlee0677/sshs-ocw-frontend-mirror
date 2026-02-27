import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import SubjectEditor from "../../components/subject/SubjectEditor";
import { http } from "../../libs/http";
import { subjectSchema } from "../../libs/types";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const subjectId = params.subjectId;
    const subjectRes = await http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`)

    const subjectParsed = subjectSchema.safeParse(subjectRes.data);
    if (!subjectParsed.success) throw new Error("Failed to parse subject from server");

    return { initalContent: subjectParsed.data };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw err;
  }
}

export default function SubjectEdit() {
  const { initalContent } = useLoaderData<typeof clientLoader>();
  return (
    <SubjectEditor mode="edit" initialContent={initalContent}/>
  )
}