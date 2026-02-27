import { type RouteConfig, index, prefix, route, } from "@react-router/dev/routes";

export default [
  // home
  index("./routes/startpage/StartPage.tsx"),
  route("/home", "./routes/home/Home.tsx"),

  // auth
  route("/login", "./routes/auth/Login.tsx"),
  route("/action/auth/check-username", "routes/startpage/action.check-username.ts"),
  route("/action/auth/logout", "./routes/auth/action.logout.ts"),

  // lesson
  ...prefix("lesson", [
    route("/create", "./routes/lesson/LessonCreate.tsx"),
    route("/:lessonId", "./routes/lesson/LessonViewer.tsx"),
    route("/:lessonId/edit", "./routes/lesson/LessonEdit.tsx"),
  ]),
  route("/action/lesson/submit", "./routes/lesson/action.lesson.submit.ts"),

  // profile
  route("/profile/:pageUserId", "./routes/mypage/Profile.tsx"),

  // catchall
  route("*", "./routes/catchall/Catchall.tsx"),
] satisfies RouteConfig;
