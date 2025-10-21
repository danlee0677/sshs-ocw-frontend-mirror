import React from "react";
import { Button, FileButton, Group, Input, Stack, UnstyledButton } from "@mantine/core";
import classes from '../main/main.module.css'
import MainPageHeader from "../main/MainPageAppshell";
import { file } from "zod";

function Setting() {
    return (
        <MainPageHeader>
            <Stack className={`${classes.Vertical_align}`} w={'100%'} h={'auto'}>
                <Group className={`${classes.Vertical_align}`} w={'80%'} h={'10vh'}>아이디 변경
                    <Input></Input>
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
        </MainPageHeader>
    )
}

export default Setting;