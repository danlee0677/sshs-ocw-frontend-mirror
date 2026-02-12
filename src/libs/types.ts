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
  lessonId: z.string(),
  subjectId: z.string(),
  viewedAt: z.date(),
  subject_title: z.string(),
  lesson_title: z.string(),
  image_url: z.string(),
})

export type RecentView = z.infer<typeof recentViewSchema>

export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  pfp_url: z.string(),
  roles: z.array(z.string()),
  liked_subject: z.array(z.string()),
  recent_viewed: z.array(recentViewSchema)
})

export type User = z.infer<typeof userSchema>

export type ShellProps = { children: ReactNode }
export type ShellComponent = (props: ShellProps) => JSX.Element

export const lessonSchema = z.object({
  title: z.string(),
  content: z.string(),
  createdBy: z.string(),
  _id: z.string(),
  subject: z.string()
})

export type LessonResponse = z.infer<typeof lessonSchema>

export interface Lesson {
  title: string,
  content: object,
  createdBy: string,
  _id: string,
  subject: string,
}

export const subjectSchema = z.object({
  _id: z.string(),
  title: z.string(),
  image_url: z.string(),
  description: z.string(),
  likes: z.number(),
  contents: z.array(z.object({
    _id: z.string(),
    title: z.string(),
  }))
})

export type Subject = z.infer<typeof subjectSchema>

export type OrderData = {title: string, _id: string}[]

export type OrderDataRow = {title: string, _id: string}