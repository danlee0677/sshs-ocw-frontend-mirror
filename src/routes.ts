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

  // subject
  ...prefix("subject", [
    route("/create", "./routes/subject/SubjectCreate.tsx"),
    route("/:subjectId", "./routes/subject/SubjectViewer.tsx"),
    route("/:subjectId/edit", "./routes/subject/SubjectEdit.tsx"),
  ]),
  route("/action/subject/submit", "./routes/subject/action.subject.submit.ts"),

  // profile
  route("/profile/:pageUserId", "./routes/mypage/Profile.tsx"),

  // search
  route("/search", "./routes/search/SearchResult.tsx"),

  // setting
  route("/settings", "./routes/settings/Settings.tsx"),

  // catchall
  route("*", "./routes/catchall/Catchall.tsx"),
] satisfies RouteConfig;
