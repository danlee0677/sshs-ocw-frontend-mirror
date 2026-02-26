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
    //route("/create", "./routes/lesson/LessonEditor.tsx"),
    route("/:lessonId", "./routes/lesson/LessonViewer.tsx"),
    //route("/:lessonId/edit", "./routes/lesson/LessonEditor.tsx"),
  ]),

  // catchall
  route("*", "./routes/catchall/Catchall.tsx"),
] satisfies RouteConfig;
