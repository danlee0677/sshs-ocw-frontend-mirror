import React from "react";
import LectureAppshell from "./LectureAppshell";
import { Text, Flex, ScrollArea, Stack, Space } from "@mantine/core";
import LectureParser from "./LectureParser";
import { LectureComponent } from "../libs/types";
import NavigateCard from "./card/NavigateCard";

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
      <ScrollArea h="100%" type="auto" scrollbarSize={5}>
        <Stack w="100%" gap="md" align="center">
          <Space h="md"/>
          <NavigateCard dir={"/info"} num={0} pageMin={0} pageMax={0} />
          {lecture}
        </Stack>
      </ScrollArea>
      
    </LectureAppshell>
  )
}

export default Lecture