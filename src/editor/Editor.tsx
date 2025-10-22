import { useEffect, useState } from "react";
import { useParams } from "react-router";
import EditorAppshell from "./EditorAppshell";
import LectureEditor from "./LectureEditor";
import { Lesson } from "../libs/types";

function Editor({mode} : {mode: "edit" | "create"}) {
  const [initialContent, setInitialContent] = useState<null | Lesson>(null)

  useEffect(() => {
    if (mode !== "edit") return;

  }, [])

  return (
    <>
      <LectureEditor content={null} editable={true} Shell={EditorAppshell} />
    </>
    
  )
}

export default Editor