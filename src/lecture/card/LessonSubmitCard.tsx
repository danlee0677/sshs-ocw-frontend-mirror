import { Button, Group, Text } from "@mantine/core"
import { useCurrentEditor } from "@tiptap/react"
import { handleLessonSubmit } from "../editor/editorUtils";

function LessonSubmitCard({ mode, lessonId, title }: { mode: "edit" | "create", lessonId: string | undefined, title: string }) {
  const { editor } = useCurrentEditor();

  return (
    <>
      { editor ? 
        <Group >
          <Button onClick={() => handleLessonSubmit(mode, lessonId, editor, title)}>
            {mode === "create" ? "강의 생성" : "강의 수정"}
          </Button>
        </Group>
      :
        <Text>Editor is Loading...</Text>
      }
    </>
    
  )
}

export default LessonSubmitCard