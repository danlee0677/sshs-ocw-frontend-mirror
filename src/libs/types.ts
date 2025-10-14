import { TitleOrder } from "@mantine/core";
import { z } from 'zod'

export type LectureComponent = LectureHeading | LectureVideo | LectureBody;

export interface LectureHeading {
  type: 'heading';
  order: TitleOrder;
  content: string;
  justify: 'flex-start' | 'center' | 'flex-end';
}

export interface LectureVideo {
  type: 'video';
  src: string;
}

export interface LectureBody {
  type: 'body';
}

export const userSchema = z.object({
  name: z.string(),
  roles: z.array(z.string()),
  preference: z.array(z.boolean()),
  studyLevel: z.array(z.boolean()),
})

export type User = z.infer<typeof userSchema>

export interface GoogleResponse {
  
}