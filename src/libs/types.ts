import { TitleOrder } from "@mantine/core";

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

export interface User {
  name: string;
}

export interface GoogleResponse {
  
}