import { useMemo, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { http } from "../../libs/http";

// key for storing editor things in localstorage
export const LESSON_STORAGE_KEY = "LectureEditor_v01"

export function getContentFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LESSON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : "여기에 강의를 작성하세요!"
  } catch {
    return "여기에 강의를 작성하세요!"
  }
}

export function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timeout = useMemo<{ id: number | null }>(() => ({id: null}), [])
  return useCallback((...args: Parameters<T>) => {
    if (timeout.id) clearTimeout(timeout.id);
    console.log(5)
    timeout.id = window.setTimeout(() => fn(...args), delay)
  }, [fn, delay, timeout])
}

export function addYoutubeVideo(editor: Editor | null) {
  if (!editor) return;

  const url = prompt('Enter Youtube URL')

  if (url) {
    editor.commands.setYoutubeVideo({
      src: url,
    })
  }
}


// todo: send module id along
export function handleLessonSubmit(mode: "edit" | "create", lessonId: string | undefined, editor: Editor, title: string) {
  // when endpoint is /lessons/create i.e. creating new lesson
  if (mode === "create") {
    http.post(`${process.env.REACT_APP_API_URL}/api/lesson`, {
      title: title,
      content: JSON.stringify(editor.getJSON()),
    }).catch((err) => {
      console.log(err);
    }).then((res) => {
      localStorage.removeItem(LESSON_STORAGE_KEY);
    })
  } else { // when endpoint is /lesson/:lessonId/edit i.e. editing a lesson
    http.patch(`${process.env.REACT_APP_API_URL}/api/lessons/${lessonId}`, {
      title: title,
      content: JSON.stringify(editor.getJSON()),
    }).catch((err) => {
      console.log(err);
    }).then((res) => {
      localStorage.removeItem(LESSON_STORAGE_KEY);
    })
  }
}