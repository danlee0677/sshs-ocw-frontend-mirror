import { useEffect, useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import NewUser from "./NewUser";
import Join from "./Join"
import { useNavigate } from 'react-router';


function StartPage() {
    const [step, setStep] = useState(0);
    const [username, setUsername] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        if (step === 2) {
            navigate("/login?new=1", { state: { username: username } })
        }
    }, [step, navigate, username])


    const isMobile = useMediaQuery('(max-width: 60em)')

    return (
        <>
            {
                step === 0 ? (
                    NewUser(setStep, isMobile, navigate)
                ) : step === 1 ? (
                    Join(step, setStep, username, setUsername)
                ) : (
                    <div>this is wrong page</div>
                )
            }
        </>
    )
}

export default StartPage;