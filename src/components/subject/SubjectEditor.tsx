import { useEffect, useState } from "react";
import { Button, Stack, TextInput, Container, Grid, Title, Image, Group, Text, Loader, ThemeIcon, Modal, ScrollArea, Space, PillsInput, Pill, Combobox, useCombobox, CheckIcon, Switch, Textarea } from "@mantine/core";
import { useDisclosure, useListState, useMediaQuery } from "@mantine/hooks";
import { MOBILE_QUERY, TAP_TARGET, TOUCH_QUERY } from "../../libs/styles";
import { type Subject } from "../../libs/types";
import { isUser, PLACEHOLDER_SUBJECT, uploadImage, useableTags } from "../../libs/utils";
import OrderTable from "./OrderTable";
import shared from "../../styles/shared.module.css"
import page from "./subject.module.css"

// Shared page chrome plus this component's own rules. Page keys win on collision.
const classes = { ...shared, ...page }
import MainPageAppshell from "../appshell/MainPageAppshell";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconCheck, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { Form, Link, useActionData, useNavigate, useNavigation } from "react-router";
import { useUserContext } from "../../libs/useUserContext";

interface SubjectEditorProps {
  mode: "edit" | "create";
  initialContent: Subject | null;
  userRole?: 'admin' | 'owner' | 'editor' | null;
}

function SubjectEditor({ mode, initialContent, userRole }: SubjectEditorProps) {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  const [state, handlers] = useListState(initialContent?.contents || []);

  // modal for image upload
  const [opened, { open, close }] = useDisclosure(false);
  const [file, setFile] = useState<File | null>(null);

  // for complex states
  const [tags, setTags] = useState<string[]>(initialContent?.tags || []);
  const [imageUrl, setImageUrl] = useState<string>(initialContent?.image_url || "");

  // for modal for uploading files
  const [activeStep, setActiveStep] = useState<'select' | 'verify' | 'uploading' | 'success'>('select');
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  /*
   * `fullScreen` on Modal is a plain boolean — NOT a responsive prop object,
   * and `size` is not responsive either, so a phone-only full-screen modal
   * cannot be expressed in CSS from here. This is the "JS must compute a value
   * from width" row of the decision rule in src/libs/styles.ts: it computes a
   * size, it does not decide whether a control exists.
   *
   * `getInitialValueInEffect: false` reads matchMedia synchronously on first
   * render, so the modal does not open windowed and snap to full-screen. Safe
   * below root.tsx — this is a SPA and nothing here is in the prerendered shell.
   */
  const isPhone = useMediaQuery(MOBILE_QUERY, false, { getInitialValueInEffect: false });

  /*
   * `undefined` on a mouse, 44 on a finger — see TOUCH_QUERY. A bare `mih={tapMin}`
   * forced every button 8px past Mantine's 36px default on every device, which
   * reads as a heavy, oversized button with a mouse. The floor is about
   * fingertips, so gate it on the pointer rather than applying it always.
   */
  const tapMin = useMediaQuery(TOUCH_QUERY, false, { getInitialValueInEffect: false })
    ? TAP_TARGET
    : undefined;

  // for tag selection
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  })

  // garbage collector
  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    }
  }, [previewURL]);

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

      setImageUrl(url);
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

  const handleValueSelect = (val: string) =>
    setTags((cur) =>
      cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]
    );

  const handleValueRemove = (val: string) =>
    setTags((cur) => cur.filter((v) => v !== val));

  const displayTags = tags.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ))

  const options = useableTags
    .map((item: string) => (
      <Combobox.Option value={item} key={item} active={tags.includes(item)}>
        <Group gap="sm">
          {tags.includes(item) ? <CheckIcon size={12} /> : null}
          <span>{item}</span>
        </Group>
      </Combobox.Option>
    ))

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
            * No `color` prop on either icon — deliberately.
            *
            * Mantine's Dropzone already sets `color` on its own root in the
            * accept and reject states (`--dropzone-accept-color` /
            * `--dropzone-reject-color`, resolved through variantColorResolver
            * at the default `variant="light"`), and those follow the color
            * scheme. Tabler icons stroke in `currentColor`, so inheriting is
            * both correct per scheme and correct if `acceptColor`/`variant`
            * ever change.
            *
            * The old `var(--mantine-color-blue-6)` / `red-6` were tokens, so
            * the Color contract's literal grep passed them — but a numbered
            * shade does not step with the scheme the way primaryShade
            * { light: 6, dark: 4 } makes every other accent step. Same defect
            * Prompt 16 found on IconFile, except here the props were also
            * overriding a value Mantine had already got right.
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
            <Text size="lg">(최대 3MB, 정사각형 이미지를 권장합니다.)</Text>
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
        <Image
          src={previewURL}
          h={250} fit="contain"
          style={{ borderRadius: 8 }}
        />
      </div>

      <Group grow mt="md">
        <Button type="button" variant="outline" onClick={() => setActiveStep('select')}>
          뒤로
        </Button>
        <Button type="button" variant="outline" onClick={handleUpload}>
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
      <Button type="button" variant="outline" onClick={handleClose} mt="md">
        닫기
      </Button>
    </Stack>
  );

  if (mode === "edit" && !initialContent) throw new Error("Failed to fetch subject");

  if (!isUser(user)) return null;

  return (
    /*
     * The ScrollArea goes INSIDE MainPageAppshell. It used to wrap it, and that
     * was a real defect, not a style preference: AppShell.Main is
     * `height: 100dvh; overflow: hidden`, so with the only scroller outside the
     * shell nothing inside Main could scroll — a subject with more lessons than
     * fit the viewport had its list simply unreachable. The outer ScrollArea did
     * not save it either: this app renders straight into <body> (Layout emits
     * <html><body>, there is no #root), and body carries only
     * `min-height: 100dvh`, so that ScrollArea's own `h="100%"` resolved to
     * `auto` and it never scrolled.
     *
     * This is the scroll-container invariant under Definition of done: exactly
     * one page-level ScrollArea, directly wrapping the page content, inside
     * Main. Counting <ScrollArea> tokens per file cannot catch the inverted
     * case — which is why this page was recorded as compliant.
     *
     * `showFooter={false}` is what keeps that true. The shell now owns the page
     * scroller for the eleven ordinary routes so it can put AppFooter inside it;
     * the editors opt out and keep the ScrollArea below. Dropping the prop would
     * nest this one inside the shell's — two scrollbars, and a site footer on a
     * full-screen editing surface.
     *
     * The <Container> below is the page cap; see the comment on it.
     */
    <MainPageAppshell showFooter={false}>
      <ScrollArea h="100%" w="100%">
        <Form action="/action/subject/submit" method={mode === "edit" ? "patch" : "post"}>
          {/* This USED TO BE an uncapped `<Box w="100%" p="md">`, documented as a
              deliberate exception to Definition of done item 5 on the grounds that
              an authoring surface should run full width. That was REVERSED, and
              the reason is worth keeping so it does not get restored from history:
              this page mirrors SubjectViewer — same two columns, same content, and
              you switch between them with the pencil button — but the viewer is
              capped at 1200 and this was not, so the pair jumped in width and
              position on every toggle. Worse, the columns summed to 30% + 50% =
              80% of an UNCAPPED viewport with no `justify`, so all 20% of the
              slack fell on the right and the block sat visibly left of centre;
              at 1920 it ran 1888px wide.

              Bare <Container>, no `size`: root.tsx defaults it to
              CONTENT_MAX_WIDTH (1200) plus px='md'. `size="lg"` would silently
              mean 1140. `py`, not `p` — the Container's own px supplies the
              horizontal half and `p` would double it to 32. No `h="100%"`:
              nothing above has a definite height, so it resolved to `auto`.

              This wraps BOTH branches. The only effect on create mode is above a
              1232px viewport, where its column goes 600 -> 584 as `maw={600}`
              stops being the binding constraint; below that the container width
              and the old Box content width are both `viewport - 32`, so nothing
              moves. */}
          <Container w="100%" py="md">
            {/* hidden inputs */}
            <input type="hidden" name="subjectId" value={initialContent?._id || ""} />
            <input type="hidden" name="imageUrl" value={imageUrl} />
            {state.map((lesson) => <input type="hidden" name="contents" value={JSON.stringify(lesson)} key={`hidden-${lesson._id}`} />)}
            {tags.map((tag) => <input type="hidden" name="tags" value={tag} key={`hidden-${tag}`} />)}

            {
              mode === "edit" && initialContent ? // edit
                /* The error moved OUT of the columns. As a direct child of a row
                   flex container it rendered as a third COLUMN beside the two
                   content columns rather than as a message above them, stealing
                   horizontal space from both exactly when the submit had
                   failed. */
                <Stack w="100%" gap="md">
                  {actionData?.error && (
                    <Text c="red" ta="center" fw="bold">{actionData.error}</Text>
                  )}
                  {/* Grid, not the Flex that used to be here — the SAME 4/8 split
                      SubjectViewer uses, so toggling between the viewer and this
                      editor does not move the columns. The Flex carried hand-tuned
                      `md: '30%'` and `md: '50%'` widths, which sum to 80% and stop
                      summing again whenever the gap changes; Grid owns the gutter
                      math, so 4 + 8 = 12 is the whole row by construction and there
                      is no leftover slack to bias the pair leftwards. `span: 12`
                      replaces the responsive `direction` — at 320px the old 30/50
                      split gave the left column 96px.

                      `align="flex-start"` preserves the Flex's `md: 'flex-start'`:
                      without it Grid stretches both columns to the taller one,
                      dragging the image column's controls down. Same fix Defect A
                      needed on SubjectViewer. */}
                  <Grid gutter="md" w="100%" align="flex-start">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                  {/* `align` stays STRETCH. It is what makes the buttons and every
                      input span the column, and flipping it to `center` to centre
                      the two items below would collapse the TextInput, Textarea and
                      PillsInput to their content width. The image and the switch
                      are centred individually instead. */}
                  <Stack w="100%" gap="xs" align="stretch">
                    {/* `mx="auto"`: Mantine's Image is display:block with an explicit
                        width here, so auto inline margins split the free space.
                        Stretch cannot reach it — it has a fixed `w` — which is why
                        it used to pin to the column's left edge. */}
                    <Image mx="auto" w={{ base: 120, sm: 160 }} src={imageUrl || PLACEHOLDER_SUBJECT.image_url}></Image>
                    {/* Plain string `justify`, not a responsive object: Group rejects
                        those (Flex accepts them). Centred at every width is intended. */}
                    { user.roles.includes('admin') && <Group justify="center">
                        <Switch defaultChecked={initialContent?.teacher_certified || false} name="teacher_certified" />
                        <Text>Teacher Certified</Text>
                      </Group>}
                    {(userRole === 'admin' || userRole === 'owner') && (
                      <Button type="button" component={Link} variant="outline" mih={tapMin} to={`/subject/${initialContent._id}/access`}>
                        권한 관리
                      </Button>
                    )}
                    <Button type="button" variant="outline" mih={tapMin} onClick={handleOpenModal}>대표 이미지 변경</Button>

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

                    <TextInput defaultValue={initialContent.title} placeholder="변경할 과목 제목을 입력하세요(예: 2025 고급프로그래밍 강좌)"
                      name="title" required />
                    <Textarea placeholder="과목 설명을 수정하세요" defaultValue={initialContent.description}
                      name="description" required autosize />

                    <Combobox store={combobox} onOptionSubmit={handleValueSelect} >
                      <Combobox.DropdownTarget>
                        <PillsInput onClick={() => combobox.openDropdown()}>
                          <Pill.Group>
                            {displayTags}

                            <Combobox.EventsTarget>
                              <PillsInput.Field
                                onFocus={() => combobox.openDropdown()}
                                onBlur={() => combobox.closeDropdown()}
                                onChange={() => {
                                  combobox.updateSelectedOptionIndex();
                                }}
                                placeholder="태그를 선택하세요"
                              />
                            </Combobox.EventsTarget>
                          </Pill.Group>
                        </PillsInput>
                      </Combobox.DropdownTarget>

                      <Combobox.Dropdown>
                        <Combobox.Options>
                          {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Stack>
                  </Grid.Col>

                  {/* `h="100%"` dropped: the parent no longer has a definite
                      height, so a percentage height resolved to `auto` anyway —
                      it read as a constraint that did not exist. */}
                  <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack w="100%" gap={0} align="center">
                    <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>

                    <OrderTable state={state} handlers={handlers} navigate={navigate} subjectId={initialContent._id} />

                    <Group w="100%" justify="center" wrap="wrap">
                      <Button type="button" component={Link} variant="outline" mih={tapMin} w={{ base: '100%', xs: 'auto' }} to={`/lesson/create?subjectId=${initialContent._id}`} >새 강의 생성</Button>
                      <Button loading={isSubmitting} type="submit" variant="outline" mih={tapMin} w={{ base: '100%', xs: 'auto' }} >과목 수정</Button>
                    </Group>
                    <Space h="sm" />
                  </Stack>
                  </Grid.Col>
                  </Grid>
                </Stack>
                : // create
                /* Create mode was not addressed by any prompt. Same error-as-a-
                   flex-column bug, and `w="50%"` of an uncapped viewport meant
                   160px of title field at 320px and 960px at 1920. */
                <Stack w="100%" gap="md" align="center">
                  {actionData?.error && (
                    <Text c="red" ta="center" fw="bold">{actionData.error}</Text>
                  )}
                  <Stack gap="md" w={{ base: '100%', sm: '80%', md: '50%' }} maw={600} >
                    <input type="hidden" value="false" name="teacher_certified" readOnly/>
                    <Title order={3}>과목 이름 입력</Title>
                    <TextInput placeholder="과목 이름을 입력하세요(예: 일반물리학)"
                      defaultValue="" name="title" required />
                    <Title order={3}>과목 설명 입력</Title>
                    <Textarea
                      classNames={{ input: classes.DescriptionInput }}
                      placeholder="간단한 과목 설명을 입력하세요"
                      defaultValue="" name="description" required autosize/>

                    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
                      <Combobox.DropdownTarget>
                        <PillsInput onClick={() => combobox.openDropdown()}>
                          <Pill.Group>
                            {displayTags}

                            <Combobox.EventsTarget>
                              <PillsInput.Field
                                onFocus={() => combobox.openDropdown()}
                                onBlur={() => combobox.closeDropdown()}
                                onChange={() => {
                                  combobox.updateSelectedOptionIndex();
                                }}
                                placeholder="태그를 선택하세요"
                              />
                            </Combobox.EventsTarget>
                          </Pill.Group>
                        </PillsInput>
                      </Combobox.DropdownTarget>

                      <Combobox.Dropdown>
                        <Combobox.Options>
                          {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>

                    <Button type="submit" loading={isSubmitting} mih={tapMin} >과목 생성</Button>
                    <Space h="sm" />
                  </Stack>
                </Stack>
            }
          </Container>
        </Form>
      </ScrollArea>
    </MainPageAppshell>
  )
}

export default SubjectEditor;