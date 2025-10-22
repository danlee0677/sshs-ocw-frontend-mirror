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

export interface Lesson {
  title: string,
  content: object,
  createdBy: string,
}

export type ShellProps = { children: ReactNode }
export type ShellComponent = (props: ShellProps) => JSX.Element