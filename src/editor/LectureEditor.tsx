import { ReactNode, useMemo } from "react";
import { useEditor, EditorContent, EditorContext } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from '@tiptap/extension-mathematics'
import Youtube from '@tiptap/extension-youtube'
import { useDebounce, STORAGE_KEY, getContentFromLocalStorage } from "./editorUtils";
import { Button, ScrollArea } from "@mantine/core";
import { ShellComponent } from "../libs/types";

function LectureEditor({editable, content, Shell} : {editable: boolean, content: object | null, Shell: ShellComponent}) {
  // persist through refresh: save 
  const debounceSave = useDebounce((json : any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
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

      }),
    ],
    // try to fetch from localStorage
    // if content is not editable, use content
    content: content ?? getContentFromLocalStorage(),
    onUpdate: ({editor, transaction}) => {
      if (!editable) return;
      if (transaction.docChanged) debounceSave(editor.getJSON());
    },
    editable: editable,
  })

  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorContext.Provider value={providerValue} >
      <Shell>
        <ScrollArea w="100%" h="100%" scrollbarSize={5} >
          <EditorContent editor={editor} />

          <BubbleMenu editor={editor}>
            <Button size="compact-xs" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? "transparent" : "default"} >Bold</Button>
          </BubbleMenu>
        </ScrollArea>
      </Shell>
    </EditorContext.Provider>
  )
}

export default LectureEditor