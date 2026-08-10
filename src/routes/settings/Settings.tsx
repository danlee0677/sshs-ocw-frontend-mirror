import { Text, Group, TextInput, Stack, Button, ScrollArea } from "@mantine/core";
import classes from '../../styles/shared.module.css'
import MainPageAppshell from "../../components/appshell/MainPageAppshell";

function Setting() {
  return (
    <MainPageAppshell>
      {/* AppShell.Main is `overflow: hidden`, so each page owns its own scroll
        * container. Without this the page clips instead of scrolling. */}
      <ScrollArea w="100%" h="100%">
        <Stack className={`${classes.Vertical_align}`} w={'100%'} h={'auto'}>
          <Group className={`${classes.Vertical_align}`} w={'80%'} h={'10vh'}>
            <Text>아이디 변경</Text>
            <TextInput></TextInput>
            <Button disabled={true}>적용</Button>
          </Group>
        </Stack>
      </ScrollArea>
    </MainPageAppshell>
  )
}

export default Setting;