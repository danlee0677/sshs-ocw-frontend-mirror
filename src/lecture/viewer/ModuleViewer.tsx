import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Stack, Title, Button, Table } from "@mantine/core";
import { http } from "../../libs/http";
import { PLACEHOLDER_MODULE } from "../../libs/utils";
import { type Module, moduleSchema, type User } from "../../libs/types";
import { canEdit } from "../../libs/utils";

function ModuleViewer({ user }: { user: User | null }) {
  const { moduleId } = useParams();
  const [module, setModule] = useState<Module>(PLACEHOLDER_MODULE)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const subjectId = searchParams.get('subjectId');

  useEffect(() => {
    if (!moduleId) {
      navigate('/notfound');
      return;
    }

    if (!subjectId) {
      navigate('/notfound')
      return;
    }

    http.get(`${import.meta.env.VITE_API_URL}/api/modules/${moduleId}`).then((res) => {
      const parsed = moduleSchema.safeParse(res.data)
      if (!parsed.success) throw new Error("Response does not match module type");
      setModule(parsed.data);
    }).catch((err) => {
      console.log(err);
      navigate('/notfound')
    })
  }, [moduleId, navigate, subjectId])

  return (
    <Stack align="center">
      <Title order={1}>{module.title}</Title>
      {canEdit(user) ? 
        <Button onClick={() => navigate(`/modules/${moduleId}/edit?subjectId=${subjectId}`)}>Edit</Button>
      : 
        <></>
      }
      
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>순서</Table.Th>
            <Table.Th>강의명</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {module.contents.map((lesson, ind) => {
            return (
              <Table.Tr key={lesson._id}>
                <Table.Td>{ind + 1}</Table.Td>
                <Table.Td>{lesson.title}</Table.Td>
                <Table.Td>
                  <Button onClick={() => navigate(`/lessons/${lesson._id}?subjectId=${subjectId}&moduleId=${moduleId}`)}>
                    보러 가기
                  </Button>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}

export default ModuleViewer