import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate, useParams, useSearchParams } from "react-router";
import { Stack, Button, TextInput } from "@mantine/core";
import { http } from "../../libs/http";
import { moduleSchema, Module } from "../../libs/types";
import { PLACEHOLDER_MODULE } from "../../libs/utils";
import ReorderTable from "./ReorderTable";
import z from "zod";

function handleModuleSubmit(mode: "edit" | "create", navigate: NavigateFunction, module: Module, subjectId: string) {
  if (mode === "edit") {
    http.patch(`${process.env.REACT_APP_API_URL}/api/modules/${module._id}`, {
      title: module.title,
      contents: module.contents,
    }).then((res) => {
      // todo: popup
      navigate(`/modules/${module._id}?subjectId=${subjectId}`)
    }).catch((err) => {
      console.log(err);
    })
  } else if (mode === "create") {
    // todo: alert
    if (!module.title) return;
    http.post(`${process.env.REACT_APP_API_URL}/api/modules`, {
      subject: module.subject,
      title: module.title,
    }).then((res) => {
      const parsed = z.object({ _id: z.string() }).safeParse(res.data)
      if (!parsed.success) throw new Error("Failed to get module id")
      // todo: popup
      navigate(`/modules/${parsed.data._id}?subjectId=${subjectId}`);
    }).catch((err) => {
      console.log(err);
    })
  }
}

function ModuleEditor({ mode }: { mode: "edit" | "create" }) {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams()
  const subjectId = searchParams.get("subjectId")
  const navigate = useNavigate();
  const [module, setModule] = useState<Module>(PLACEHOLDER_MODULE);

  useEffect(() => {
    // setModule((a) => {return {...a, subject: subjectId}})
    if (!subjectId) {
      console.log("No subjectId: invalid page");
      navigate('/notfound');
      return;
    }
    
    setModule((mod) => {return {...mod, subject: subjectId}})

    if (mode !== "edit") return;

    if (!moduleId) {
      console.log("No moduleId in edit: invalid page")
      navigate('/notfound');
    }

    http.get(`${process.env.REACT_APP_API_URL}/api/modules/${moduleId}`).then((res) => {
      const parsed = moduleSchema.safeParse(res.data);
      
      if (!parsed.success) throw new Error("ill-formed Module response");
      if (parsed.data.subject !== subjectId) throw new Error("Failed to fetch")

      setModule(parsed.data)
    }).catch((err) => {
      console.log(err)
      navigate("/notfound")
    })
  }, [mode, moduleId, navigate, subjectId])

  if (!subjectId) return;

  return (
    <>
      {mode === "edit" ? 
        <Stack w="100vw" h="100vh" gap="md" align="center">
          <TextInput value={module.title} placeholder="모듈 제목을 입력하세요(예: 1장 뉴턴역학)"
          onChange={(e) => {
            const val = e.currentTarget.value
            setModule((mod) => {
              return {...mod, title: val}
            })
          }} />

          <>{ /*<ReorderTable />*/ }</>
          <Button onClick={() => navigate(`/lessons/create?moduleId=${moduleId}&subjectId=${subjectId}`)} >새 강의 생성</Button>
          <Button onClick={() => handleModuleSubmit("edit", navigate, module, subjectId)}>모듈 수정</Button>
          
        </Stack>
      : 
        <Stack w="100vw" h="100vw" align="center" gap="md" >
          <TextInput value={module.title} placeholder="모듈 제목을 입력하세요(예: 1장 뉴턴역학)"
          onChange={(e) => {
            const val = e.currentTarget.value
              setModule((mod) => {
              return {...mod, title: val}
            })}} />
          <Button onClick={() => handleModuleSubmit("create", navigate, module, subjectId)}>모듈 생성</Button>
        </Stack>
      }
    </>
  )
}

export default ModuleEditor;