import { Group, Text } from "@mantine/core";
import { Link } from "react-router";
import { linkStyle } from "../../libs/styles";
import type { Lesson, Subject } from "../../libs/types";

function LessonViewerNavigateCard({ subject, lesson }: { subject: Subject, lesson: Lesson }) {
  const prev = "< Prev";
  const next = "Next >";
  const pageMax = subject.contents.length;
  const pageMin = 0;
  const ind = subject.contents.findIndex((val) => val._id === lesson._id)

  return (
    // The enabled links dropped `c="#000000"` rather than re-tokenising it:
    // <Text> already inherits var(--mantine-color-text), and an explicit colour
    // is exactly what would have kept them black on a dark page. The disabled
    // ones were `color="#999999"` — a hex literal AND the deprecated prop name;
    // `c="dimmed"` is both fixes at once.
    <Group gap={0} justify="space-between">
      {(ind - 1) >= pageMin ?
      <Link to={`/lesson/${subject.contents[ind - 1]._id}`} style={linkStyle}>
        <Text size="md">{prev}</Text>
      </Link> : <Text size="md" c="dimmed">{prev}</Text>}

      {(ind + 1) < pageMax ?
      <Link to={`/lesson/${subject.contents[ind + 1]._id}`} style={linkStyle}>
        <Text size="md">{next}</Text>
      </Link> : <Text size="md" c="dimmed">{next}</Text>}
    </Group>
  )
}

export default LessonViewerNavigateCard;