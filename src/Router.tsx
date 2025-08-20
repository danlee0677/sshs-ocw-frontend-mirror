import React from "react";
import { Routes, Route } from "react-router";
import Nonexistent from "./nonexistent/Nonexistent";
import Lecture from "./lecture/Lecture";
import Main from "./main/Main";
import Login from "./main/Login";
import Join from "./main/Join"

function Router() {
  return (
    <Routes>
      <Route index element = {<Main />} />
      <Route path="login" element={<Login />} />
      <Route path="join" element={<Join/>}/>
      <Route path="info">
        <Route index></Route>
        <Route path="0" element={<Lecture />}></Route>
      </Route>
      <Route path="*" element={<Nonexistent />} />
    </Routes>
  )
}

export default Router