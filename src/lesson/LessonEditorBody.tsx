import { type ReactNode, useEffect, useMemo, useCallback, type SetStateAction } from "react";
import { useEditor } from '@tiptap/react'
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
import { addYoutubeVideo } from "../libs/editorUtils";
// todo: subscript/superscript
// todo: useMemo for optimizing editor?

// code highlight imports
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// load all language: change if necessary
import { createLowlight, all } from 'lowlight'
import 'highlight.js/styles/github-dark.css' // todo: change when dark mode
import { Button, Group, ScrollArea, Stack, Textarea } from "@mantine/core";
import type { ShellComponent } from "../libs/types";


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
    return raw ? raw : "여기에 강의를 작성하세요!"
  } catch {
    return "여기에 강의를 작성하세요!"
  }
}

function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timeout = useMemo<{ id: number | null }>(() => ({id: null}), [])
  return useCallback((...args: Parameters<T>) => {
    if (timeout.id) clearTimeout(timeout.id);
    timeout.id = window.setTimeout(() => fn(...args), delay)
  }, [fn, delay, timeout])
}

function getEditor() {
  return (
    <>
      <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
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
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </>
  )
}

function LessonEditorBody({ isMarkdown, markdown, setMarkdown, content, Shell, before, after }: { isMarkdown: boolean, markdown: string, setMarkdown: React.Dispatch<SetStateAction<string>>, content: object | null, Shell: ShellComponent, before: ReactNode, after: ReactNode }) {
	// persist through refresh: save 

	const debounceSave = useDebounce((json: any) => {
		try {
			localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(json));
      localStorage.setItem(MARKDOWN_STORAGE_KEY, markdown);
		} catch (err) {
			console.log('Failed to save document', err);
		}
	}, 800);

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
		content: (content ?? getTiptapContentFromLocalStorage()),
		onUpdate: ({ editor, transaction }) => {
			if (transaction.docChanged) debounceSave(editor.getJSON());
		},
		editable: true,
	})

	useEffect(() => {
		if (!editor) return;
		if (content == null) return;
		editor.commands.setContent(content as any, { emitUpdate: false });
    setMarkdown(getMarkdownContentFromLocalStorage());
	}, [content, editor]);

	return (
		<RichTextEditor editor={editor} >
			<Shell>
        <Stack w="100%" h="100%" gap="md">
          {before}

          <Group h="40%" gap="md" >
            <Button onClick={() => addYoutubeVideo(editor)} >Add Youtube Video</Button>
            {/* 클릭으로 markdown 전환 */}
          </Group>

          {isMarkdown ? 
            <Group h="100%" w="100%">
              <ScrollArea w="50%" h="100%" scrollbarSize={5} >  
                <Textarea onChange={(event) => setMarkdown(event.currentTarget.value)}
                autosize minRows={20}/>
              </ScrollArea>
              <ScrollArea w="50%" h="100%" scrollbarSize={5}>
                {getEditor()}
              </ScrollArea>
            </Group>
          : 
            <ScrollArea w="50%" h="100%" scrollbarSize={5}>
              {getEditor()}
            </ScrollArea>
          }
          {after}
        </Stack>
			</Shell>
		</RichTextEditor>
	)
}

export default LessonEditorBody;