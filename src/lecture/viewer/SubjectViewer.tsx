import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { http } from "../../libs/http";
import { subjectSchema, Subject } from "../../libs/types";
import { PLACEHOLDER_SUBJECT } from "../../libs/utils";

function SubjectViewer() {
  const [subject, setSubject] = useState<Subject>(PLACEHOLDER_SUBJECT);
  const { subjectId } = useParams()

  useEffect(() => {
    http.get(`${process.env.REACT_APP_API_URL}/api/subjects/${subjectId}`).then((res) => {
      const parsed = subjectSchema.safeParse(res.data)

      if (!parsed.success) throw new Error("Response type is not Subject");
      setSubject(parsed.data);
    }).catch((err) => {
      setSubject(PLACEHOLDER_SUBJECT)
      console.log(err);
    })
  }, [subjectId])

  return (
    <></>
  )
}

export default SubjectViewer;