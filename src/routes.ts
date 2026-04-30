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
    route("/:subjectId/access", "./routes/subject/SubjectAccess.tsx"),
  ]),
  route("/action/subject/submit", "./routes/subject/action.subject.submit.ts"),
  route("/action/subject/access", "./routes/subject/action.subject.access.ts"),

  // profile
  ...prefix("profile", [
    route("/:pageUserId", "./routes/mypage/Profile.tsx"),
    route("/:pageUserId/edit", "./routes/mypage/ProfileEdit.tsx"),
  ]),

  // mentoring
  ...prefix("mentoring", [
    route("/create", "./routes/mentoring/MentoringCreate.tsx"),
    route("/board", "./routes/mentoring/MentoringBoard.tsx"),
    route("/:mentoringId", "./routes/mentoring/MentoringViewer.tsx"),
    route("/:mentoringId/edit", "./routes/mentoring/MentoringEdit.tsx"),
    route("/:mentoringId/access", "./routes/mentoring/MentoringAccess.tsx"),
  ]),
  route("/action/mentoring/submit", "./routes/mentoring/action.mentoring.submit.ts"),
  route("/action/mentoring/access", "./routes/mentoring/action.mentoring.access.ts"),

  // search
  route("/search", "./routes/search/SearchResult.tsx"),

  // setting
  route("/settings", "./routes/settings/Settings.tsx"),

  // admin page
  route("/admin", "./routes/admin/AdminPage.tsx"),
  route("/action/admin/roles", "./routes/admin/action.admin.roles.ts"),

  // catchall
  route("*", "./routes/catchall/Catchall.tsx"),
] satisfies RouteConfig;
