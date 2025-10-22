import { useMemo, useCallback } from "react";
import { Editor } from "@tiptap/react";

// key for storing editor things in localstorage
export const STORAGE_KEY = "LectureEditor_v01"

export function getContentFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

// function for patching when editing existing lesson
function handlePatch() {

}

// function to handle creation of new lesson
function handlePost() {

}
