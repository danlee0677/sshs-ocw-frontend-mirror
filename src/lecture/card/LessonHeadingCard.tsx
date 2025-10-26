import { Title, TextInput, Stack, Text, Flex } from "@mantine/core"
import { Lesson } from "../../libs/types"

function LessonHeadingCard({ editable, title, setTitle, content }: { editable: boolean, title: string, setTitle: React.Dispatch<string>, content: Lesson | null }) {

  return (
    <>{editable ? 
      <TextInput label="강의 제목" placeholder="강의 제목을 작성하세요"
      value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
    : 
      <Stack gap="sm" align="stretch">
        <Flex justify="flex-start">
          <Title h={1}>{title}</Title>
        </Flex>
        <Flex justify="flex-end">
          <Text>{content ? content.createdBy : ""}</Text>
        </Flex>
        <Text size="md" ></Text>
      </Stack>
    }</>
  )
}

export default LessonHeadingCard