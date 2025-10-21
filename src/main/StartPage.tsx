import { useEffect, useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import NewUser from "./NewUser";
import Join from "./Join"
import { useNavigate } from 'react-router';


const items = [
    { src: '/img/math.png', alt: 'math', sub: '수학' },
    { src: '/img/physics.png', alt: 'physics', sub: '물리' },
    { src: '/img/chemistry.png', alt: 'chemistry', sub: '화학' },
    { src: '/img/biology.png', alt: 'biology', sub: '생물' },
    { src: '/img/geology.png', alt: 'earth-science', sub: '지학' },
    { src: '/img/coding.png', alt: 'coding', sub: '정보' },
];

const course = [
    { sub: '중등 과정' },
    { sub: '고등 과정' },
    { sub: '대학 과정' },
    { sub: '그 외' }
]

function StartPage() {
    const [toggled, setToggled] = useState(Array(items.length).fill(false));
    const [courseToggled, setCourseToggled] = useState(Array(course.length).fill(false));

    const courseToggle = (i: Number) => {
        setCourseToggled((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
    }

    const toggle = (i: Number) =>
        setToggled((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    
    const [step, setStep] = useState(0);

    const navigate = useNavigate()

    useEffect(() => {
      if (step === 2) {
        navigate("/login", {state: { toggled: toggled, courseToggled: courseToggled }})
      }
    }, [step, navigate, toggled, courseToggled])


    const isMobile = useMediaQuery('(max-width: 60em)')

    return (
        <>  
        {
            step === 0 ? (
                NewUser(toggle, toggled, step, setStep, isMobile, navigate)
            ) : step === 1 ? (
                Join(courseToggled, setCourseToggled, courseToggle, step, setStep)
            ) : (
                <div>this is wrong page</div>
            )
        }
        </>
    )
}

export default StartPage;