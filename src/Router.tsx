import { Routes, Route } from "react-router";
import NotFoundPage from "./notfound/NotFoundPage";
import LessonViewer from "./lesson/LessonViewer";
import Login from "./auth/Login";
import type { User } from "./libs/types";
import StartPage from "./main/StartPage";
import LoginComplete from "./auth/LoginComplete";
import Home from "./main/Home";
import Profile from "./mypage/Profile"
import Setting from "./setting/Setting"
import LessonEditor from "./lesson/LessonEditor";
import SubjectViewer from "./subject/SubjectViewer";
import { canEdit } from "./libs/utils";
import SubjectEditor from "./subject/SubjectEditor";
import SearchResult from "./search/SearchResult";

function Router({user, setUser} : {user: User | null, setUser: React.Dispatch<React.SetStateAction<User | null>>}) {
  return (
    <Routes>
      <Route index element = {<StartPage />} />

      <Route path="login">
        <Route index element={<Login />} />
        <Route path="complete" element={<LoginComplete setUser={setUser}/>} />
      </Route>

      <Route path="lesson">
        <Route path=":lessonId" element={<LessonViewer />}/> 
        <Route path=":lessonId/edit" element={canEdit(user) ? <LessonEditor mode="edit" user={user} setUser={setUser} /> : <></>} />
        <Route path="create" element={canEdit(user) ? <LessonEditor mode="create" user={user} setUser={setUser}/> : <></>} />
      </Route>

      <Route path="subject">
        <Route path=":subjectId" element={<SubjectViewer user={user} setUser={setUser}/>} />
        <Route path=":subjectId/edit" element={canEdit(user) ? <SubjectEditor mode="edit" user={user} setUser={setUser} /> : <></>} />
        <Route path="create" element={canEdit(user) ? <SubjectEditor mode="create" user={user} setUser={setUser}/> : <></>} />
      </Route>

      <Route path="Home" element={<Home user={user} setUser={setUser} />}></Route>
      <Route path="setting" element={<Setting user={user} setUser={setUser}/>}></Route>

      <Route path="search" element={<SearchResult user={user} setUser={setUser}/>} />

      <Route path="profile">
        <Route path=":pageUserId" element={<Profile user={user} setUser={setUser}></Profile>}></Route>
      </Route>

      <Route path="notfound" element={<NotFoundPage user={user} setUser={setUser} />} />

      <Route path="*" element={<NotFoundPage user={user} setUser={setUser} />} />
    </Routes>
  )
}

export default Router