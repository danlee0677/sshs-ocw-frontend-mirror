import { Button, Group, Text } from "@mantine/core"
import type { NavigateFunction } from "react-router";
import { Editor } from "@tiptap/react";
import { useRichTextEditorContext } from '@mantine/tiptap'
import type { User } from "../libs/types";
import { http } from "../libs/http";
import { LESSON_STORAGE_KEY } from "../lesson/LessonEditorBody";

export function handleLessonSubmit(mode: "edit" | "create", lessonId: string | undefined, editor: Editor, title: string, navigate: NavigateFunction, subjectId: string, user: User) {
  // todo: alert?
  if (!title || !editor.getJSON()) return;

  // when endpoint is /lessons/create i.e. creating new lesson
  if (mode === "create") {
    http.post(`${import.meta.env.VITE_API_URL}/api/lessons`, {
      subject: subjectId,
      title: title,
      content: JSON.stringify(editor.getJSON()),
      createdBy: user._id
    }).then(() => {
      localStorage.removeItem(LESSON_STORAGE_KEY);
      navigate(`/subject/${subjectId}`)
    }).catch((err) => {
      console.log(err);
    })
  } else { // when endpoint is /lesson/:lessonId/edit i.e. editing a lesson
    http.patch(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`, {
      title: title,
      content: JSON.stringify(editor.getJSON()),
    }).then(() => {
      localStorage.removeItem(LESSON_STORAGE_KEY);
      navigate(`/subject/${subjectId}`)
    }).catch((err) => {
      console.log(err);
    })
  }
}

function LessonSubmitCard({ mode, lessonId, title, subjectId, navigate, user }: { mode: "edit" | "create", lessonId: string | undefined, title: string, subjectId: string, navigate: NavigateFunction, user: User }) {
  const { editor } = useRichTextEditorContext();

  return (
    <>
      { editor ? 
        <Group >
          <Button onClick={() => handleLessonSubmit(mode, lessonId, editor, title, navigate, subjectId, user)}>
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