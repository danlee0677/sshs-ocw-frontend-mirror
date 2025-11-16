import MainPageAppshell from "../main/MainPageAppshell";
import { Flex, Title } from "@mantine/core";

function NotFoundPage() {
  return (
    <MainPageAppshell>
      <Flex w="100%" h="100%" justify="center" align="center">
        <Title order={1}>This page does not exist :(</Title>
      </Flex>
    </MainPageAppshell>
  )
}

export default NotFoundPage;