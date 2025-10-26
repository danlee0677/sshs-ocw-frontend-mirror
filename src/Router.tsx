import React from "react";
import { Routes, Route } from "react-router";
import Nonexistent from "./nonexistent/Nonexistent";
import LessonViewer from "./lecture/viewer/LessonViewer";
import Login from "./auth/Login";
import { User } from "./libs/types";
import StartPage from "./main/StartPage";
import LoginComplete from "./auth/LoginComplete";
import Home from "./main/Home";
import Setting from "./setting/Setting"
import LessonEditor from "./lecture/editor/LessonEditor";
import ModuleViewer from "./lecture/viewer/ModuleViewer";
import ModuleEditor from "./lecture/editor/ModuleEditor";
import SubjectViewer from "./lecture/viewer/SubjectViewer";
import { canEdit } from "./libs/utils";

function Router({user, setUser} : {user: User | null, setUser: React.Dispatch<User | null>}) {
  return (
    <Routes>
      <Route index element = {user ? <Home></Home> : <StartPage />} />

      <Route path="login">
        <Route index element={<Login />} />
        <Route path="complete" element={<LoginComplete setUser={setUser}/>} />
      </Route>

      <Route path="lessons">
        <Route path=":lessonId" element={<LessonViewer />}/> 
        <Route path=":lessonId/edit" element={canEdit(user) ? <LessonEditor mode="edit" /> : <></>} />
        <Route path="create" element={canEdit(user) ? <LessonEditor mode="create" /> : <></>} />
      </Route>

      <Route path="modules">
        <Route path=":moduleId" element={<ModuleViewer />} />
        <Route path=":moduleId/edit" element={canEdit(user) ? <ModuleEditor /> : <></>} />
      </Route>

      <Route path="subjects">
        <Route path=":subjectId" element={<SubjectViewer />} />
        <Route path=":subjectId/edit" element={canEdit(user) ? <ModuleEditor /> : <></>} />
      </Route>

      <Route path="Home" element={<Home />}></Route>
      <Route path="setting" element={<Setting />}></Route>

      <Route path="*" element={<Nonexistent />} />
    </Routes>
  )
}

export default Router