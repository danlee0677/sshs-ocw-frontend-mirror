import { Form, useActionData, useNavigation } from "react-router";
import MainPageAppshell from "../appshell/MainPageAppshell";
import { useUserContext } from "../../root";

import React, { useMemo, useCallback, type SetStateAction, useEffect, useState, useRef } from "react";
import {
  Button, Group, Stack, Textarea, Text, Paper, Modal,
  Image as ImageComponent, Loader, ThemeIcon, TextInput, Box, Anchor, ActionIcon, Divider,
  Combobox, PillsInput, Pill, CheckIcon, useCombobox,
  ScrollArea,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useEditor } from '@tiptap/react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from '@tiptap/extension-mathematics';
import 'katex/dist/katex.min.css';
import Youtube from '@tiptap/extension-youtube';
import { Markdown } from '@tiptap/markdown';
import { TableKit } from '@tiptap/extension-table';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import TextAlign from '@tiptap/extension-text-align';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, all } from 'lowlight';
import 'highlight.js/styles/github-dark.css';
import { type Mentoring, type MentoringFile } from "../../libs/types";

import { uploadImage, PLACEHOLDER_MENTORING_MARKDOWN, PLACEHOLDER_MENTORING, useableTags } from "../../libs/utils";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
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

function handleMarkdownChange(
  isMarkdown: boolean,
  setIsMarkdown: React.Dispatch<SetStateAction<boolean>>,
  setMarkdown: React.Dispatch<SetStateAction<string>>,
  getEditorAsMarkdown: () => string,
) {
  modals.openConfirmModal({
    title: "Change Markdown Mode",
    children: (
      <Text>{isMarkdown
        ? "마크다운 모드를 해제하시겠습니까? 현재까지 작성된 마크다운은 사라집니다!"
        : "마크다운 모드로 전환하시겠습니까?"
      }</Text>
    ),
    labels: { confirm: "전환", cancel: "취소" },
    onCancel: () => { modals.closeAll(); },
    onConfirm: () => {
      if (!isMarkdown) setMarkdown(getEditorAsMarkdown());
      setIsMarkdown((v) => !v);
      modals.closeAll();
    },
  });
}

function EditorToolbar() {
  return (
    <RichTextEditor.Toolbar sticky stickyOffset={60}>
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
  );
}

interface MentoringEditorProps {
  mode: "edit" | "create";
  initialContent: Mentoring | null;
  tiptapCached: object;
  markdownCached: string;
  storageKey: string;
  markdownStorageKey: string;
  hasCached: boolean;
}

export default function MentoringEditor({
  mode, initialContent, tiptapCached, markdownCached, storageKey, markdownStorageKey, hasCached,
}: MentoringEditorProps) {
  const { user } = useUserContext();

  const [opened, { open, close }] = useDisclosure(false);
  const [youtubeOpened, { open: youtubeOpen, close: youtubeClose }] = useDisclosure(false);
  const [fileModalOpened, { open: openFileModal, close: closeFileModal }] = useDisclosure(false);

  const [file, setFile] = useState<File | null>(null);
  const [youtubeURL, setYoutubeURL] = useState<string>("");
  const [fileInput, setFileInput] = useState<string>("");
  const [fileNameInput, setFileNameInput] = useState<string>("");

  const [activeStep, setActiveStep] = useState<'select' | 'verify' | 'uploading' | 'success'>('select');
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const [lastActive, setLastActive] = useState<'tiptap' | 'markdown'>('tiptap');
  const markdownRef = useRef<HTMLTextAreaElement>(null);

  const [markdown, setMarkdown] = useState<string>(PLACEHOLDER_MENTORING_MARKDOWN);
  const [isMarkdown, setIsMarkdown] = useState<boolean>(true);
  const [cacheDecision, setCacheDecision] = useState<'pending' | 'done'>(hasCached ? 'pending' : 'done');

  const [imageUrl, setImageUrl] = useState<string>(initialContent?.image_url ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MentoringFile[]>(initialContent?.files ?? []);
  const [tags, setTags] = useState<string[]>(initialContent?.tags ?? []);
  const [createdBy, setCreatedBy] = useState<string[]>(() => initialContent?.createdBy ?? []);
  const [createdByInput, setCreatedByInput] = useState<string>("");
  const [createdByModalOpened, { open: openCreatedByModal, close: closeCreatedByModal }] = useDisclosure(false);
  const combobox = useCombobox();

  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  const debounceSave = useDebounce((json: any) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(json));
    } catch (err) {
      console.log('Failed to save document', err);
    }
  }, 800);

  const debounceMarkdownSave = useDebounce((md: string) => {
    try {
      localStorage.setItem(markdownStorageKey, md);
    } catch (err) {
      console.log('Failed to save markdown', err);
    }
  }, 800);

  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false }),
      Link,
      Markdown,
      TableKit,
      Image,
      Highlight,
      Details.configure({ persist: true }),
      DetailsSummary,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      DetailsContent,
      Mathematics.configure({
        inlineOptions: {},
        blockOptions: {},
        katexOptions: { throwOnError: false },
      }),
      Youtube.configure({
        width: 640, height: 360, controls: false, nocookie: true, allowFullscreen: true,
      }),
      CodeBlockLowlight.configure({
        lowlight, enableTabIndentation: true, tabSize: 4,
      }),
    ],
    content: initialContent ? initialContent.content : PLACEHOLDER_MENTORING.content,
    onUpdate: ({ editor, transaction }) => {
      if (transaction.docChanged) debounceSave(editor.getJSON());
    },
    editable: true,
    onFocus: () => setLastActive('tiptap'),
  });

  const parseMarkdown = () => {
    if (!editor || !editor.markdown) {
      console.error('Editor or MarkdownManager not available');
      return;
    }
    try {
      editor.commands.setContent(markdown, { contentType: 'markdown' });
    } catch (err) {
      console.error(err);
    }
  };

  const getEditorAsMarkdown = () => {
    try {
      return editor.getMarkdown();
    } catch {
      return editor.getText();
    }
  };

  const handleOpenModal = () => {
    setFile(null);
    setPreviewURL(null);
    setActiveStep('select');
    open();
  };

  const handleDrop = (dropped: Array<File>) => {
    const selected = dropped[0];
    setFile(selected);
    setPreviewURL(URL.createObjectURL(selected));
    setActiveStep('verify');
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setActiveStep('uploading');
      const url: string = await uploadImage(file);
      insertImage(url);
      setActiveStep('success');
    } catch (err) {
      console.log(err);
      setActiveStep('select');
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.currentTarget.files?.[0];
    if (!selected) return;
    e.currentTarget.value = "";
    setImageUploading(true);
    try {
      const url = await uploadImage(selected);
      setImageUrl(url);
    } catch {
      notifications.show({ color: "red", message: "이미지 업로드에 실패했습니다." });
    } finally {
      setImageUploading(false);
    }
  };

  const handleClose = () => {
    close();
    setTimeout(() => {
      setFile(null);
      setPreviewURL(null);
      setActiveStep('select');
    }, 2000);
  };

  const insertImage = (imageURL: string) => {
    if (lastActive === 'tiptap' && editor) {
      editor.chain().focus().setImage({ src: imageURL }).run();
    } else if (lastActive === 'markdown' && markdownRef.current) {
      const textarea = markdownRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const needNewLineBefore = start > 0 && text.charAt(start - 1) !== '\n';
      const needNewLineAfter = end < text.length && text.charAt(end) !== '\n';
      let insertText = `![Image](${imageURL})`;
      if (needNewLineBefore) insertText = '\n' + insertText;
      if (needNewLineAfter) insertText = insertText + '\n';
      setMarkdown(markdown.slice(0, start) + insertText + text.slice(end));
    }
  };

  const handleYoutubeOpen = () => {
    setYoutubeURL("");
    youtubeOpen();
  };

  const insertYoutube = (url: string) => {
    if (lastActive === 'tiptap' && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    } else if (lastActive === 'markdown' && markdownRef.current) {
      const textarea = markdownRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const needNewLineBefore = start > 0 && text.charAt(start - 1) !== '\n';
      const needNewLineAfter = end < text.length && text.charAt(end) !== '\n';
      let insertText = `:::youtube {src="${url}" width="640" height="360" start="0"} :::`;
      if (needNewLineBefore) insertText = '\n' + insertText;
      if (needNewLineAfter) insertText = insertText + '\n';
      setMarkdown(markdown.slice(0, start) + insertText + text.slice(end));
    } else {
      console.error("failed to insert youtube url: editor or markdownRef missing!");
    }
    youtubeClose();
  };

  const handleYoutubeClose = () => {
    setYoutubeURL("");
    youtubeClose();
  };

  const handleAddFile = () => {
    if (!fileInput.trim() || !fileNameInput.trim()) return;
    setFiles(prev => [...prev, { name: fileNameInput.trim(), url: fileInput.trim() }]);
    setFileInput("");
    setFileNameInput("");
    closeFileModal();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagSelect = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleTagRemove = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleAddCreatedBy = () => {
    const trimmed = createdByInput.trim();
    if (!trimmed || createdBy.includes(trimmed)) return;
    setCreatedBy(prev => [...prev, trimmed]);
    setCreatedByInput("");
    closeCreatedByModal();
  };

  const removeCreatedBy = (index: number) => {
    setCreatedBy(prev => prev.filter((_, i) => i !== index));
  };

  const renderSelectStep = () => (
    <Stack>
      <Dropzone
        onDrop={handleDrop}
        onReject={(f) => console.log('rejected files', f)}
        maxSize={3 * 1024 * 1024}
        accept={IMAGE_MIME_TYPE}
        h={200}
      >
        <Group justify="center" gap="xl" style={{ minHeight: 200 }}>
          <Dropzone.Accept><IconUpload size={50} stroke={1.5} color="var(--mantine-color-blue-6)" /></Dropzone.Accept>
          <Dropzone.Reject><IconX size={50} stroke={1.5} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
          <Dropzone.Idle><IconPhoto size={50} stroke={1.5} /></Dropzone.Idle>
          <div style={{ textAlign: 'center' }}>
            <Text size="xl" inline>이미지를 드래그하거나 클릭해서 선택하세요!</Text>
            <Text size="lg">(최대 3MB)</Text>
          </div>
        </Group>
      </Dropzone>
      <Button type="button" variant="subtle" color="gray" onClick={handleClose}>취소</Button>
    </Stack>
  );

  const renderVerifyStep = () => (
    <Stack>
      <Text size="sm" ta="center">업로드하려는 이미지가 맞는지 확인하세요</Text>
      <div style={{ position: 'relative', height: 250, width: '100%', background: '#f8f9fa', borderRadius: 8 }}>
        <ImageComponent src={previewURL} h={250} fit="contain" style={{ borderRadius: 8 }} />
      </div>
      <Group grow mt="md">
        <Button type="button" variant="default" onClick={() => setActiveStep('select')}>뒤로</Button>
        <Button type="button" onClick={handleUpload}>이미지 업로드</Button>
      </Group>
    </Stack>
  );

  const renderUploadStep = () => (
    <Stack align="center" justify="center" h={250}>
      <Loader size="xl" type="bars" />
      <Text c="dimmed" size="sm">Uploading to Cloudinary...</Text>
    </Stack>
  );

  const renderSuccessStep = () => (
    <Stack align="center" justify="center" h={250}>
      <ThemeIcon color="green" size={80} radius="100%">
        <IconCheck size={40} />
      </ThemeIcon>
      <Text fw={700} size="xl" mt="md">업로드가 완료되었습니다!</Text>
      <Button type="button" onClick={handleClose} mt="md">닫기</Button>
    </Stack>
  );

  const renderYoutubeInsertion = () => (
    <Stack align="stretch" justify="center" h="100%" w="100%" gap="md">
      <Text size="xl">업로드하려는 Youtube URL을 입력하세요!</Text>
      <TextInput value={youtubeURL} onChange={(e) => setYoutubeURL(e.currentTarget.value)} />
      <Button type="button" onClick={() => insertYoutube(youtubeURL)}>업로드</Button>
    </Stack>
  );

  if (!user) return null;

  return (
    <MainPageAppshell>
      <ScrollArea w="100%" h="100%">
        <Modal
          opened={cacheDecision === 'pending'}
          onClose={() => setCacheDecision('done')}
          title="저장된 초안이 있습니다"
          withCloseButton={false}
          closeOnClickOutside={false}
          centered
        >
          <Text>이전에 작성하던 초안을 불러오시겠습니까?</Text>
          <Group mt="md" justify="flex-end">
            <Button variant="default" onClick={() => {
              localStorage.removeItem(storageKey);
              localStorage.removeItem(markdownStorageKey);
              setCacheDecision('done');
            }}>새로 시작</Button>
            <Button disabled={!editor} onClick={() => {
              editor?.commands.setContent(tiptapCached as any, { emitUpdate: false });
              setMarkdown(markdownCached);
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
          closeOnClickOutside={activeStep !== 'uploading'}
          withCloseButton={activeStep !== 'uploading'}
        >
          {activeStep === 'select' && renderSelectStep()}
          {activeStep === 'verify' && renderVerifyStep()}
          {activeStep === 'uploading' && renderUploadStep()}
          {activeStep === 'success' && renderSuccessStep()}
        </Modal>

        <Modal opened={youtubeOpened} onClose={handleYoutubeClose} title="Upload Youtube" centered size="lg">
          {renderYoutubeInsertion()}
        </Modal>

        <Modal opened={createdByModalOpened} onClose={closeCreatedByModal} title="멘토 추가" centered>
          <Stack>
            <TextInput
              placeholder="사용자 ID"
              value={createdByInput}
              onChange={(e) => setCreatedByInput(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCreatedBy(); } }}
            />
            <Button
              onClick={handleAddCreatedBy}
              disabled={!createdByInput.trim() || createdBy.includes(createdByInput.trim())}
            >추가</Button>
          </Stack>
        </Modal>

        <Modal opened={fileModalOpened} onClose={closeFileModal} title="파일 링크 추가" centered>
          <Stack>
            <TextInput
              placeholder="파일 이름"
              value={fileNameInput}
              onChange={(e) => setFileNameInput(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFile(); } }}
            />
            <TextInput
              placeholder="Google Drive 파일 링크"
              value={fileInput}
              onChange={(e) => setFileInput(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFile(); } }}
            />
            <Button onClick={handleAddFile} disabled={!fileInput.trim() || !fileNameInput.trim()}>추가</Button>
          </Stack>
        </Modal>

        <input
          ref={imageFileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageFileUpload}
        />

        <Form method={mode === "create" ? "post" : "patch"} action="/action/mentoring/submit" style={{ width: '100%' }}>
          <Box
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              background: 'var(--mantine-color-body)',
              borderBottom: '1px solid var(--mantine-color-default-border)',
            }}
            p="sm"
          >
            <Group justify="space-between">
              <Group gap="sm">
                <Button type="button" onClick={() => handleMarkdownChange(isMarkdown, setIsMarkdown, setMarkdown, getEditorAsMarkdown)}>
                  {isMarkdown ? "에디터 모드로" : "마크다운 모드로"}
                </Button>
                {isMarkdown && <Button type="button" onClick={parseMarkdown}>마크다운 컴파일</Button>}
                {isMarkdown && (
                  <Button type="button" onClick={() => setMarkdown(getEditorAsMarkdown())}>에디터를 마크다운으로</Button>
                )}
                <Button type="button" onClick={handleYoutubeOpen}>유튜브 영상 추가</Button>
                <Button type="button" onClick={handleOpenModal}>이미지 추가</Button>
              </Group>
              <Button type="submit" loading={isSubmitting}>
                {mode === "create" ? "멘토링 생성" : "멘토링 수정"}
              </Button>
            </Group>
          </Box>

          <Stack p="md" gap="md">
            <input type="hidden" name="tiptapContent" value={editor ? JSON.stringify(editor.getJSON()) : ""} />
            <input type="hidden" name="mentoringId" value={initialContent?._id ?? ""} />
            <input type="hidden" name="files" value={JSON.stringify(files)} />
            <input type="hidden" name="createdBy" value={JSON.stringify(createdBy)} />
            <input type="hidden" name="tags" value={JSON.stringify(tags)} />

            {actionData?.error && <Text c="red" ta="center">{actionData.error}</Text>}

            <TextInput
              name="title"
              placeholder="멘토링 제목"
              required
              defaultValue={initialContent?.title ?? ""}
            />
            <TextInput
              name="image_url"
              placeholder="썸네일 이미지 URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.currentTarget.value)}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  loading={imageUploading}
                  onClick={() => imageFileInputRef.current?.click()}
                  title="이미지 업로드"
                  type="button"
                >
                  <IconUpload size={16} />
                </ActionIcon>
              }
            />
            <TextInput 
              name="registration"
              placeholder="신청 링크"
              required
              defaultValue={initialContent?.registration ?? ""}
            />
            <Textarea
              name="description"
              placeholder="멘토링 설명"
              autosize
              minRows={3}
              defaultValue={initialContent?.description ?? ""}
            />

            <Combobox store={combobox} onOptionSubmit={handleTagSelect}>
              <Combobox.DropdownTarget>
                <PillsInput label="태그" onClick={() => combobox.openDropdown()}>
                  <Pill.Group>
                    {tags.map(tag => (
                      <Pill key={tag} withRemoveButton onRemove={() => handleTagRemove(tag)}>{tag}</Pill>
                    ))}
                    <Combobox.EventsTarget>
                      <PillsInput.Field
                        placeholder={tags.length === 0 ? "태그 선택" : ""}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => combobox.closeDropdown()}
                        readOnly
                      />
                    </Combobox.EventsTarget>
                  </Pill.Group>
                </PillsInput>
              </Combobox.DropdownTarget>
              <Combobox.Dropdown>
                <Combobox.Options>
                  {useableTags.map(tag => (
                    <Combobox.Option value={tag} key={tag}>
                      <Group gap="sm">
                        {tags.includes(tag) && <CheckIcon size={12} />}
                        <span>{tag}</span>
                      </Group>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>

            {isMarkdown ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Paper withBorder style={{ flex: 1 }}>
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
                <Divider orientation="vertical" style={{ alignSelf: 'stretch' }} />
                <Paper withBorder style={{ flex: 1 }}>
                  <RichTextEditor editor={editor} style={{ minHeight: 400 }}>
                    <EditorToolbar />
                    <RichTextEditor.Content />
                  </RichTextEditor>
                </Paper>
              </div>
            ) : (
              <Paper withBorder>
                <RichTextEditor editor={editor} style={{ minHeight: 400 }}>
                  <EditorToolbar />
                  <RichTextEditor.Content />
                </RichTextEditor>
              </Paper>
            )}

            <Stack mt="xl">
              <Group justify="space-between">
                <Text fw={600} size="lg">멘토</Text>
                <Button variant="light" size="sm" type="button" onClick={openCreatedByModal}>멘토 추가</Button>
              </Group>
              {createdBy.length === 0 && <Text c="dimmed" size="sm">등록된 멘토가 없습니다.</Text>}
              {createdBy.map((id, i) => (
                <Group key={i} justify="space-between" gap="xs">
                  <Text size="sm">{id}</Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    type="button"
                    onClick={() => removeCreatedBy(i)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>

            <Stack mt="xl">
              <Group justify="space-between">
                <Text fw={600} size="lg">첨부 파일</Text>
                <Button variant="light" size="sm" type="button" onClick={openFileModal}>파일 추가</Button>
              </Group>
              {files.length === 0 && (
                <Text c="dimmed" size="sm">첨부된 파일이 없습니다.</Text>
              )}
              {files.map((file, i) => (
                <Group key={i} justify="space-between" gap="xs">
                  <Anchor
                    href={file.url}
                    target="_blank"
                    size="sm"
                    style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {file.name}
                  </Anchor>
                  <ActionIcon variant="subtle" color="red" type="button" onClick={() => removeFile(i)}>
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Form>
      </ScrollArea>
    </MainPageAppshell>
  );
}
