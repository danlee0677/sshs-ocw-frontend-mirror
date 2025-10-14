import React from "react";
import { Routes, Route } from "react-router";
import Nonexistent from "./nonexistent/Nonexistent";
import Lecture from "./lecture/Lecture";
import Login from "./auth/Login";
import { User } from "./libs/types";
import StartPage from "./main/StartPage";
import LoginComplete from "./auth/LoginComplete";

function Router({user, setUser} : {user: User | null, setUser: React.Dispatch<User | null>}) {
  return (
    <Routes>
      <Route index element = {user ? <></> : <StartPage />} />

      <Route path="login">
        <Route index element={<Login />} />
        <Route path="complete" element={<LoginComplete setUser={setUser}/>} />
      </Route>

      <Route path="info">
        <Route index></Route>
        <Route path="0" element={<Lecture />}></Route>
      </Route>

      <Route path="*" element={<Nonexistent />} />
    </Routes>
  )
}

export default Router