import { Title } from "@mantine/core";
import type { User } from "../libs/types";

function Profile({user, setUser} : {user: User | null, setUser: React.Dispatch<User | null>}) {
    return (
        <>
            <Title>{user?.username}</Title>
        </>
    )
}