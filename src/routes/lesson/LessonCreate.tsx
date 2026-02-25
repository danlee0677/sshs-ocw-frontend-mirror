import { redirect } from "react-router";
import { http } from "../../libs/http";
import { userSchema } from "../../libs/types";
import LessonEditor from "../../components/lesson/LessonEditor";

export async function clientLoader() {
  try {
    const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);
    const parsed = userSchema.safeParse(res.data);
    
    if (!parsed.success) throw new Error("Cannot parse user from server");

    if (!parsed.data.roles.includes("admin")) throw new Response(null, { status: 403, statusText: "Unauthorized Account" });
  } catch (err) {
    if (err instanceof Response) throw err;

    throw redirect("/home")
  } 
}

export default function LessonCreate() {
  return <LessonEditor mode="create" />
}