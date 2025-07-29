import React from "react";
import { Routes, Route } from "react-router";
import Main from "./main/Main";
import Nonexistent from "./nonexistent/Nonexistent";
import Lecture from "./lecture/Lecture";

function Router() {
  return (
    <Routes>
      <Route index element = {<Main />} />

      <Route path="info">
        <Route index element={<Lecture />}></Route>
        <Route path=""></Route>
      </Route>
      <Route path="*" element={<Nonexistent />} />
    </Routes>
  )
}

export default Router