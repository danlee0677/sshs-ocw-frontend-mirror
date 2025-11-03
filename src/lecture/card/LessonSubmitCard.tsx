import { Button, Group, Text } from "@mantine/core"
import { NavigateFunction } from "react-router";
import { useRichTextEditorContext } from '@mantine/tiptap'
import { handleLessonSubmit } from "../editor/editorUtils";
import { User } from "../../libs/types";

function LessonSubmitCard({ mode, lessonId, title, moduleId, subjectId, navigate, user }: { mode: "edit" | "create", lessonId: string | undefined, title: string, moduleId: string, subjectId: string, navigate: NavigateFunction, user: User }) {
  const { editor } = useRichTextEditorContext();

  return (
    <>
      { editor ? 
        <Group >
          <Button onClick={() => handleLessonSubmit(mode, lessonId, editor, title, navigate, moduleId, subjectId, user)}>
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