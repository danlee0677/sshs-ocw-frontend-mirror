import axios from "axios";
import { useEffect, useState, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router";
import { z } from 'zod'
import MainPageAppshell from "../main/MainPageAppshell";
import type { User } from "../libs/types";
import { Checkbox, Flex, Paper } from "@mantine/core";

interface ResultType {
  subjectTitle: { _id: string, title: string }[],
  subjectContent: { _id: string, content: string }[],
  lessonTitle: { _id: string, title: string, subject: string }[],
}

const PLACEHOLDER_RESULT: ResultType = {
  subjectTitle: [],
  subjectContent: [],
  lessonTitle: []
}

function SearchResult({ user, setUser }: { user: User | null, setUser: React.Dispatch<SetStateAction<User | null>>}) {
  const [subjectTitle, setSubjectTitle] = useState<boolean>(true);
  const [subjectContent, setSubjectContent] = useState<boolean>(true);
  const [lessonTitle, setLessonTitle] = useState<boolean>(false);

  const [searchResult, setSearchResult] = useState<ResultType>(PLACEHOLDER_RESULT);

  const navigate = useNavigate();

  const location = useLocation();
  const state = z.object({
    keyword: z.string(),
  }).safeParse(location.state)

  useEffect(() => {
    if (state.success) {
      const keyword = state.data.keyword
      if (2 <= keyword.length && keyword.length <= 20) {
        axios.post(`${import.meta.env.VITE_API_URL}/api/search`, {
          subjectTitle: subjectTitle,
          subjectContent: subjectContent,
          lessonTitle: lessonTitle,
          keyword: keyword,
        }).then((res) => {
          setSearchResult(res.data)
        }).catch((err) => {
          console.log(err);
        })
      }
    }
  }, [state, subjectTitle, subjectContent, lessonTitle])

  return (
    <MainPageAppshell navigate={navigate} setUser={setUser} user={user}>
      <Flex>
        <Paper>
          <Checkbox label="과목 제목"></Checkbox>
          <Checkbox label="과목 내용"></Checkbox>
          <Checkbox label="강의 제목"></Checkbox>
        </Paper>
        
      </Flex>
    </MainPageAppshell>
  )
}

export default SearchResult;