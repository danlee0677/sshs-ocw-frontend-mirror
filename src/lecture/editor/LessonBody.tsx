import { ReactNode, useMemo } from "react";
import { useEditor, EditorContent, EditorContext } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from '@tiptap/extension-mathematics'
import Youtube from '@tiptap/extension-youtube'

// code highlight imports
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// load all language: change if necessary
import { createLowlight, all } from 'lowlight'
import 'highlight.js/styles/github-dark.css' // todo: change when dark mode

import { useDebounce, LESSON_STORAGE_KEY, getContentFromLocalStorage } from "./editorUtils";
import { Button, Flex, ScrollArea, Stack, Space } from "@mantine/core";
import { ShellComponent } from "../../libs/types";


const lowlight = createLowlight(all);

function LessonBody({editable, content, Shell, before, after} : {editable: boolean, content: object | null, Shell: ShellComponent, before: ReactNode, after: ReactNode}) {
  // persist through refresh: save 
  const debounceSave = useDebounce((json : any) => {
    try {
      localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(json))
    } catch (err) {
      console.log('Failed to save document', err);
    }
  }, 800)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Mathematics.configure({
        inlineOptions: {
          // d
        },
        blockOptions: {
          // d
        },
        katexOptions: {
          throwOnError: false,
        }
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        controls: false,
        nocookie: true,
        allowFullscreen: true,
        
      }),
      CodeBlockLowlight.configure({
        lowlight: lowlight,
        enableTabIndentation: true,
        tabSize: 4,
        
      })
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

  // todo: fix editor box width to stack width
  return (
    <EditorContext.Provider value={providerValue} >
      <Shell>
        <ScrollArea w="100%" h="100%" scrollbarSize={5} >
          <Flex h="100%" w="100%" justify="center">
            <Stack h="100%" w="700" align="stretch" gap={0}>
              {before}
              <Space h="md" />
              <EditorContent editor={editor} />
              <Space h="md" />
              {after}
            </Stack>
          </Flex>
          <BubbleMenu editor={editor}>
            <Button size="compact-xs" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? "transparent" : "default"} >Bold</Button>
          </BubbleMenu>
        </ScrollArea>
      </Shell>
    </EditorContext.Provider>
  )
}

export default LessonBody