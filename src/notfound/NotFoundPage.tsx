import type { User } from "../libs/types";
import MainPageAppshell from "../main/MainPageAppshell";
import { Flex, Title } from "@mantine/core";

function NotFoundPage({user, setUser}: {user: User | null, setUser: React.Dispatch<User | null> }) {
  return (
    <MainPageAppshell user={user} setUser={setUser}>
      <Flex w="100%" h="100%" justify="center" align="center">
        <Title order={1}>This page does not exist :(</Title>
      </Flex>
    </MainPageAppshell>
  )
}

export default NotFoundPage;