import { useEffect, useState, type SetStateAction } from "react";
import { Link, useNavigate, useParams, type NavigateFunction } from "react-router";
import { Group, Stack, Title, Button, SimpleGrid, UnstyledButton, Flex, Text, Image, ThemeIcon } from "@mantine/core";
import { IconHeart, IconPencilPlus } from "@tabler/icons-react";
import { http } from "../libs/http";
import { subjectSchema, type Subject, type User } from "../libs/types";
import { PLACEHOLDER_SUBJECT } from "../libs/utils";
import './subjectViewer.module.css'
import MainPageAppshell from "../main/MainPageAppshell";
import classes from "./subjectViewer.module.css"

async function handleSubjectLike(subject: Subject) {
  const res = await http.post(`${import.meta.env.VITE_API_URL}/api/subjects/${subject._id}/like`);
  return res.data as {liked: boolean, likes: number}
}

function SubjectViewer({ user, setUser }: { user: User | null, setUser: React.Dispatch<SetStateAction<User | null>> }) {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT); 
  const [likeLoading, setLikeLoading] = useState(false);
  const { subjectId } = useParams()
  const navigate = useNavigate();

  useEffect(() => {
    if (!subjectId) navigate("/notfound");

    http.get(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`).then((res) => {
      const parsed = subjectSchema.safeParse(res.data)

      if (!parsed.success) throw new Error("Response type is not Subject");
      setSubject(parsed.data);
    }).catch((err) => {
      navigate('/notfound')
      console.log(err);
    })
  }, [subjectId, navigate])

  const isLiked = !!user && Array.isArray((user as any).liked_subject) && (user as any).liked_subject.includes(subject._id)

  const onClickLike = async () => {
    if (!user) return;
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      const { liked, likes } = await handleSubjectLike(subject);

      setSubject((prev) => ({ ...prev, likes }));

      setUser((prev) => {
        if (!prev) return prev;

        const prevArr = Array.isArray((prev as any).liked_subject)
          ? (prev as any).liked_subject
          : [];
        const nextArr = liked
          ? Array.from(new Set([...prevArr, subject._id]))
          : prevArr.filter((id: string) => id !== subject._id);

        return { ...(prev as any), liked_subject: nextArr } as any;
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLikeLoading(false);
    }
  };


  return (
    <MainPageAppshell user={user} setUser={setUser} navigate={navigate}>
      {subjectId ?
        <Flex w={'100%'} justify={'center'} gap={'md'}>
          <Stack w={'30%'} align={'center'} gap={'xs'}>
            <Image mt={'lg'} w={'160px'} src={subject.image_url}></Image>
            <Title order={1} className={classes.JalnanGothic}>{subject.title}</Title>
            <Text className={classes.Paperozi}>{subject.description}</Text>
            {(user && user.roles.includes('admin')) ? 
              <UnstyledButton component={Link} to={`/subject/${subjectId}/edit`}  >
                <IconPencilPlus></IconPencilPlus>
              </UnstyledButton>
            : 
            <></>}
            <UnstyledButton onClick={onClickLike} disabled={likeLoading}>
                <IconHeart
                color="red"
                fill={isLiked ? "red" : "none"}></IconHeart>
            </UnstyledButton>
            <Text>{subject.likes}</Text>
          </Stack>
          <Stack w={'50%'} h={'100%'} gap={0} align={'center'}>
            <Title order={2} className={classes.JalnanGothic} m={"xl"}>목록</Title>
            {subject.contents.map((lesson, i) => {
              return (
                <UnstyledButton h="100%" w="100%"
                  style={{
                    backgroundColor: i % 2 === 0 ? "#f1f3f5" : "#ffffffff",
                    color: "inherit",
                    "&:hover": {
                      color: "inherit"
                    }
                  }}
                  component={Link} to={`/lesson/${lesson._id}?subjectId=${subject._id}`}>
                  <Flex className={classes.List} h="100%" w="100%" justify="center" align={'center'}>
                    <Text mt={'lg'} mb={'lg'} className={`${classes.JalnanGothic}`}>{lesson.title}</Text>
                  </Flex>
                </UnstyledButton>
              )
            })}
          </Stack>
        </Flex>
        :
        <></>
      }
    </MainPageAppshell>
  )
}

export default SubjectViewer;