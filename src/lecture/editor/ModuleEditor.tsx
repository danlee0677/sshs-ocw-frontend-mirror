import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate, useParams, useSearchParams } from "react-router";
import { http } from "../../libs/http";
import { moduleSchema, Module } from "../../libs/types";
import { PLACEHOLDER_MODULE } from "../../libs/utils";

function handleModuleSubmit(mode: "edit" | "create", navigate: NavigateFunction, module: Module) {
  if (mode === "edit") {
    
  } else if (mode === "create") {
    http.post(`${process.env.REACT_APP_API_URL}/api/modules`, {
      subject: module.subject,
      title: module.title,
    }).then((res) => {
      // todo: popup
      navigate(`/modules/${module._id}`);
    }).catch((err) => {
      console.log(err);
    })
  }
}

function ModuleEditor({ mode }: {mode: "edit" | "create"}) {
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
    }

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
      setModule(PLACEHOLDER_MODULE);
    })
  }, [mode, moduleId, navigate, subjectId])

  return (
    <>

      {mode === "edit" ? 
        <></> 
      : 
        <></>
      }
    </>
  )
}

export default ModuleEditor;