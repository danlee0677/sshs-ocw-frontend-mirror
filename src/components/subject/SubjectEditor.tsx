import { useEffect, useState } from "react";
import { Button, Stack, TextInput, Flex, Title, Image, Group, Text, Loader, ThemeIcon, Modal, ScrollArea, Space, Box, PillsInput, Pill, Combobox, useCombobox, CheckIcon, Switch } from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import { type Subject } from "../../libs/types";
import { isUser, PLACEHOLDER_SUBJECT, uploadImage, useableTags } from "../../libs/utils";
import OrderTable from "./OrderTable";
import classes from "./subject.module.css"
import MainPageAppshell from "../appshell/MainPageAppshell";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconCheck, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { Form, Link, useActionData, useNavigate, useNavigation } from "react-router";
import { useUserContext } from "../../root";

interface SubjectEditorProps {
  mode: "edit" | "create";
  initialContent: Subject | null;
}

function SubjectEditor({ mode, initialContent }: SubjectEditorProps) {
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
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>(initialContent?.image_url || "");

  // for modal for uploading files
  const [activeStep, setActiveStep] = useState<'select' | 'verify' | 'uploading' | 'success'>('select');
  const [previewURL, setPreviewURL] = useState<string | null>(null);

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
      <div style={{ position: 'relative', height: 250, width: '100%', background: '#f8f9fa', borderRadius: 8 }}>
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
    <ScrollArea h="100%" w="100%">
      <MainPageAppshell>
        <Form action="/action/subject/submit" method={mode === "edit" ? "patch" : "post"}>
          <Box w="100%" h="100%" p="md">
            {/* hidden inputs */}
            <input type="hidden" name="subjectId" value={initialContent?._id || ""} />
            <input type="hidden" name="imageUrl" value={imageUrl} />
            {state.map((lesson) => <input type="hidden" name="contents" value={JSON.stringify(lesson)} key={`hidden-${lesson._id}`} />)}
            {tags.map((tag) => <input type="hidden" name="tags" value={tag} key={`hidden-${tag}`} />)}

            {
              mode === "edit" && initialContent ? // edit
                <Flex w={'100%'} justify={'center'} gap={'md'}>
                  {actionData?.error && (
                    <Text c="red" ta="center" fw="bold" mb="sm">{actionData.error}</Text>
                  )}
                  <Stack w="30%" gap="xs" align="center">
                    <Image w={'160px'} src={imageUrl || PLACEHOLDER_SUBJECT.image_url}></Image>
                    { user.roles.includes('admin') && <Group>
                        <Switch defaultChecked={initialContent?.teacher_certified || false} name="teacher_certified" required />
                        <Text>Teacher Certified</Text>
                      </Group>}
                    <Button type="button" variant="outline" onClick={handleOpenModal}>대표 이미지 변경</Button>

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

                    <TextInput defaultValue={initialContent.title} placeholder="변경할 과목 제목을 입력하세요(예: 2025 고급프로그래밍 강좌)"
                      name="title" required />
                    <TextInput placeholder="과목 설명을 수정하세요" defaultValue={initialContent.description}
                      name="description" required />

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
                  <Stack w={'50%'} h={'100%'} gap={0} align="center">
                    <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>

                    <OrderTable state={state} handlers={handlers} navigate={navigate} subjectId={initialContent._id} />

                    <Group>
                      <Button type="button" component={Link} variant="outline" to={`/lesson/create?subjectId=${initialContent._id}`} >새 강의 생성</Button>
                      <Button loading={isSubmitting} type="submit" variant="outline" >과목 수정</Button>
                    </Group>
                    <Space h="sm" />
                  </Stack>
                </Flex>
                : // create
                <Flex w="100%" h="100%" justify="center">
                  {actionData?.error && (
                    <Text c="red" ta="center" fw="bold" mb="sm">{actionData.error}</Text>
                  )}
                  <Stack gap="md" w="50%">
                    <input type="hidden" checked={false} name="teacher_certified" readOnly/>
                    <Title order={3}>과목 이름 입력</Title>
                    <TextInput placeholder="과목 이름을 입력하세요(예: 일반물리학)"
                      defaultValue="" name="title" required />
                    <TextInput placeholder="간단한 과목 설명을 입력하세요"
                      defaultValue="" name="description" required />

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

                    <Button type="submit" loading={isSubmitting} >과목 생성</Button>
                    <Space h="sm" />
                  </Stack>
                </Flex>
            }
          </Box>
        </Form>
      </MainPageAppshell>
    </ScrollArea>
  )
}

export default SubjectEditor;