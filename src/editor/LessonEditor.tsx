import { useEffect, useState } from "react";
import { useParams } from "react-router";
import LessonEditorAppshell from "./LessonEditorAppshell";
import LessonBody from "./LessonBody";
import { Lesson } from "../libs/types";

function LessonEditor({mode} : {mode: "edit" | "create"}) {
  const [initialContent, setInitialContent] = useState<null | Lesson>(null)

  useEffect(() => {
    if (mode !== "edit") return;

  }, [mode])

  return (
    <>
      <LessonBody content={null} editable={true} Shell={LessonEditorAppshell} />
    </>
    
  )
}

export default LessonEditor