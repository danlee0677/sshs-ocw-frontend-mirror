import { Text, FileButton, Group, TextInput, Stack, UnstyledButton } from "@mantine/core";
import classes from '../main/main.module.css'
import MainPageAppshell from "../main/MainPageAppshell";
import type { User } from "../libs/types";

function Setting({user, setUser}: {user: User | null, setUser: React.Dispatch<User | null>}) {
    return (
        <MainPageAppshell user={user} setUser={setUser}>
            <Stack className={`${classes.Vertical_align}`} w={'100%'} h={'auto'}>
                <Group className={`${classes.Vertical_align}`} w={'80%'} h={'10vh'}>
                    <Text>아이디 변경</Text>
                    <TextInput></TextInput>
                    <UnstyledButton>적용</UnstyledButton>
                </Group>
                <Group className={`${classes.Vertical_align}`} w={'80%'} h={'10vh'}>프로필 변경
                    <FileButton
                        accept="image/apng,image/gif,image/jpeg,image/jpg,image/png"
                        onChange={() => {

                        }}
                        >
                        {(props) => (
                            <UnstyledButton {...props} className={`${classes.Button1}`}>업로드</UnstyledButton>
                        )}
                    </FileButton>
                </Group>
                <Group className={`${classes.Vertical_align}`} w={'80%'} h={'10vh'}>관심사 변경</Group>
            </Stack>
        </MainPageAppshell>
    )
}

export default Setting;