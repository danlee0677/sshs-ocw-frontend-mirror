import { useEffect, useState } from "react";
import { type NavigateFunction, useNavigate, useParams } from "react-router";
import { Button, Stack, TextInput, Flex, Title, Image, Group, Text, Loader, ThemeIcon, Modal, ScrollArea, Space, Box, PillsInput, Pill, Combobox, useCombobox, CheckIcon } from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import { http } from "../libs/http";
import { type OrderData, type Subject, subjectSchema, type User } from "../libs/types";
import { PLACEHOLDER_SUBJECT, uploadImage } from "../libs/utils";
import OrderTable from "./OrderTable";
import classes from "./subjectViewer.module.css"
import z from "zod";
import MainPageAppshell from "../main/MainPageAppshell";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconCheck, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useableTags } from "../libs/utils";

function handleSubjectEdit(navigate: NavigateFunction, subject: Subject, state: OrderData, tags: Array<string>) {
  http.patch(`${import.meta.env.VITE_API_URL}/api/subjects/${subject._id}`, {
    title: subject.title,
    image_url: subject.image_url,
    description: subject.description,
    likes: subject.likes,
    contents: state,
    tags: tags,
  }).then(() => {
    // todo: popup
    navigate(`/subject/${subject._id}`)
  }).catch((err) => {
    console.log(err);
  })
}

function handleSubjectCreate(navigate: NavigateFunction, subject: Subject, tags: Array<string>) {
  http.post(`${import.meta.env.VITE_API_URL}/api/subjects`, {
    title: subject.title,
    image_url: subject.image_url,
    description: subject.description,
    likes: 0,
    tags: tags,
  }).then((res) => {
    const parsed = z.object({ _id: z.string() }).safeParse(res.data);
    if (!parsed.success) throw new Error("Failed to fetch subject id");
    // todo: add popup(alert, Modals, etc)
    navigate(`/subject/${parsed.data._id}`);
  }).catch((err) => {
    console.log(err);
  })
}

function SubjectEditor({ mode, user, setUser }: { mode: "edit" | "create", user: User | null, setUser: React.Dispatch<User | null> }) {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT)
  const { subjectId } = useParams()
  const navigate = useNavigate();
  const [state, handlers] = useListState(subject.contents);

  // modal for image upload
  const [opened, { open, close }] = useDisclosure(false);
  const [file, setFile] = useState<File | null>(null);

  // for modal for uploading files
  const [activeStep, setActiveStep] = useState<'select' | 'verify' | 'uploading' | 'success'>('select');
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  // for tag selection
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  })
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (mode !== "edit") {
      setSubject((sub) => ({ ...sub, image_url: "https://res.cloudinary.com/dpcig7o5t/image/upload/v1767019358/base_study_o0o20v.png" }))
      return;
    }

    if (!subjectId) {
      console.log("No moduleId passed, ill-formed url");
      navigate("/");
    }

    http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`).then((res) => {
      const parsed = subjectSchema.safeParse(res.data)
      if (!parsed.success) throw new Error("Response fails to match type 'Subject'");

      if (parsed.data._id !== subjectId) throw new Error("Id does not match")

      setSubject(parsed.data);
      setTags(parsed.data.tags);
      handlers.setState(parsed.data.contents);
    }).catch((err) => {
      console.log(err);
    })
  }, [mode, subjectId, navigate])

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

      setSubject((subject) => ({ ...subject, image_url: url }));
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
    .map((item) => (
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
        maxSize={5 * 1024 * 1024}
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
            <Text size="lg">(최대 5MB, 정사각형 이미지를 권장합니다.)</Text>
          </div>
        </Group>
      </Dropzone>

      <Button variant="subtle" color="gray" onClick={handleClose}>
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
          h={250}
          fit="contain"
          style={{ borderRadius: 8 }}
        />
      </div>

      <Group grow mt="md">
        <Button variant="outline" onClick={() => setActiveStep('select')}>
          뒤로
        </Button>
        <Button variant="outline" onClick={handleUpload}>
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
      <Button variant="outline" onClick={handleClose} mt="md">
        닫기
      </Button>
    </Stack>
  );

  return (
    <ScrollArea h="100%" w="100%">
      <MainPageAppshell user={user} setUser={setUser} navigate={navigate}>
        <Box w="100%" h="100%" p="md">
          {
            mode === "edit" ? // edit
              <Flex w={'100%'} justify={'center'} gap={'md'}>
                <Stack w="30%" gap="xs" align="center">
                  <Image w={'160px'} src={subject.image_url}></Image>

                  <Button variant="outline" onClick={handleOpenModal}>대표 이미지 변경</Button>

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

                  <TextInput value={subject.title} placeholder="변경할 과목 제목을 입력하세요(예: 2025 고급프로그래밍 강좌)"
                    onChange={(e) => {
                      const val = e.currentTarget.value
                      setSubject((sub) => {
                        return { ...sub, title: val }
                      })
                    }} />
                  
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
                </Stack>
                <Stack w={'50%'} h={'100%'} gap={0} align="center">
                  <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>

                  <OrderTable state={state} handlers={handlers} navigate={navigate} subjectId={subject._id} />

                  <Group>
                    <Button variant="outline" onClick={() => navigate(`/lesson/create?subjectId=${subjectId}`)} >새 강의 생성</Button>
                    <Button variant="outline" onClick={() => handleSubjectEdit(navigate, subject, state, tags)}>과목 수정</Button>
                  </Group>
                  <Space h="sm" />
                </Stack>
              </Flex>
              : // create
              <Flex w="100%" h="100%" justify="center">
                <Stack gap="md" w="50%">
                  <Title order={3}>과목 이름 입력</Title>
                  <TextInput placeholder="과목 이름을 입력하세요(예: 일반물리학)"
                    value={subject.title ?? ""}
                    onChange={(e) => {
                      const v = e.currentTarget?.value ?? "";
                      setSubject((sub) => ({ ...sub, title: v }))
                    }} />
                  <TextInput placeholder="간단한 과목 설명을 입력하세요"
                    value={subject.description ?? ""}
                    onChange={(e) => {
                      const v = e.currentTarget?.value ?? "";
                      setSubject((sub) => ({ ...sub, description: v }))
                    }} />
                  
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

                  <Button onClick={() => handleSubjectCreate(navigate, subject, tags)}>과목 생성</Button>
                  <Space h="sm" />
                </Stack>
              </Flex>
          }
        </Box>
      </MainPageAppshell>
    </ScrollArea>
  )
}

export default SubjectEditor;