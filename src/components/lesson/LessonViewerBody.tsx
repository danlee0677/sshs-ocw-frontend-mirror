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
import TextAlign from '@tiptap/extension-text-align';
// todo: subscript/superscript
// todo: useMemo for optimizing editor?

// code highlight imports
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// load all language: change if necessary
import { createLowlight, all } from 'lowlight'
// Replaces `highlight.js/styles/github-dark.css`, which was applied
// unconditionally in both schemes. See the header of proseMirror.css.
import '../../styles/proseMirror.css'
import { Flex, ScrollArea, Stack, Space, Title } from "@mantine/core";
import LessonViewerAppshell from "../appshell/LessonViewerAppshell";
import type { Lesson, RecentView, Subject } from "../../libs/types";
import LessonViewerNavigateCard from "./LessonViewerNavigateCard";


const lowlight = createLowlight(all);

interface LessonViewerProps {
  lesson: Lesson;
  subject: Subject;
  progress: Array<RecentView>
}

function LessonViewerBody({ lesson, subject, progress }: LessonViewerProps) {
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
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: lesson.content,
    editable: false,
  }, [lesson._id])

  return (
    <LessonViewerAppshell subject={subject} lesson={lesson} progress={progress}>
      <ScrollArea w="100%" h="100%" scrollbarSize={10} >
        <RichTextEditor editor={editor} >
          <Flex h="100%" w="100%" justify="center">
            {/* was a flat w="70%": 252px of readable width on a 360px phone,
                about twelve Korean characters per line */}
            <Stack w={{ base: '100%', sm: '90%', lg: '70%' }} px={{ base: 'md', sm: 'lg' }} justify='center'>
              <Space h="sm" />

              <Stack gap="md" w="100%">
                <LessonViewerNavigateCard subject={subject} lesson={lesson} />
                <Title order={1} fz={{ base: 'h3', sm: 'h1' }}>{lesson.title}</Title>
                <Flex w="100%" justify="flex-end">
                  <Title order={4}>{lesson.createdBy}</Title>
                </Flex>
              </Stack>
              <Space h="md" />

              <RichTextEditor.Content />

              <Space h="md" />
            </Stack>
          </Flex>
        </RichTextEditor>
      </ScrollArea>
    </LessonViewerAppshell>
  )
}

export default LessonViewerBody;