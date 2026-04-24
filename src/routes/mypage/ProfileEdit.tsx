import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, redirect, type LoaderFunctionArgs } from "react-router";
import { Avatar, Button, Group, Image, Loader, Modal, Paper, ScrollArea, Stack, Text, Textarea, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconCheck, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { http } from "../../libs/http";
import { userSchema } from "../../libs/types";
import { uploadImage } from "../../libs/utils";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const pageUserId = params.pageUserId;
  if (!pageUserId) throw new Response("Cannot find user id", { status: 404 });

  const verifyRes = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`);

  const verifyParsed = userSchema.safeParse(verifyRes.data);
  if (!verifyParsed.success || verifyParsed.data._id !== pageUserId) {
    throw redirect(`/profile/${pageUserId}`);
  }

  return { pageUser: verifyParsed.data, pageUserId };
}

export default function ProfileEdit() {
  const { pageUser, pageUserId } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  const [opened, { open, close }] = useDisclosure(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'select' | 'verify' | 'uploading' | 'success'>('select');

  const [pfpUrl, setPfpUrl] = useState<string>(pageUser.pfp_url);
  const [description, setDescription] = useState<string>(pageUser.description ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  const handleOpenModal = () => {
    setFile(null);
    setPreviewURL(null);
    setActiveStep('select');
    open();
  };

  const handleDrop = (files: File[]) => {
    const selected = files[0];
    setFile(selected);
    setPreviewURL(URL.createObjectURL(selected));
    setActiveStep('verify');
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setActiveStep('uploading');
      const url = await uploadImage(file);
      setPfpUrl(url);
      setActiveStep('success');
    } catch {
      setActiveStep('select');
    }
  };

  const handleClose = () => {
    close();
    setTimeout(() => {
      setFile(null);
      setPreviewURL(null);
      setActiveStep('select');
    }, 200);
  };

  const wordCount = description.length
  const overLimit = wordCount > 100;

  const handleSubmit = async () => {
    setSubmitting(true);
    await http.patch(`${import.meta.env.VITE_API_URL}/api/user`, {
      description,
      pfp_url: pfpUrl,
    }).then(() => {
      notifications.show({
        title: "프로필 저장 완료",
        message: "프로필이 업데이트되었습니다.",
        position: "bottom-center",
        color: "green",
      });
      navigate(`/profile/${pageUserId}`);
    }).catch((err) => {
      const msg = err.response?.data?.errors[0]
      console.log(err, err.status, err.config, err.message)
      const errorMap: Record<string, string> = {
        DescriptionLengthLimit: "소개글이 너무 깁니다. 100자 이하로 작성해주세요.",
        DescriptionContainsUrl: "소개글에 URL을 포함할 수 없습니다.",
        PfpUrlInvalid: "프로필 이미지 URL이 유효하지 않습니다.",
      };
      notifications.show({
        title: "저장 실패",
        message: (msg && errorMap[msg]) ?? "오류가 발생했습니다. 다시 시도해주세요.",
        position: "bottom-center",
        color: "red",
      });
    }).finally(() => {
      setSubmitting(false);
    })
  };

  const renderSelectStep = () => (
    <Stack>
      <Dropzone
        onDrop={handleDrop}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={1 * 1024 * 1024}
        accept={IMAGE_MIME_TYPE}
        h={200}
      >
        <Group justify="center" gap="xl" style={{ minHeight: 200 }}>
          <Dropzone.Accept>
            <IconUpload size={50} stroke={1.5} color="var(--mantine-color-blue-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={50} stroke={1.5} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={50} stroke={1.5} />
          </Dropzone.Idle>
          <div style={{ textAlign: 'center' }}>
            <Text size="xl" inline>이미지를 드래그하거나 클릭해서 선택하세요!</Text>
            <Text size="lg">(최대 1MB)</Text>
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
        <Image src={previewURL} h={250} fit="contain" style={{ borderRadius: 8 }} />
      </div>
      <Group grow mt="md">
        <Button type="button" variant="outline" onClick={() => setActiveStep('select')}>뒤로</Button>
        <Button type="button" variant="outline" onClick={handleUpload}>이미지 업로드</Button>
      </Group>
    </Stack>
  );

  const renderUploadingStep = () => (
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
      <Button type="button" variant="outline" onClick={handleClose} mt="md">닫기</Button>
    </Stack>
  );

  return (
    <MainPageAppshell>
      <ScrollArea h="100%" w="100%">
        <Stack align="center" py="xl">
          <Paper withBorder p="xl" w="100%" maw={500}>
            <Stack align="center" gap="md">
              <Avatar src={pfpUrl} size={120} radius="100%" />
              <Button type="button" variant="outline" onClick={handleOpenModal}>
                프로필 사진 변경
              </Button>

              <Modal
                opened={opened}
                onClose={handleClose}
                title="프로필 사진 업로드"
                centered
                size="lg"
                closeOnClickOutside={activeStep !== 'uploading'}
                withCloseButton={activeStep !== 'uploading'}
              >
                {activeStep === 'select' && renderSelectStep()}
                {activeStep === 'verify' && renderVerifyStep()}
                {activeStep === 'uploading' && renderUploadingStep()}
                {activeStep === 'success' && renderSuccessStep()}
              </Modal>

              <Textarea
                label="소개글"
                placeholder="프로필 소개를 작성해보세요!"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                autosize
                minRows={3}
                maxRows={8}
                w="100%"
                description={
                  <Text size="xs" c={overLimit ? "red" : "dimmed"}>{wordCount} / 100 자</Text>
                }
              />

              <Group w="100%" justify="flex-end">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/profile/${pageUserId}`)}
                  disabled={submitting}
                >
                  취소
                </Button>
                <Button onClick={handleSubmit} loading={submitting} disabled={overLimit}>
                  저장
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </ScrollArea>
    </MainPageAppshell>
  );
}
