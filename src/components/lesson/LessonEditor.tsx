import { Form, useActionData, useNavigation } from "react-router";
import MainPageAppshell from "../appshell/MainPageAppshell";
import { useUserContext } from "../../root";

import React, { useMemo, useCallback, type SetStateAction, useEffect, useState, useRef } from "react";
import { Button, Group, ScrollArea, Stack, Textarea, Text, Flex, Divider, Paper, Modal, Image as ImageComponent, Loader, ThemeIcon, TextInput, Switch } from "@mantine/core";
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
import { type Lesson } from "../../libs/types";

import { LESSON_STORAGE_KEY, MARKDOWN_STORAGE_KEY, uploadImage } from "../../libs/utils";
import { useDisclosure } from "@mantine/hooks";
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconCheck, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";


const lowlight = createLowlight(all);

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

interface LessonEditorProps {
  mode: "edit" | "create";
  initialContent: Lesson | null;
  tiptapCached: object;
  markdownCached: string;
  subjectId: string;
}

export default function LessonEditor({ mode, initialContent, tiptapCached, markdownCached, subjectId }: LessonEditorProps) {
  const { user } = useUserContext();

  // modal for image upload
  const [opened, { open, close }] = useDisclosure(false);
  const [youtubeOpened, { open: youtubeOpen, close: youtubeClose }] = useDisclosure(false);
  const [file, setFile] = useState<File | null>(null);
  const [youtubeURL, setYoutubeURL] = useState<string>("");

  // for modal for uploading files
  const [activeStep, setActiveStep] = useState<'select' | 'verify' | 'uploading' | 'success'>('select');
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  // for inserting image
  const [lastActive, setLastActive] = useState<'tiptap' | 'markdown'>('tiptap');
  const markdownRef = useRef<HTMLTextAreaElement>(null);

  const [markdown, setMarkdown] = useState<string>(markdownCached);
  const [isMarkdown, setIsMarkdown] = useState<boolean>(true);

  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

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

  // garbage collector
  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    }
  }, [previewURL]);

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
    content: (initialContent ? initialContent.content : tiptapCached),
    onUpdate: ({ editor, transaction }) => {
      if (transaction.docChanged) debounceSave(editor.getJSON());
    },
    editable: true,
    onFocus: () => setLastActive('tiptap'),
  })

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
    try {
      return editor.getMarkdown();
    } catch {
      return editor.getText();
    }
  }

  // for image uploads
  const handleOpenModal = () => {
    setFile(null);
    setPreviewURL(null);
    setActiveStep('select');
    open();
  }

  const handleDrop = (files: Array<File>) => {
    const selected = files[0];
    setFile(selected);
    setPreviewURL(URL.createObjectURL(selected));
    setActiveStep('verify');
  }

  const handleUpload = async () => {
    if (!file) return;

    try {
      setActiveStep('uploading')
      const url: string = await uploadImage(file);

      insertImage(url);
      setActiveStep('success');
    } catch (err) {
      console.log(err);
      setActiveStep('select');
    }
  }

  const handleClose = () => {
    close();

    setTimeout(() => {
      setFile(null);
      setPreviewURL(null);
      setActiveStep('select');
    }, 2000);
  }

  const insertImage = (imageURL: string) => {
    if (lastActive === 'tiptap' && editor) {
      editor.chain().focus().setImage({ src: imageURL }).run();
    } else if (lastActive === 'markdown' && markdownRef.current) {
      const textarea = markdownRef.current;

      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      const charBefore = text.charAt(start - 1);
      const needNewLineBefore = start > 0 && charBefore !== '\n';

      const charAfter = text.charAt(end);
      const needNewLineAfter = end < text.length && charAfter !== '\n';

      let insertText = `![Image](${imageURL})`

      if (needNewLineBefore)
        insertText = '\n' + insertText;

      if (needNewLineAfter)
        insertText = insertText + '\n';

      const newText = markdown.slice(0, start) + insertText + text.slice(end);
      setMarkdown(newText);
    }
  }

  const handleYoutubeOpen = () => {
    setYoutubeURL("");
    youtubeOpen();
  }

  const insertYoutube = (youtubeURL: string) => {
    if (lastActive === 'tiptap' && editor) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeURL }).run();
    } else if (lastActive === 'markdown' && markdownRef.current) {
      const textarea = markdownRef.current;

      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      const charBefore = text.charAt(start - 1);
      const needNewLineBefore = start > 0 && charBefore !== '\n';

      const charAfter = text.charAt(end);
      const needNewLineAfter = end < text.length && charAfter !== '\n';

      let insertText = `:::youtube {src="${youtubeURL}" width="640" height="360" start="0"} :::`

      if (needNewLineBefore)
        insertText = '\n' + insertText;

      if (needNewLineAfter)
        insertText = insertText + '\n';

      const newText = markdown.slice(0, start) + insertText + text.slice(end);
      setMarkdown(newText);
    } else {
      console.error("failed to insert youtube url: editor or markdownRef missing!")
    }
    youtubeClose();
  }

  const handleYoutubeClose = () => {
    setYoutubeURL("");
    youtubeClose();
  }

  const renderSelectStep = () => (
    <Stack>
      <Dropzone
        onDrop={handleDrop}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={3 * 1024 * 1024}
        accept={IMAGE_MIME_TYPE}
        h={200}
      >
        <Group justify="center" gap="xl" style={{ minHeight: 200 }} >
          <Dropzone.Accept>
            <IconUpload size={50} stroke={1.5} color="var(--mantine-color-blue-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={50} stroke={1.5} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={50} stroke={1.5} />
          </Dropzone.Idle>

          <div style={{ textAlign: 'center' }} >
            <Text size="xl" inline>
              이미지를 드래그하거나 클릭해서 선택하세요!
            </Text>
            <Text size="lg">(최대 3MB)</Text>
          </div>
        </Group>
      </Dropzone>

      <Button type="button" variant="subtle" color="gray" onClick={handleClose}>
        취소
      </Button>
    </Stack>
  )

  const renderVerifyStep = () => (
    <Stack>
      <Text size="sm" ta="center">업로드하려는 이미지가 맞는지 확인하세요</Text>
      <div style={{ position: 'relative', height: 250, width: '100%', background: '#f8f9fa', borderRadius: 8 }}>
        <ImageComponent
          src={previewURL}
          h={250}
          fit="contain"
          style={{ borderRadius: 8 }}
        />
      </div>

      <Group grow mt="md">
        <Button type="button" variant="default" onClick={() => setActiveStep('select')}>
          뒤로
        </Button>
        <Button type="button" onClick={handleUpload}>
          이미지 업로드
        </Button>
      </Group>
    </Stack>
  )

  const renderUploadStep = () => (
    <Stack align="center" justify="center" h={250}>
      <Loader size="xl" type="bars" />
      <Text c="dimmed" size="sm">Uploading to Cloudinary...</Text>
    </Stack>
  )

  const renderSuccessStep = () => (
    <Stack align="center" justify="center" h={250}>
      <ThemeIcon color="green" size={80} radius="100%">
        <IconCheck size={40} />
      </ThemeIcon>
      <Text fw={700} size="xl" mt="md">업로드가 완료되었습니다!</Text>
      <Button type="button" onClick={handleClose} mt="md">
        닫기
      </Button>
    </Stack>
  );

  const renderYoutubeInsertion = () => (
    <Stack align="stretch" justify="center" h="100%" w="100%" gap="md">
      <Text size="xl">업로드하려는 Youtube URL을 입력하세요!</Text>
      <TextInput value={youtubeURL}
        onChange={(e) => setYoutubeURL(e.currentTarget.value)} />
      <Button type="button" onClick={() => insertYoutube(youtubeURL)}>업로드</Button>
    </Stack>
  )

  if (!user) return null;

  return (
    <MainPageAppshell>
      <Form method={mode === "create" ? "post" : "patch"} style={{ width: '100%', height: '100%' }}
        action="/action/lesson/submit">
        <Stack w="100%" h="100%" gap="sm" p="md">
          { /* hidden inputs for form submission */}
          <input type="hidden" name="tiptapContent" value={editor ? JSON.stringify(editor.getJSON()) : ""} />
          <input type="hidden" name="subjectId" value={subjectId} />
          <input type="hidden" name="userId" value={user._id} />
          <input type="hidden" name="lessonId" value={initialContent?._id || ""} />

          {actionData?.error && (<Text c="red" ta="center">{actionData.error}</Text>)}

          <TextInput name="title" defaultValue={initialContent?.title || ""}
            placeholder="강좌 제목을 입력하세요" required />

          <Group justify="space-between" w="100%">
            <Group gap="md">
              <Button type="button" onClick={() => handleMarkdownChange(isMarkdown, setIsMarkdown, setMarkdown, getEditorAsMarkdown)}>
                {isMarkdown ? "에디터 모드로" : "마크다운 모드로"}
              </Button>

              {isMarkdown ? <Button type="button" onClick={parseMarkdown}>마크다운 컴파일</Button> : <></>}
              {isMarkdown ?
                <Button type="button" onClick={() => {
                  setMarkdown(getEditorAsMarkdown());
                }}>에디터를 마크다운으로</Button> : <></>}

              <Button type="button" onClick={handleYoutubeOpen} >유튜브 영상 추가</Button>
              <Button type="button" onClick={handleOpenModal}>이미지 추가</Button>
              <Group>
                <Switch name="studentOnly" defaultChecked={initialContent?.student_only || false} />
                <Text>설곽 학생만 열람 제한</Text>
              </Group>
            </Group>

            <Modal
              opened={opened}
              onClose={handleClose}
              title="Upload Image"
              centered
              size="lg"
              closeOnClickOutside={activeStep !== 'uploading'}
              withCloseButton={activeStep !== 'uploading'}
            >
              {activeStep === 'select' && renderSelectStep()}
              {activeStep === 'verify' && renderVerifyStep()}
              {activeStep === 'uploading' && renderUploadStep()}
              {activeStep === 'success' && renderSuccessStep()}
            </Modal>

            <Modal
              opened={youtubeOpened}
              onClose={handleYoutubeClose}
              title="Upload Youtube"
              centered
              size="lg"
            >
              {renderYoutubeInsertion()}
            </Modal>

            <Button type="submit" loading={isSubmitting}>
              {mode === "create" ? "강의 생성" : "강의 수정"}
            </Button>
          </Group>


          {isMarkdown ?
            <Flex w="100%" gap="md" align="center" justify="center"
              flex={1} direction='row' style={{ minHeight: 0 }}>
              <Paper h="100%" w="50%" withBorder>
                <ScrollArea w="100%" h="100%" scrollbarSize={5} >
                  <Textarea ref={markdownRef} value={markdown} onChange={(event) => {
                    setMarkdown(event.currentTarget.value)
                    debounceMarkdownSave(event.currentTarget.value)
                  }}
                    onFocus={() => setLastActive('markdown')}
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
      </Form>
    </MainPageAppshell>

  )
}