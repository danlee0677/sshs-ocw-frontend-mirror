import { Text, Group, TextInput, Stack, Button } from "@mantine/core";
import classes from './setting.module.css'
import MainPageAppshell from "../../components/appshell/MainPageAppshell";

function Setting() {
  return (
    <MainPageAppshell>
      <Stack className={`${classes.Vertical_align}`} w={'100%'} h={'auto'}>
        <Group className={`${classes.Vertical_align}`} w={'80%'} h={'10vh'}>
          <Text>아이디 변경</Text>
          <TextInput></TextInput>
          <Button disabled={true}>적용</Button>
        </Group>
      </Stack>
    </MainPageAppshell>
  )
}

export default Setting;