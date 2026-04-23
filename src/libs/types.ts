import type { ReactNode, JSX } from "react";
import type { TitleOrder } from "@mantine/core";
import { z } from 'zod'

export interface LectureHeading {
  type: 'heading';
  order: TitleOrder;
  content: string;
  justify: 'flex-start' | 'center' | 'flex-end';
}

export const recentViewSchema = z.object({
  lesson: z.object({
    _id: z.coerce.string(),
    title: z.string(),
  }),
  subject: z.object({
    _id: z.coerce.string(),
    title: z.string(),
    image_url: z.string(),
    description: z.string(),
  }),
  viewedAt: z.coerce.date(),
  userId: z.coerce.string(),
})

export type RecentView = z.infer<typeof recentViewSchema>

export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  pfp_url: z.string(),
  roles: z.array(z.string()),
  liked_subject: z.array(z.string()),
  email: z.string(),
  description: z.string(),
})

export type User = z.infer<typeof userSchema>

export type ShellProps = { children: ReactNode }
export type ShellComponent = (props: ShellProps) => JSX.Element

export const lessonSchema = z.object({
  title: z.string(),
  content: z.string(),
  createdBy: z.object({
    username: z.string(),
  }),
  _id: z.string(),
  subject: z.string(),
  student_only: z.boolean(),
})

export type LessonResponse = z.infer<typeof lessonSchema>

export const tiptapDocSchema = z.looseObject({
  type: z.literal("doc"),
  content: z.array(z.record(z.string(), z.unknown())).optional(),
})

export interface Lesson {
  title: string,
  content: object,
  createdBy: string,
  _id: string,
  subject: string,
  student_only: boolean,
}

export const subjectSchema = z.object({
  _id: z.string(),
  title: z.string(),
  image_url: z.string().nullable(),
  description: z.string(),
  likes: z.number(),
  tags: z.array(z.string()),
  teacher_certified: z.boolean(),
  contents: z.array(z.object({
    _id: z.string(),
    title: z.string(),
  }))
})

export type Subject = z.infer<typeof subjectSchema>

export type OrderData = {title: string, _id: string}[]

export type OrderDataRow = {title: string, _id: string}


export const resultSchema = z.object({
  subjectTitle: z.array(z.object({ _id: z.string(), title: z.string(), teacher_certified: z.boolean() })),
  subjectDescription: z.array(z.object({ _id: z.string(), description: z.string(), teacher_certified: z.boolean() })),
  lessonTitle: z.array(z.object({ _id: z.string(), title: z.string(), subject: z.string() })),
})

export const searchParamsSchema = z.object({
  keyword: z.string().max(20, "검색어 길이는 20자 이하여야 합니다!").default(""),
  tags: z.array(z.string()).default([]),
  subjectTitle: z.boolean().default(true),
  subjectDescription: z.boolean().default(true),
  or: z.boolean().default(false),
  lessonTitle: z.boolean().default(false),
  teacherCertified: z.boolean().default(false),
})

export type ResultType = z.infer<typeof resultSchema>

export type SearchParamsType = z.infer<typeof searchParamsSchema>

export const permissionCheckSchema = z.object({
  canEdit: z.boolean(),
  role: z.enum(['admin', 'owner', 'editor']).nullable(),
})

export const permissionRecordSchema = z.object({
  _id: z.string(),
  pfp_url: z.string(),
  userId: z.string(),
  subjectId: z.string(),
  role: z.enum(['owner', 'editor']),
  username: z.string(),
})

export type PermissionRecord = z.infer<typeof permissionRecordSchema>