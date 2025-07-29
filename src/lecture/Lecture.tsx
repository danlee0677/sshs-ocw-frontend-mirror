import React from "react";
import LectureAppshell from "./LectureAppshell";
import { Text, Flex, ScrollArea, Stack } from "@mantine/core";
import VideoCard from "./VideoCard";

function Lecture() {
  return (
    <LectureAppshell>
      <ScrollArea h="100%" type="scroll" scrollbarSize={5}>
        <Flex w="100%" justify="center">
          <Stack h="100%" w="70%" justify="center" align="center" gap="lg">
            <VideoCard src="https://www.youtube.com/embed/dQw4w9WgXcQ" />
          </Stack>
        </Flex>
      </ScrollArea>
      
    </LectureAppshell>
  )
}

export default Lecture