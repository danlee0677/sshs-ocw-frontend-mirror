import { User, Module, Lesson, Subject } from './types'

export function isUser(user: User | null) {
  if (user && user.name) return true;
  return false;
}

// for conditional render of Editing
export function canEdit(user: User | null) {
  // if (user && (user.roles.includes('admin'))) return true;
  // return false;

  // todo: change before deployment
  return true;
}

export const PLACEHOLDER_MODULE: Module = {
  title: "",
  subject: "",
  _id: "",
  order: -1,
  content: [],
}

export const PLACEHOLDER_SUBJECT: Subject = {
  title: "",
  _id: "",
  content: []
}

export const PLACEHOLDER_LESSON: Lesson = {
  title: "Fetching Your Lesson",
  content: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Fetching your lesson..." }] }
    ]
  },
  createdBy: "anon",
  _id: "",
  module: "",
}