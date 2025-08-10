import React from "react";
import { LectureComponent } from "../libs/types";
import { Stack, Title, Text, Flex, Space } from "@mantine/core";
import VideoCard from "./card/VideoCard";

function LectureParser({src, w}: {src: Array<LectureComponent>, w: string}) {
  const children = src.map((c) => {
    if (c.type === "heading") {
      if (c.justify !== "flex-start") {
        return (<Flex w="100%" justify={c.justify}>
          <Title order={c.order}>{c.content}</Title>
        </Flex>)
      }
      return <Title order={c.order}>{c.content}</Title>
    } else if (c.type === "body") {
      return <></>
    } else if (c.type === "video") {
      return <VideoCard src={c.src} />
    }
  })
  
  return (
    <Stack h="100%" w={w} align="flex-start" justify="center" gap="lg">
      {children}
    </Stack>
  )
}

export default LectureParser