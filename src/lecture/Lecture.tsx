import React from "react";
import LectureAppshell from "./LectureAppshell";
import { Text, Flex, ScrollArea, Stack, Title } from "@mantine/core";
import LectureParser from "./LectureParser";
import { LectureComponent } from "../libs/types";

function Lecture() {
  const src: Array<LectureComponent> = [
    {
      type: "heading",
      order: 1,
      content: "Info1",
      justify: "center"
    },{
      type: "video",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },{
      type: "heading",
      order: 1,
      content: "Info2",
      justify: "flex-start"
    },{
      type: "video",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ];

  const lecture: React.ReactNode = LectureParser({src: src, w: "70%"});

  return (
    <LectureAppshell>
      <ScrollArea h="100%" type="scroll" scrollbarSize={5}>
        <Flex w="100%" justify="center">
          {lecture}
        </Flex>
      </ScrollArea>
      
    </LectureAppshell>
  )
}

export default Lecture