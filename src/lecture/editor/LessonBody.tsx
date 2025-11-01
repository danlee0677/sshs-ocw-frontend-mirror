import { ReactNode } from "react";
import { useEditor } from '@tiptap/react'
import { RichTextEditor, Link } from '@mantine/tiptap'
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from '@tiptap/extension-mathematics'
import Youtube from '@tiptap/extension-youtube'
// todo: subscript/superscript
// todo: useMemo for optimizing editor?


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
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
      }),
      Link,
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
        height: 360,
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

  return (
    <RichTextEditor editor={editor} >
      <Shell>
        <ScrollArea w="100%" h="100%" scrollbarSize={5} >
          <Flex h="100%" w="100%" justify="center">
            <Stack h="100%" w="700" align="stretch" gap={0}>
                {before}
                <Space h="md" />

                {editable ? <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Subscript />
                    <RichTextEditor.Superscript />
                  </RichTextEditor.ControlsGroup>

                   <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar> : <></>}
                
                <RichTextEditor.Content />
                
                <Space h="md" />
                {after}
            </Stack>
          </Flex>
        </ScrollArea>
      </Shell>
    </RichTextEditor>
  )
}

export default LessonBody