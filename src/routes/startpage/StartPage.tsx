import { useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import NewUser from "./NewUser";
import Join from "./Join"
import { redirect, useLoaderData, useNavigate, type LoaderFunctionArgs } from 'react-router';
import { http } from '../../libs/http';
import z from 'zod';

export async function clientLoader({ request }: LoaderFunctionArgs) {
  try {
    await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);

    // if succeed in fetching user, go to home!
    throw redirect("/home")
  } catch (err) {
    if (err instanceof Response) throw err;

    const url = new URL(request.url)
    const parsed = z.object({ error: z.string().optional() }).safeParse(Object.fromEntries(url.searchParams))
    
    const errorMessage = parsed.success && parsed.data.error ? parsed.data.error : null;
    const initialStep = errorMessage ? 1 : 0;
    return { errorMessage, initialStep };
  }
}

export default function StartPage() {
  const { errorMessage, initialStep } = useLoaderData<typeof clientLoader>();
  const [step, setStep] = useState(initialStep);

  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 60em)')  

  return (
    <>
      {
        step === 0 ? (
          <NewUser setStep={setStep} isMobile={isMobile} navigate={navigate} />
        ) : step === 1 ? (
          <Join setStep={setStep} errorMessage={errorMessage}/>
        ) : (
          <div>this is wrong page</div>
        )
      }
    </>
  )
}