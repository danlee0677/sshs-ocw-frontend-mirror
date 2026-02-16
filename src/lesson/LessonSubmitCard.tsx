import { Button, Group, Text } from "@mantine/core"
import type { NavigateFunction } from "react-router";
import { Editor } from "@tiptap/react";
import type { User } from "../libs/types";
import { http } from "../libs/http";
import { LESSON_STORAGE_KEY, MARKDOWN_STORAGE_KEY } from "./LessonEditorBody";

export function handleLessonSubmit(mode: "edit" | "create", lessonId: string | undefined, editor: Editor, title: string, navigate: NavigateFunction, subjectId: string, user: User, student_only: boolean) {
  // todo: alert?
  if (!title) {
    alert("제목을 입력해 주세요!")
    return;
  }
  if (!editor.getJSON()) {
    alert("강의 내용을 입력해 주세요! 혹시 마크다운 작성만 하였다면 '마크다운 컴파일' 버튼을 눌렀는지 확인해 주세요!")
    return;
  }

  // when endpoint is /lessons/create i.e. creating new lesson
  if (mode === "create") {
    http.post(`${import.meta.env.VITE_API_URL}/api/lessons`, {
      subject: subjectId,
      title: title,
      content: JSON.stringify(editor.getJSON()),
      createdBy: user._id,
      student_only: student_only,
    }).then(() => {
      localStorage.removeItem(LESSON_STORAGE_KEY);
      localStorage.removeItem(MARKDOWN_STORAGE_KEY);
      navigate(`/subject/${subjectId}`)
    }).catch((err) => {
      console.log(err);
    })
  } else { // when endpoint is /lesson/:lessonId/edit i.e. editing a lesson
    http.patch(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`, {
      title: title,
      content: JSON.stringify(editor.getJSON()),
      student_only: student_only,
    }).then(() => {
      localStorage.removeItem(LESSON_STORAGE_KEY);
      navigate(`/subject/${subjectId}`)
    }).catch((err) => {
      console.log(err);
    })
  }
}

interface LessonSubmitCardProps { 
  mode: "edit" | "create", 
  lessonId: string | undefined, 
  title: string, 
  subjectId: string, 
  navigate: NavigateFunction, 
  user: User,
  editor: Editor,
  student_only: boolean,
}

function LessonSubmitCard({ mode, lessonId, title, subjectId, navigate, user, editor, student_only }: LessonSubmitCardProps) {
  return (
    <>
      { editor ? 
        <Group >
          <Button onClick={() => handleLessonSubmit(mode, lessonId, editor, title, navigate, subjectId, user, student_only)}>
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