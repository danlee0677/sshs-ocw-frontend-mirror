import { useState } from 'react'
import NewUser from "./NewUser";
import Join from "./Join"
import { redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router';
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

  /* `const isMobile = useMediaQuery('(max-width: 60em)')` lived here and is gone.
     Three things were wrong with it: 60em matches no Mantine breakpoint (sm is
     48em, md is 62em), so the pivot was arbitrary; it passed no fallback and no
     `{ getInitialValueInEffect: false }`, so it painted the desktop layout and
     snapped; and it was branching on width in JS to pick a component, which is
     what CSS is for. NewUser.tsx now expresses the same pivot as a responsive
     `direction` prop, so no media query survives on this route. */

  return (
    <>
      {
        step === 0 ? (
          <NewUser setStep={setStep} />
        ) : step === 1 ? (
          <Join setStep={setStep} errorMessage={errorMessage}/>
        ) : (
          <div>this is wrong page</div>
        )
      }
    </>
  )
}