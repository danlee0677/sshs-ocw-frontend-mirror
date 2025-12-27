import { type ReactNode, useEffect } from "react";
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

import { useDebounce, LESSON_STORAGE_KEY, getContentFromLocalStorage } from "../libs/editorUtils";
import { Button, Flex, Group, ScrollArea, Stack, Space } from "@mantine/core";
import type { ShellComponent } from "../libs/types";


const lowlight = createLowlight(all);

function LessonBody({ editable, content, Shell, before, after }: { editable: boolean, content: object | null, Shell: ShellComponent, before: ReactNode, after: ReactNode }) {
	// persist through refresh: save 
	const debounceSave = useDebounce((json: any) => {
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
		content: editable ? (content ?? getContentFromLocalStorage()) : content,
		onUpdate: ({ editor, transaction }) => {
			if (!editable) return;
			if (transaction.docChanged) debounceSave(editor.getJSON());
		},
		editable: editable,
	})

	useEffect(() => {
		if (!editor) return;
		if (content == null) return;
		editor.commands.setContent(content as any, { emitUpdate: false });
	}, [content, editor]);

	return (
		<RichTextEditor editor={editor} >
			<Shell>
				<ScrollArea w="100%" h="100%" scrollbarSize={5} >
					<Flex h="100%" w="100%" justify="center">
						<Stack h="100%" w="700" align="stretch" gap={0}>
							{before}
							<Space h="md" />
							{editable ?
								<>
									<Group h="40%" gap="md" >
										<Button onClick={() => addYoutubeVideo(editor)} >Add Youtube Video</Button>
									</Group>
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
								</>
								: <></>}

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