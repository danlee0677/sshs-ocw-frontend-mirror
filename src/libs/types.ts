import { ReactNode, JSX } from "react";
import { TitleOrder } from "@mantine/core";
import { z } from 'zod'

export interface LectureHeading {
  type: 'heading';
  order: TitleOrder;
  content: string;
  justify: 'flex-start' | 'center' | 'flex-end';
}

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  roles: z.array(z.string()),
  preference: z.array(z.boolean()),
  studyLevel: z.array(z.boolean()),
})

export type User = z.infer<typeof userSchema>

export type ShellProps = { children: ReactNode }
export type ShellComponent = (props: ShellProps) => JSX.Element

export const lessonSchema = z.object({
  title: z.string(),
  content: z.string(),
  createdBy: z.string(),
  _id: z.string(),
  module: z.string()
})

export type LessonResponse = z.infer<typeof lessonSchema>

export interface Lesson {
  title: string,
  content: object,
  createdBy: string,
  _id: string,
  module: string,
}

export const moduleSchema = z.object({
  _id: z.string(),
  subject: z.string(),
  title: z.string(),
  order: z.number(),
  contents: z.array(z.object({
    title: z.string(),
    _id: z.string(),
  }))
})

export type Module = z.infer<typeof moduleSchema>

export const subjectSchema = z.object({
  _id: z.string(),
  title: z.string(),
  contents: z.array(z.object({
    _id: z.string(),
    title: z.string(),
  }))
})

export type Subject = z.infer<typeof subjectSchema>