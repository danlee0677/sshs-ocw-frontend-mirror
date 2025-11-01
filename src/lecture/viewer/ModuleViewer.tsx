import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { http } from "../../libs/http";
import { PLACEHOLDER_MODULE } from "../../libs/utils";
import { Module, moduleSchema } from "../../libs/types";


function ModuleViewer() {
  const { moduleId } = useParams();
  const [module, setModule] = useState<Module>(PLACEHOLDER_MODULE)
  const navigate = useNavigate();

  useEffect(() => {
    if (!moduleId) navigate('/notfound');

    http.get(`${process.env.REACT_APP_API_URL}/api/modules/${moduleId}`).then((res) => {
      const parsed = moduleSchema.safeParse(res.data)
      if (!parsed.success) throw new Error("Response does not match module type");
      setModule(parsed.data);
    }).catch((err) => {
      console.log(err);
      navigate('/notfound')
    })
  }, [moduleId])
  return (
    <></>
  )
}

export default ModuleViewer