import React from "react";
import { Group, Space, Text } from "@mantine/core";
import { Link } from "react-router";
import { linkStyle } from "../../libs/styles";

function NavigateCard({dir, num, pageMin, pageMax}: {dir: string, num: number, pageMin: number, pageMax: number}) {
  const prev = "< Prev";
  const next = "Next >";
  return (
    <Group gap={0}>
      {(num - 1) >= pageMin ? 
      <Link to={dir + "/" + (num - 1).toString()} style={linkStyle}>
        <Text size="md">{prev}</Text>
      </Link> : <Text size="md">{prev}</Text>}
      
      <Space w={600} />
      {(num + 1) <= pageMax ? 
      <Link to={dir + "/" + (num + 1).toString()} style={linkStyle}>
        <Text size="md">{next}</Text>
      </Link> : <Text size="md">{next}</Text>}
    </Group>
  )
}

export default NavigateCard;