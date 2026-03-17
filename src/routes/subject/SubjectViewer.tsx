import { useState } from "react";
import { Link, useFetcher, useLoaderData, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { Box, Stack, Title, UnstyledButton, Flex, Text, Image, Pagination, Space, Pill, Group } from "@mantine/core";
import { IconHeart, IconPencilPlus } from "@tabler/icons-react";
import { http } from "../../libs/http";
import { permissionCheckSchema, subjectSchema, type Subject, type User } from "../../libs/types";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import classes from "./subjectViewer.module.css"
import { useUserContext } from "../../root";
import { isUser } from "../../libs/utils";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  try {
    const [subjectRes, permissionRes] = await Promise.all([
      http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${params.subjectId}`),
      http.get(`${import.meta.env.VITE_API_URL}/api/permission/check/${params.subjectId}`).catch(() => null),
    ]);

    const parsed = subjectSchema.safeParse(subjectRes.data);
    if (!parsed.success) throw new Error("Failed to parse subject from server");

    const permissionParsed = permissionRes ? permissionCheckSchema.safeParse(permissionRes.data) : null;
    const canEdit = permissionParsed?.success ? permissionParsed.data.canEdit : false;

    return { subject: parsed.data, canEdit };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw err;
  }
}

export async function clientAction({ params }: ActionFunctionArgs) {
  try {
    const res = await http.post(`${import.meta.env.VITE_API_URL}/api/subjects/${params.subjectId}/like`);
    return res.data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to like subject" };
  }
}

const PLACEHOLDER_LESSON_IN_SUBJECT = {
  _id: "",
  title: "",
}

interface LessonInSubject {
  _id: string,
  title: string,
}

export default function SubjectViewer() {
  const { subject, canEdit } = useLoaderData<typeof clientLoader>();
  const { user } = useUserContext();

  return (
    <MainPageAppshell>
      <SubjectContent subject={subject} user={user} canEdit={canEdit} key={subject._id} />
    </MainPageAppshell>
  )
}

function SubjectContent({ subject, user, canEdit }: { subject: Subject; user: User | null; canEdit: boolean }) {
  const navigate = useNavigate();

  const fetcher = useFetcher();
  const isLiking = fetcher.state !== "idle";

  const [page, setPage] = useState<number>(1);

  const serverLiked = (isUser(user) && user.liked_subject.includes(subject._id));

  const [localLiked, setLocalLiked] = useState(serverLiked);

  const onClickLike = async () => {
    if (!user) return navigate("/login");

    setLocalLiked(!localLiked);

    fetcher.submit({}, { method: "post" });
  };

  const pageNum = 5

  const padArray = (array: Array<LessonInSubject>): Array<LessonInSubject> => {
    const copy = [...array]
    if (copy.length % pageNum !== 0) {
      const originalLength = copy.length
      copy.length = copy.length + (pageNum - copy.length % pageNum);
      copy.fill(PLACEHOLDER_LESSON_IN_SUBJECT, originalLength);
    }
    return copy;
  }

  const paddedLessons = padArray(subject.contents);

  return (
    <Flex w={'100%'} justify={'center'} gap={'md'}>
      <Flex w={'30%'} align={'center'}> {/* Subject Details */}
        <Stack w={'80%'} align="center" gap={'xs'} className={classes.Border} mt={'30px'}>
          <Image mt={'lg'} w={'160px'} src={subject.image_url} className={classes.SubjectImage}></Image>
          <Group gap={'xs'}>
            <Title order={1} className={classes.JalnanGothic}>{subject.title}</Title>
            {canEdit &&
              <UnstyledButton component={Link} to={`/subject/${subject._id}/edit`}>
                <IconPencilPlus></IconPencilPlus>
              </UnstyledButton>}
          </Group>
          <Text w={'80%'} mih={'100px'} className={classes.Paperozi}>{subject.description}</Text>
          {subject.teacher_certified && (
            <Pill bg="green" c="white" size="md">Teacher-certified</Pill>
          )}
          <Group gap={1} w={'80%'} align={'center'} justify={'center'}>
            {subject.tags.map((tag) => (<Pill mb={'2px'} renderRoot={(props) => <Link to={`/search?tags=${tag}`} {...props}></Link>} key={tag}>{tag}</Pill>))}
          </Group>
          <Group>
            <UnstyledButton onClick={onClickLike} disabled={isLiking}>
              <IconHeart
                color="red"
                fill={localLiked ? "red" : "none"}></IconHeart>
            </UnstyledButton>
            <Text>{subject.likes}</Text>
          </Group>
        </Stack>
      </Flex>

      <Stack w={'50%'} h={'100%'} gap={0} align={'center'}> {/* Lectures */}
        <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>
        {paddedLessons.slice((page - 1) * pageNum, page * pageNum).map((lesson, i) => {
          return (
            lesson._id ?
              <UnstyledButton h="66.4px" w="100%" key={lesson._id}
                style={{
                  backgroundColor: i % 2 === 0 ? "#f1f3f5" : "#ffffffff",
                  color: "inherit",
                }}
                component={Link} to={`/lesson/${lesson._id}`}>
                <Flex className={classes.List} h="100%" w="100%" justify="center" align={'center'}>
                  <Text mt={'lg'} mb={'lg'} className={`${classes.JalnanGothic}`}>{lesson.title}</Text>
                </Flex>
              </UnstyledButton>
              :
              <UnstyledButton h="66.4px" w="100%"
                style={{
                  backgroundColor: i % 2 === 0 ? "#f1f3f5" : "#ffffffff",
                  color: "inherit",
                  "&:hover": {
                    color: "inherit"
                  }
                }}>
                <Flex className={classes.List} h="100%" w="100%" justify="center" align={'center'}>
                  <Text mt={'lg'} mb={'lg'} className={`${classes.JalnanGothic}`}>{lesson.title}</Text>
                </Flex>
              </UnstyledButton>
          )
        })}
        <Space h="sm" />
        <Pagination value={page} onChange={setPage} total={Math.max(1, Math.ceil(paddedLessons.length / pageNum))} />
      </Stack>
    </Flex>
  )
}