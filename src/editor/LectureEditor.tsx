import { useCallback, useMemo } from "react";
import { useEditor, EditorContent, EditorContext } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from '@tiptap/extension-mathematics'
import Youtube from '@tiptap/extension-youtube'
import EditorAppshell from "./EditorAppshell";

const STORAGE_KEY = "LectureEditor_v01"

function getContentFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : "여기에 강의를 작성하세요!"
  } catch {
    return "여기에 강의를 작성하세요!"
  }
}

function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timeout = useMemo<{ id: number | null }>(() => ({id: null}), [])
  return useCallback((...args: Parameters<T>) => {
    if (timeout.id) clearTimeout(timeout.id);
    console.log(5)
    timeout.id = window.setTimeout(() => fn(...args), delay)
  }, [fn, delay, timeout])
}


function LectureEditor() {
  // persist through refresh: save 
  const debouceSave = useDebounce((json : any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
      console.log(3)
    } catch (err) {
      console.log('Failed to save document', err);
    }
  }, 800)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mathematics.configure({
        inlineOptions: {
          // d
        },
        blockOptions: {
          // d
        },
        katexOptions: {
          // d
        }
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        controls: false,
        nocookie: true,
        allowFullscreen: true,

      })
    ],
    // try to fetch from localStorage
    content: getContentFromLocalStorage(),
    onUpdate: ({editor, transaction}) => {
      if (transaction.docChanged) debouceSave(editor.getJSON());
    }
  })

  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorAppshell>
      <EditorContext.Provider value={providerValue} >
        <EditorContent editor={editor} />
        <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
        <BubbleMenu editor={editor}>This is the Bubble menu</BubbleMenu>
      </EditorContext.Provider>
    </EditorAppshell>
  )
}

export default LectureEditor