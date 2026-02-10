import React, { type ReactNode, useEffect, useMemo, useCallback, type SetStateAction } from "react";
import { Button, Group, ScrollArea, Stack, Textarea, Text, Flex, Divider, Paper } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Editor, useEditor } from '@tiptap/react'
import { RichTextEditor, Link } from '@mantine/tiptap'
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'
import Youtube from '@tiptap/extension-youtube'
import { Markdown } from '@tiptap/markdown';
import { TableKit } from '@tiptap/extension-table';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import TextAlign from '@tiptap/extension-text-align'
// todo: subscript/superscript
// todo: useMemo for optimizing editor?

// code highlight imports
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// load all language: change if necessary
import { createLowlight, all } from 'lowlight'
import 'highlight.js/styles/github-dark.css' // todo: change when dark mode
import type { Lesson, ShellComponent, User } from "../libs/types";

import { PLACEHOLDER_MARKDOWN } from "../libs/utils";
import LessonSubmitCard from "./LessonSubmitCard";
import type { NavigateFunction } from "react-router";


const lowlight = createLowlight(all);

export const LESSON_STORAGE_KEY = "LectureEditor_v01"
export const MARKDOWN_STORAGE_KEY = "Markdown_v01"

function getTiptapContentFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LESSON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : "여기에 강의를 작성하세요!"
  } catch {
    return "여기에 강의를 작성하세요!"
  }
}

function getMarkdownContentFromLocalStorage() {
  try {
    const raw = localStorage.getItem(MARKDOWN_STORAGE_KEY);
    return raw ? raw : PLACEHOLDER_MARKDOWN
  } catch {
    return PLACEHOLDER_MARKDOWN
  }
}

function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timeout = useMemo<{ id: number | null }>(() => ({ id: null }), [])
  return useCallback((...args: Parameters<T>) => {
    if (timeout.id) clearTimeout(timeout.id);
    timeout.id = window.setTimeout(() => fn(...args), delay)
  }, [fn, delay, timeout])
}

function handleMarkdownChange(isMarkdown: boolean, setIsMarkdown: React.Dispatch<SetStateAction<boolean>>, setMarkdown: React.Dispatch<SetStateAction<string>>, getEditorAsMarkdown: () => (string)) {
  modals.openConfirmModal({
    title: "Change Markdown Mode",
    children: (<>
      <Text>{isMarkdown ?
        "마크다운 모드를 해제하시겠습니까? 현재까지 작성된 마크다운은 사라집니다!"
        :
        "마크다운 모드로 전환하시겠습니까?"
      }</Text>
    </>),
    labels: { confirm: "전환", cancel: "취소" },
    onCancel: () => {
      modals.closeAll();
    },
    onConfirm: () => {
      if (!isMarkdown) setMarkdown(getEditorAsMarkdown());
      setIsMarkdown((v) => (!v));
      modals.closeAll();
    }
  })
}

function addImage(editor: Editor | null) {
  if (!editor) alert("Editor not configured!");
  // todo: add image
  const url = prompt('이미지 링크를 첨부하세요.')
  url
}

function addYoutubeVideo(editor: Editor | null) {
  if (!editor) return;

  const url = prompt('Enter Youtube URL')

  if (url) {
    editor.commands.setYoutubeVideo({
      src: url,
    })
  }
}

function getEditor(editor: Editor) {
  return (
    <RichTextEditor editor={editor} h="100%" w="100%"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignRight />
          <RichTextEditor.AlignJustify />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <ScrollArea w="100%" scrollbarSize={5}
        flex={1} style={{ minHeight: 0 }}>
        <RichTextEditor.Content />
      </ScrollArea>

    </RichTextEditor>
  )
}

function LessonEditorBody({ mode, setIsMarkdown, isMarkdown, markdown, setMarkdown, content, Shell, before, lessonId, title, subjectId, user, navigate }: { mode: "edit" | "create", setIsMarkdown: React.Dispatch<SetStateAction<boolean>>, isMarkdown: boolean, markdown: string, setMarkdown: React.Dispatch<SetStateAction<string>>, content: Lesson | null, Shell: ShellComponent, before: ReactNode, lessonId: string | undefined, subjectId: string, title: string, user: User | null, navigate: NavigateFunction }) {
  // persist through refresh: save 

  const debounceSave = useDebounce((json: any) => {
    try {
      localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(json));
    } catch (err) {
      console.log('Failed to save document', err);
    }
  }, 800);

  const debounceMarkdownSave = useDebounce((markdown: string) => {
    try {
      localStorage.setItem(MARKDOWN_STORAGE_KEY, markdown)
    } catch (err) {
      console.log('Failed to save markdown', err);
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
      Markdown,
      TableKit,
      Image,
      Highlight,
      Details.configure({
        persist: true,
      }),
      DetailsSummary,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      DetailsContent,
      Mathematics.configure({
        inlineOptions: {
          // d
        },
        blockOptions: {
          // d
        },
        katexOptions: {
          throwOnError: false,
        },

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
      }),
    ],
    // try to fetch from localStorage
    content: (content ? content.content : getTiptapContentFromLocalStorage()),
    onUpdate: ({ editor, transaction }) => {
      if (transaction.docChanged) debounceSave(editor.getJSON());
    },
    editable: true,
  })

  useEffect(() => {
    setMarkdown(getMarkdownContentFromLocalStorage());
    if (mode === "edit") {
      if (editor && content) {
        editor.commands.setContent(content.content, { contentType: 'json' })
      }
      setMarkdown(getEditorAsMarkdown());
    }
  }, [content]);

  const parseMarkdown = () => {
    if (!editor || !editor.markdown) {
      console.error('Editor or MarkdownManager not available')
      return
    }
    try {
      editor.commands.setContent(markdown, { contentType: 'markdown' })
    } catch (err) {
      console.error(err);
    }
  }

  const getEditorAsMarkdown = () => {
    if (!editor) return "";
    try {
      return editor.getMarkdown();
    } catch {
      return editor.getText();
    }
  }

  if (!user) return;

  return (
    <Shell>
      <Stack w="100%" h="100%" gap="sm">
        {before}

        <Group justify="space-between" w="100%">
          <Group gap="md">
            <Button onClick={() => handleMarkdownChange(isMarkdown, setIsMarkdown, setMarkdown, getEditorAsMarkdown)}>
              {isMarkdown ? "에디터 모드로" : "마크다운 모드로"}
            </Button>

            {isMarkdown ? <Button onClick={parseMarkdown}>마크다운 컴파일</Button> : <></>}
            {isMarkdown ?
              <Button onClick={() => {
                setMarkdown(getEditorAsMarkdown());
              }}>에디터를 마크다운으로</Button> : <></>}

            <Button onClick={() => addYoutubeVideo(editor)} >유튜브 영상 추가</Button>
            <Button onClick={() => addImage(editor)}>이미지 추가</Button>
          </Group>

          <LessonSubmitCard mode={mode} lessonId={lessonId} title={title} subjectId={subjectId}
            navigate={navigate} user={user} editor={editor} />
        </Group>


        {isMarkdown ?
          <Flex w="100%" gap="md" align="center" justify="center"
            flex={1} direction='row' style={{ minHeight: 0 }}>
            <Paper h="100%" w="50%" withBorder>
              <ScrollArea w="100%" h="100%" scrollbarSize={5} >
                <Textarea value={markdown} onChange={(event) => {
                  setMarkdown(event.currentTarget.value)
                  debounceMarkdownSave(event.currentTarget.value)
                }}
                  autosize minRows={20} variant="unstyled" />
              </ScrollArea>
            </Paper>
            <Divider orientation="vertical" />
            <Paper h="100%" w="50%">
              {getEditor(editor)}
            </Paper>
          </Flex>
          :
          <Flex w="100%" gap="md" align="center" justify="center"
            flex={1} direction='row' style={{ minHeight: 0 }}>
            <Paper h="100%" w="70%">
              {getEditor(editor)}
            </Paper>
          </Flex>

        }
      </Stack>
    </Shell>

  )
}

export default LessonEditorBody;