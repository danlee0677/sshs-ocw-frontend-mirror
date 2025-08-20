import React from "react";
import classes from './main.module.css'
import { Button, Flex, Grid, Group, Image, SimpleGrid, Stack, Space, Table, Text, Title, UnstyledButton } from "@mantine/core";
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import NewUser from "./NewUser";
import Join from "./Join"

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

const types = [
    { sub: '영상 위주' },
    { sub: '글 위주' },
    { sub: '퀴즈 위주' },
    { sub: '혼합' },
    { sub: '그 외' },
]

function Main() {
    const [toggled, setToggled] = useState(Array(items.length).fill(false));
    const [courseToggled, setCourseToggled] = useState(Array(course.length).fill(false));
    const [typeToggled, setTypeToggled] = useState(Array(types.length).fill(false));

    const courseToggle = (i: Number) => {
        setCourseToggled((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
    }
    const typeToggle = (i: Number) => {
        setTypeToggled((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
    }
    const toggle = (i: Number) =>
        setToggled((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    
    const [step, setStep] = useState(0);


    const isMobile = useMediaQuery('(max-width: 60em)')

    return (
        <>  
        {
            step === 0 ? (
                NewUser(toggle, setToggled, toggled, step, setStep, isMobile)
            ) : (
                Join(courseToggled, setCourseToggled, courseToggle, typeToggled, setTypeToggled, typeToggle, step, setStep)
            )
        }
        </>
    )
}

export default Main;