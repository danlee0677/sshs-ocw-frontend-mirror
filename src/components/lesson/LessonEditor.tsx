import { Form, useActionData, useNavigation } from "react-router";
import MainPageAppshell from "../appshell/MainPageAppshell";
import { useUserContext } from "../../libs/useUserContext";

import React, { type SetStateAction, useEffect, useState, useRef } from "react";
import { Button, Group, ScrollArea, Stack, Textarea, Text, Divider, Paper, Modal, Image as ImageComponent, Loader, ThemeIcon, TextInput, Switch, Box, Flex } from "@mantine/core";
import { modals } from "@mantine/modals";
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
import TextAlign from '@tiptap/extension-text-align'
// todo: subscript/superscript
// todo: useMemo for optimizing editor?

// code highlight imports
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// load all language: change if necessary
import { createLowlight, all } from 'lowlight'
// Replaces `highlight.js/styles/github-dark.css`. Shared with the two viewers
// and MentoringEditor — see the header of proseMirror.css.
import '../../styles/proseMirror.css'
import { type Lesson } from "../../libs/types";

import { uploadImage, PLACEHOLDER_MARKDOWN, PLACEHOLDER_LESSON } from "../../libs/utils";
import { useDebounce } from "../../libs/useDebounce";
import type { JSONContent } from "@tiptap/core";
import { MOBILE_QUERY, TAP_TARGET, TOUCH_QUERY } from "../../libs/styles";
import { useDisclosure, useElementSize, useMediaQuery } from "@mantine/hooks";
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconCheck, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";


const lowlight = createLowlight(all);

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

/**
 * `stickyOffset` is MEASURED, not a constant. Read this before changing it.
 *
 * Two sticky elements share one scroll container (the page ScrollArea viewport
 * inside AppShell.Main): the editor's own action bar at `top: 0; z-index: 100`,
 * and this toolbar at `top: var(--rte-sticky-offset, 0px); z-index: 1`. For the
 * toolbar to pin below the bar, the offset must equal the bar's rendered height.
 *
 * It was `stickyOffset="var(--docs-header-height)"` — a variable copied from
 * Mantine's own docs site that is defined nowhere in this app. An undefined
 * var() makes the custom property guaranteed-invalid, so `top:` fell through to
 * its `0px` fallback, and at z-index 1 against the bar's 100 the toolbar did not
 * merely sit wrong: it slid completely UNDERNEATH the bar and disappeared while
 * scrolling.
 *
 * HEADER_HEIGHT is NOT the fix, even though it looks like one. AppShell.Header
 * is `position: fixed` and Mantine already gives AppShell.Main
 * `padding-top: var(--app-shell-header-offset)`, so the scroll container's top
 * edge is already clear of the app header. 56px would push the toolbar 56px
 * below where it belongs. (MentoringEditor shipped a hand-measured `60`, which
 * is right to within the 1px border — do not "correct" that one to 56 either.)
 *
 * A constant cannot be right at every width regardless: the action bar holds a
 * Group of six-plus controls that WRAPS, so its height is 61px on a desktop and
 * ~240px on a 360px phone. `stickyOffset` takes a number or a string, never a
 * responsive object. Hence useElementSize on the bar — it reports
 * `borderBoxSize[0].blockSize`, so the `p="sm"` padding and the 1px
 * `borderBottom` are already included and no arithmetic is needed.
 */
function EditorToolbar({ stickyOffset }: { stickyOffset: number }) {
  return (
    <RichTextEditor.Toolbar sticky stickyOffset={stickyOffset}>
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
  )
}

type LessonMetaCache = { title?: string; studentOnly?: boolean };

interface LessonEditorProps {
  mode: "edit" | "create";
  initialContent: Lesson | null;
  tiptapCached: JSONContent;
  markdownCached: string;
  metaCached: LessonMetaCache | null;
  subjectId: string;
  storageKey: string;
  markdownStorageKey: string;
  metaStorageKey: string;
  hasCached: boolean;
}

export default function LessonEditor({ mode, initialContent, tiptapCached, markdownCached, metaCached, subjectId, storageKey, markdownStorageKey, metaStorageKey, hasCached }: LessonEditorProps) {
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

  const [markdown, setMarkdown] = useState<string>(PLACEHOLDER_MARKDOWN);
  const [isMarkdown, setIsMarkdown] = useState<boolean>(true);
  const [cacheDecision, setCacheDecision] = useState<'pending' | 'done'>(hasCached ? 'pending' : 'done');

  const [title, setTitle] = useState<string>(initialContent?.title ?? "");
  const [studentOnly, setStudentOnly] = useState<boolean>(initialContent?.student_only ?? false);

  /*
   * Measures the sticky action bar so the editor toolbar can pin directly
   * beneath it at every width — see the comment on EditorToolbar. The `|| 60`
   * covers the single frame before the ResizeObserver first fires; 60 is the
   * one-row desktop height, so the pre-measurement state is the correct
   * desktop state rather than 0.
   */
  const { ref: barRef, height: barHeight } = useElementSize();

  /*
   * Modal `fullScreen` is a plain boolean and `size` is not responsive either,
   * so a phone-only full-screen modal cannot be expressed in CSS from here.
   * This is the "JS must compute a value from width" row of the decision rule
   * in src/libs/styles.ts — a size, not a control's existence.
   */
  const isPhone = useMediaQuery(MOBILE_QUERY, false, { getInitialValueInEffect: false });

  /*
   * `undefined` on a mouse, 44 on a finger — see TOUCH_QUERY. The action bar
   * below applies this instead of a bare `mih={tapMin}`, which made every button
   * 8px taller than Mantine's 36px default on every device. In a bar that wraps
   * that is 8px PER ROW of pure padding, which is what made it look heavy.
   *
   * Not a width query: a 360px-wide desktop window is still a mouse and does
   * not want the floor, while a 1024px tablet does. `pointer` is the property
   * that actually describes the thing the rule is about.
   */
  const tapMin = useMediaQuery(TOUCH_QUERY, false, { getInitialValueInEffect: false })
    ? TAP_TARGET
    : undefined;

  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  /*
   * persist through refresh: save
   *
   * `isSubmitting` guards every write. Unmount cleanup alone does not close the
   * race: the action clears the keys only after its `await http.post` resolves,
   * so a timer armed by a keystroke shortly before the click can come due AFTER
   * the delete but BEFORE the redirect unmounts anything. Blocking writes for
   * the whole in-flight window closes that.
   *
   * Deliberately not a one-way latch. A rejected submit returns `{ error }`
   * instead of redirecting, and the author stays on the page with their work
   * intact — `navigation.state` goes back to idle and autosave has to resume,
   * or the recovery draft silently stops tracking exactly when it is most
   * likely to be needed.
   */
  const debounceSave = useDebounce((json: JSONContent) => {
    if (isSubmitting) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(json));
    } catch (err) {
      console.log('Failed to save document', err);
    }
  }, 800);

  const debounceMarkdownSave = useDebounce((markdown: string) => {
    if (isSubmitting) return;
    try {
      localStorage.setItem(markdownStorageKey, markdown)
    } catch (err) {
      console.log('Failed to save markdown', err);
    }
  }, 800)

  const debounceMetaSave = useDebounce((meta: LessonMetaCache) => {
    if (isSubmitting) return;
    try {
      localStorage.setItem(metaStorageKey, JSON.stringify(meta));
    } catch (err) {
      console.log('Failed to save meta', err);
    }
  }, 800);

  useEffect(() => {
    if (cacheDecision === 'pending') return;
    debounceMetaSave({ title, studentOnly });
  }, [title, studentOnly, cacheDecision, debounceMetaSave]);

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
    content: (initialContent ? initialContent.content : PLACEHOLDER_LESSON.content),
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
    if (!editor) return "";
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
      {/* `mih`, not the previous `h={200}`: a hard height plus the caption and
          the 취소 button overflows the modal on a landscape phone. */}
      <Dropzone
        onDrop={handleDrop}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={3 * 1024 * 1024}
        accept={IMAGE_MIME_TYPE}
        mih={{ base: 120, sm: 200 }}
      >
        <Group justify="center" gap="xl" mih={{ base: 120, sm: 200 }} >
          {/*
            * No `color` prop on either icon — deliberately. Mantine's Dropzone
            * already sets `color` on its own root in the accept and reject
            * states (`--dropzone-accept-color` / `--dropzone-reject-color`,
            * resolved through variantColorResolver at the default
            * `variant="light"`), and those follow the color scheme. Tabler
            * icons stroke in `currentColor`, so inheriting is correct per
            * scheme AND stays correct if `acceptColor`/`variant` ever change.
            *
            * The old `var(--mantine-color-blue-6)` / `red-6` were tokens, so the
            * Color contract's literal grep passed them — but a numbered shade
            * does not step with the scheme the way primaryShade
            * { light: 6, dark: 4 } makes every other accent step, and these two
            * were overriding a value Mantine had already got right.
            */}
          <Dropzone.Accept>
            <IconUpload size={50} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={50} stroke={1.5} />
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
      {/* was `background: '#f8f9fa'` — gray-0, so a light slab behind the preview in
          dark mode. A CSS variable, not light-dark(): light-dark() is a PostCSS
          transform and never runs on an inline style, but `--mantine-color-default-hover`
          is already resolved per scheme (gray-0 light / dark-5 dark) and is legal here. */}
      <div style={{ position: 'relative', height: 250, width: '100%', background: 'var(--mantine-color-default-hover)', borderRadius: 8 }}>
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
    /* No <Container> cap, deliberately — an exception to Definition of done item
       5 rather than an oversight. This is an authoring surface: the sticky action
       bar spans the full width, so capping only the content detaches the bar from
       what it acts on, and the markdown/preview split is the one place in the app
       where extra width is functional rather than decorative (1200 would leave
       each pane ~590px on a 1920 screen). Recorded so Prompt 24 does not "fix" it. */
    <MainPageAppshell>
      <ScrollArea w="100%" h="100%">
        <Modal
          opened={cacheDecision === 'pending'}
          onClose={() => setCacheDecision('done')}
          title="저장된 초안이 있습니다"
          withCloseButton={false}
          closeOnClickOutside={false}
          centered
          fullScreen={isPhone}
        >
          <Text>이전에 작성하던 초안을 불러오시겠습니까?</Text>
          <Group mt="md" justify="flex-end">
            <Button variant="default" onClick={() => {
              localStorage.removeItem(storageKey);
              localStorage.removeItem(markdownStorageKey);
              localStorage.removeItem(metaStorageKey);
              setTitle(initialContent?.title ?? "");
              setStudentOnly(initialContent?.student_only ?? false);
              setCacheDecision('done');
            }}>새로 시작</Button>
            <Button disabled={!editor} onClick={() => {
              editor?.commands.setContent(tiptapCached, { emitUpdate: false });
              setMarkdown(markdownCached);
              if (metaCached) {
                if (metaCached.title !== undefined) setTitle(metaCached.title);
                if (metaCached.studentOnly !== undefined) setStudentOnly(metaCached.studentOnly);
              }
              setCacheDecision('done');
            }}>불러오기</Button>
          </Group>
        </Modal>

        <Modal
          opened={opened}
          onClose={handleClose}
          title="Upload Image"
          centered
          size="lg"
          fullScreen={isPhone}
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
          fullScreen={isPhone}
        >
          {renderYoutubeInsertion()}
        </Modal>

        {/* `height: '100%'` dropped from the Form: its parent is the ScrollArea's
            content wrapper, which is `display: table; min-width: 100%` and has no
            definite height, so a percentage height resolved to `auto` anyway.
            MentoringEditor's Form already omitted it. */}
        <Form method={mode === "create" ? "post" : "patch"} style={{ width: '100%' }}
          action="/action/lesson/submit">
          {/* The action bar is deliberately allowed to WRAP rather than scroll
              horizontally or hide controls behind a Menu — Prompt 19's own rule
              is "do NOT hide controls; a tablet author needs them." On a 360px
              phone that means roughly four rows, which is scrolled past once.
              Its height is measured (barRef) so the editor toolbar below can pin
              beneath it whatever the width; see EditorToolbar. */}
          <Box
            ref={barRef}
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              background: 'var(--mantine-color-body)',
              borderBottom: '1px solid var(--mantine-color-default-border)',
            }}
            p="sm"
          >
            <Group justify="space-between" w="100%" wrap="wrap" gap="sm">
              {/* Full width below `sm` so the submit button drops onto its own
                  row instead of being squeezed against the right edge. */}
              <Group gap="md" wrap="wrap" w={{ base: '100%', sm: 'auto' }}>
                <Button type="button" mih={tapMin} onClick={() => handleMarkdownChange(isMarkdown, setIsMarkdown, setMarkdown, getEditorAsMarkdown)}>
                  {isMarkdown ? "에디터 모드로" : "마크다운 모드로"}
                </Button>

                {isMarkdown ? <Button type="button" mih={tapMin} onClick={parseMarkdown}>마크다운 컴파일</Button> : <></>}
                {isMarkdown ?
                  <Button type="button" mih={tapMin} onClick={() => {
                    setMarkdown(getEditorAsMarkdown());
                  }}>에디터를 마크다운으로</Button> : <></>}

                <Button type="button" mih={tapMin} onClick={handleYoutubeOpen} >유튜브 영상 추가</Button>
                <Button type="button" mih={tapMin} onClick={handleOpenModal}>이미지 추가</Button>
                <Group mih={tapMin} wrap="nowrap">
                  <Switch name="studentOnly" checked={studentOnly} onChange={(e) => setStudentOnly(e.currentTarget.checked)} />
                  <Text>설곽 학생만 열람 제한</Text>
                </Group>
              </Group>
              <Button type="submit" mih={tapMin} w={{ base: '100%', sm: 'auto' }} loading={isSubmitting}>
                {mode === "create" ? "강의 생성" : "강의 수정"}
              </Button>
            </Group>
          </Box>
          <Stack gap="md" p="md">
            { /* hidden inputs for form submission */}
            <input type="hidden" name="tiptapContent" value={editor ? JSON.stringify(editor.getJSON()) : ""} />
            <input type="hidden" name="subjectId" value={subjectId} />
            <input type="hidden" name="userId" value={user._id} />
            <input type="hidden" name="lessonId" value={initialContent?._id || ""} />

            {actionData?.error && (<Text c="red" ta="center">{actionData.error}</Text>)}

            <TextInput name="title" value={title} onChange={(e) => setTitle(e.currentTarget.value)}
              placeholder="강좌 제목을 입력하세요" required />

            {isMarkdown ? (
              /* Was a raw `display: flex` div that never stacked: at 360px the two
                 `flex: 1` panes got ~172px each, which is unusable for both writing
                 and previewing. Stacks below `md`, side by side from `md` up. */
              <Flex direction={{ base: 'column', md: 'row' }} gap="md" align="flex-start" w="100%">
                <Paper withBorder style={{ flex: 1 }} w="100%">
                  <Textarea
                    ref={markdownRef}
                    value={markdown}
                    onChange={(e) => {
                      setMarkdown(e.currentTarget.value);
                      debounceMarkdownSave(e.currentTarget.value);
                    }}
                    onFocus={() => setLastActive('markdown')}
                    autosize
                    minRows={20}
                    variant="unstyled"
                  />
                </Paper>
                {/* `orientation` is not a responsive prop, and a vertical rule inside
                    a column flex collapses to zero width. Both panes are
                    `Paper withBorder`, so stacked they are already separated. */}
                <Divider orientation="vertical" visibleFrom="md" style={{ alignSelf: 'stretch' }} />
                <Paper withBorder style={{ flex: 1 }} w="100%">
                  <RichTextEditor editor={editor} style={{ minHeight: 400 }}>
                    <EditorToolbar stickyOffset={barHeight || 60} />
                    <RichTextEditor.Content />
                  </RichTextEditor>
                </Paper>
              </Flex>
            ) : (
              <Paper withBorder>
                <RichTextEditor editor={editor} style={{ minHeight: 400 }}>
                  <EditorToolbar stickyOffset={barHeight || 60} />
                  <RichTextEditor.Content />
                </RichTextEditor>
              </Paper>)
            }
          </Stack>
        </Form>
      </ScrollArea>
    </MainPageAppshell>

  )
}