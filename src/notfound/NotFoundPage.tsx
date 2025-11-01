import MainPageHeader from "../main/MainPageAppshell";
import { Flex, Title } from "@mantine/core";

function NotFoundPage() {
  return (
    <MainPageHeader>
      <Flex w="100%" h="100%" justify="center" align="center">
        <Title order={1}>This page does not exist :(</Title>
      </Flex>
    </MainPageHeader>
  )
}

export default NotFoundPage;