import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { z } from 'zod'


function SearchResult() {
  const subjectTitle = useState<boolean>(true);
  const subjectContent = useState<boolean>(true);
  const lessonTitle = useState<boolean>(false);

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
          keyword: keyword
        })
      }
    }
  }, [state, subjectTitle, subjectContent, lessonTitle])

  return (
    <></>
  )
}

export default SearchResult;