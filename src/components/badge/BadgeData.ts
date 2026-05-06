type BadgeInfo = {
    name: string;
    description: string;
    image: string;
};


export const BadgeList: Record<number, BadgeInfo> = {
    1: {
        name: "신입",
        description: "SSHS TIPS를 이용해 주셔서 감사합니다!",
        image: 'https://res.cloudinary.com/dpcig7o5t/image/upload/v1778037223/sprout_ifrbbs.png'
    },
    2: {
        name: "응원의 한 표",
        description: "좋아하는 강의에 하트를 보냈어요.",
        image: 'https://res.cloudinary.com/dpcig7o5t/image/upload/v1778043892/heart_cg5i5b.png'
    },
    3: {
        name: "인증됨",
        description: "강의를 제작하고 인증 마크를 받아보세요.",
        image: ""
    }
}
