import { type RouteConfig, route, } from "@react-router/dev/routes";

export default [
  // home
  route("/", "./routes/startpage/StartPage.tsx"),
  route("/home", "./routes/home/Home.tsx"),

  // auth
  route("/login", "./routes/auth/Login.tsx"),
  route("/action/auth/check-username", "routes/startpage/action.check-username.ts"),
  route("/action/auth/logout", "./routes/auth/action.logout.ts"),

  // lesson
  // route("/lesson/create", "./routes/lesson/LessonEditor.tsx"),
  // route("/lesson/:lessonId", "./routes/lesson/LessonViewer.tsx"),
  // route("/lesson/:lessonId/edit", "./routes/lesson/LessonEditor.tsx"),
] satisfies RouteConfig;
