import { useState } from "react";
import { Link, useFetcher, useLoaderData, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { Badge, Stack, Title, UnstyledButton, Flex, Text, Image, Pagination, Space, Pill, Group, ScrollArea } from "@mantine/core";
import { IconHeart, IconPencilPlus } from "@tabler/icons-react";
import { http } from "../../libs/http";
import { permissionCheckSchema, subjectSchema, type Subject, type User } from "../../libs/types";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import shared from "../../styles/shared.module.css"
import page from "./subjectViewer.module.css"

// Shared page chrome plus this page's own rules. Page keys win on collision.
const classes = { ...shared, ...page }
import { useUserContext } from "../../root";
import { isUser } from "../../libs/utils";
import { notifications } from "@mantine/notifications";

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
    notifications.show({
      title: "과목 즐겨찾기 실패",
      position: "bottom-center",
      message: "예상치 못한 오류가 발생했습니다. 다시 시도해주세요."
    })
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
      {/* AppShell.Main is `overflow: hidden`, so each page owns its own scroll
        * container. Without this the page clips instead of scrolling. */}
      <ScrollArea w="100%" h="100%">
        <SubjectContent subject={subject} user={user} canEdit={canEdit} key={subject._id} />
      </ScrollArea>
    </MainPageAppshell>
  )
}

function SubjectContent({ subject, user, canEdit }: { subject: Subject; user: User | null; canEdit: boolean }) {
  const navigate = useNavigate();

  const fetcher = useFetcher<typeof clientAction>();
  const isOptimistic = fetcher.state === "submitting";

  const [page, setPage] = useState<number>(1);

  const hasActionData = fetcher.data && !('error' in fetcher.data);
  const serverLiked = hasActionData
    ? fetcher.data.liked
    : (isUser(user) && user.liked_subject.includes(subject._id));
  const serverCount = hasActionData ? fetcher.data.likes : subject.likes;

  const displayedLiked = isOptimistic ? !serverLiked : serverLiked;
  const displayedCount = isOptimistic
    ? serverCount + (serverLiked ? -1 : 1)
    : serverCount;

  const onClickLike = () => {
    if (!user) return navigate("/login");
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
    <Flex
      w={'100%'}
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'stretch', md: 'flex-start' }}
      justify={'center'}
      gap={'md'}>
      <Flex w={{ base: '100%', md: '30%' }} justify={'center'}> {/* Subject Details */}
        <Stack w={{ base: '100%', md: '80%' }} px="md" align="center" gap={'xs'} className={classes.Border} mt={'30px'}>
          <Image mt={'lg'} w={{ base: 120, md: 160 }} src={subject.image_url} className={classes.SubjectImage}></Image>
          <Group gap={'xs'}>
            <Title order={1} className={classes.JalnanGothic}>{subject.title}</Title>
            {canEdit &&
              <UnstyledButton component={Link} to={`/subject/${subject._id}/edit`}>
                <IconPencilPlus></IconPencilPlus>
              </UnstyledButton>}
          </Group>
          {/* `w='80%'` here compounded with the parent Stack's 80% — 0.8 x 0.8 = 64%
              of the viewport, ~230px on a 360px phone. The fixed mih went with it. */}
          <Text w={'100%'} className={classes.Paperozi}>{subject.description}</Text>
          {subject.teacher_certified && (
            /* Badge, not Pill. Was `bg="green" c="white"` (white on green-6 is
               ~3.1:1, below AA), then briefly `<Pill color variant>` — but Pill has
               NO `color` prop and its only variants are 'default' | 'contrast', so
               both props were silently absorbed and the label rendered plain grey.
               Badge supports them for real, resolving to --mantine-color-green-light
               + -light-color: the Color contract's success/certified row. */
            <Badge color="green" variant="light" size="md">Teacher-certified</Badge>
          )}
          <Group gap={1} w={'100%'} align={'center'} justify={'center'}>
            {subject.tags.map((tag) => (<Pill mb={'2px'} renderRoot={(props) => <Link to={`/search?tags=${tag}`} {...props}></Link>} key={tag}>{tag}</Pill>))}
          </Group>
          <Group align="center">
            <UnstyledButton style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              margin: 0,
              lineHeight: 0,
              outline: "none",
            }} onClick={onClickLike} disabled={isOptimistic}>
              <IconHeart
                color="red"
                fill={displayedLiked ? "red" : "none"}></IconHeart>
            </UnstyledButton>
            <Text>{displayedCount}</Text>
          </Group>
        </Stack>
      </Flex>

      <Stack w={{ base: '100%', md: '50%' }} gap={0} align={'center'}> {/* Lectures */}
        <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>
        {/* `classes.*`, never `page.*`: the `page` CSS-module import is shadowed
            inside this component by the `page` pagination state above. */}
        {paddedLessons.slice((page - 1) * pageNum, page * pageNum).map((lesson, i) => {
          const stripe = i % 2 === 0 ? classes.rowEven : classes.rowOdd;
          return (
            lesson._id ?
              /* was h="66.4px": mih + vertical padding lets long Korean titles wrap
                 to a second line instead of clipping */
              <UnstyledButton mih={56} w="100%" py="xs" px="md" key={lesson._id}
                className={stripe}
                style={{ color: "inherit" }}
                component={Link} to={`/lesson/${lesson._id}`}>
                <Flex h="100%" w="100%" justify="center" align={'center'}>
                  <Text className={`${classes.JalnanGothic}`}>{lesson.title}</Text>
                </Flex>
              </UnstyledButton>
              :
              <UnstyledButton mih={56} w="100%" py="xs" px="md" key={`placeholder-${i}`}
                className={stripe}
                style={{ color: "inherit" }}>
                <Flex h="100%" w="100%" justify="center" align={'center'}>
                  <Text className={`${classes.JalnanGothic}`}>{lesson.title}</Text>
                </Flex>
              </UnstyledButton>
          )
        })}
        <Space h="sm" />
        {/* siblings/boundaries keep the control from overflowing below 400px */}
        <Pagination value={page} onChange={setPage} siblings={1} boundaries={1} total={Math.max(1, Math.ceil(paddedLessons.length / pageNum))} />
      </Stack>
    </Flex>
  )
}