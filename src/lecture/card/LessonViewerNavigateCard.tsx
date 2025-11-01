import React from "react";
import { Group, Space, Text } from "@mantine/core";
import { Link } from "react-router";
import { linkStyle } from "../../libs/styles";
import { Lesson, Module } from "../../libs/types";

function LessonViewerNavigateCard({ module, lesson }: { module: Module, lesson: Lesson }) {
  const prev = "< Prev";
  const next = "Next >";
  const pageMax = module.contents.length;
  const pageMin = 0;
  const ind = module.contents.findIndex((val) => {return val._id === lesson._id})

  return (
    <Group gap={0}>
      {(ind - 1) >= pageMin ? 
      <Link to={`/lessons/${module.contents[ind - 1]._id}`} style={linkStyle}>
        <Text size="md">{prev}</Text>
      </Link> : <Text size="md">{prev}</Text>}
      
      <Space w={600} />
      {(ind + 1) < pageMax ? 
      <Link to={`/lessons/${module.contents[ind + 1]._id}`} style={linkStyle}>
        <Text size="md">{next}</Text>
      </Link> : <Text size="md">{next}</Text>}
    </Group>
  )
}

export default LessonViewerNavigateCard;