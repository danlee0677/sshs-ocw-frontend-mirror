import { Group, Space, Text } from "@mantine/core";
import { Link } from "react-router";
import { linkStyle } from "../libs/styles";
import type { Lesson, Module, Subject } from "../libs/types";

function LessonViewerNavigateCard({ subject, lesson }: { subject: Subject, lesson: Lesson }) {
  const prev = "< Prev";
  const next = "Next >";
  const pageMax = subject.contents.length;
  const pageMin = 0;
  const ind = subject.contents.findIndex((val) => val._id === lesson._id)

  return (
    <Group gap={0}>
      {(ind - 1) >= pageMin ? 
      <Link to={`/lesson/${subject.contents[ind - 1]._id}?subjectId=${subject._id}`} style={linkStyle}>
        <Text size="md" color="#000000">{prev}</Text>
      </Link> : <Text size="md" color="#999999">{prev}</Text>}
      
      <Space w={600} />
      {(ind + 1) < pageMax ? 
      <Link to={`/lesson/${subject.contents[ind + 1]._id}?subjectId=${subject._id}`} style={linkStyle}>
        <Text size="md" color="#000000">{next}</Text>
      </Link> : <Text size="md" color="#999999">{next}</Text>}
    </Group>
  )
}

export default LessonViewerNavigateCard;