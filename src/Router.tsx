import React from "react";
import { Routes, Route } from "react-router";
import Nonexistent from "./nonexistent/Nonexistent";
import Lecture from "./lecture/Lecture";
import Main from "./main/Main";
import Login from "./main/Login";
import Join from "./main/Join"
import { User } from "./libs/types";

function Router({user} : {user: User | null}) {
  return (
    <Routes>
      <Route index element = {<Main />} />
      <Route path="info">
        <Route index></Route>
        <Route path="0" element={<Lecture />}></Route>
      </Route>
      <Route path="*" element={<Nonexistent />} />
    </Routes>
  )
}

export default Router