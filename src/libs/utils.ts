import z from 'zod';
import { http } from './http';
import { tiptapDocSchema, type User, type Lesson, type Subject, type Mentoring, type Streak } from './types'
import type { JSONContent } from '@tiptap/core';
import axios from 'axios';

export function tryParseJSON<T = unknown>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/**
 * Reads a cached TipTap draft out of localStorage. Returns `null` when there is
 * no draft OR when what is there is not a document.
 *
 * This is the trust boundary that was missing. Every API response in this app is
 * Zod-validated, but localStorage is equally unchecked and is user-writable, and
 * a corrupted or hand-edited draft key flowed straight into
 * `editor.commands.setContent()`. `tiptapDocSchema` is the same schema the edit
 * loaders already apply to the SERVER's copy of the content a few lines away —
 * this just stops the local copy from being the one input nobody checks.
 *
 * `tryParseJSON` is an unchecked assertion, not a parse, so the `as JSONContent`
 * below is doing the work the generic only pretended to. It is deliberately
 * placed directly under the `safeParse` that earns it.
 *
 * A malformed draft is DISCARDED, which makes it indistinguishable from a
 * missing key: the caller falls back to the placeholder and `hasCached` is left
 * to the markdown/meta keys. The warning is the only trace, because surfacing it
 * would mean new UI copy and a different recovery-modal contract.
 */
export function readTiptapDraft(raw: string | null): JSONContent | null {
  const parsed = tryParseJSON(raw);
  if (parsed === null) return null;
  if (!tiptapDocSchema.safeParse(parsed).success) {
    console.warn('Discarding a malformed TipTap draft from localStorage');
    return null;
  }
  return parsed as JSONContent;
}

export const useableTags = ['Math', 'Physics', 'Informatics', 'Chemistry', 'Biology', 'Earth Science', 'Eccentra']

export const LESSON_TIPTAP_CREATE_STORAGE_KEY = "LectureEditor_Create_v01"
export const LESSON_MARKDOWN_CREATE_STORAGE_KEY = "Markdown_Create_v01"
export const LESSON_META_CREATE_STORAGE_KEY = "LessonMeta_Create_v01"
export const lessonTiptapEditStorageKey = (id: string) => `LectureEditor_Edit_${id}_v01`
export const lessonMarkdownEditStorageKey = (id: string) => `Markdown_Edit_${id}_v01`
export const lessonMetaEditStorageKey = (id: string) => `LessonMeta_Edit_${id}_v01`


export const MENTORING_TIPTAP_CREATE_STORAGE_KEY = "MentoringEditor_Create_v01"
export const MENTORING_MARKDOWN_CREATE_STORAGE_KEY = "MentoringMarkdown_Create_v01"
export const MENTORING_META_CREATE_STORAGE_KEY = "MentoringMeta_Create_v01"
export const mentoringTiptapEditStorageKey = (id: string) => `MentoringEditor_Edit_${id}_v01`
export const mentoringMarkdownEditStorageKey = (id: string) => `MentoringMarkdown_Edit_${id}_v01`
export const mentoringMetaEditStorageKey = (id: string) => `MentoringMeta_Edit_${id}_v01`

export const isStudentRegex: RegExp = /@sshs\.hs\.kr$/;

export function isUser(user: User | null): user is User {
  if (user && user._id.length > 0) {
    return true;
  }
  return false;
}

// for conditional render of Editing
export function canEdit(user: User | null) {
  if (user && (user.roles.includes('admin'))) return true;
  return false;
}

export async function uploadImage(file: File) {
  const res = await http.get(`${import.meta.env.VITE_API_URL}/api/image/sign-upload`)
  const parsed = z.object({
    timestamp: z.number(),
    signature: z.string(),
    cloud_name: z.string(),
    api_key: z.string(),
  }).safeParse(res.data);

  if (res.status !== 200) 
    throw new Error("failed to fetch valid cloudinary signature")

  if (!parsed.success)
    throw new Error("failed to parse cloudinary signature")

  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', parsed.data.timestamp.toString());
  formData.append('signature', parsed.data.signature);
  formData.append('api_key', parsed.data.api_key);

  const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${parsed.data.cloud_name}/image/upload`, formData)
  
  if (uploadRes.status / 100 !== 2) 
    throw new Error("failed to upload in cloudinary")

  const parsedRes = z.object({
    secure_url: z.string(),
  }).safeParse(uploadRes.data)

  if (!parsedRes.success) throw new Error("failed to parse url from cloudinary response")

  return parsedRes.data.secure_url;
}

export const PLACEHOLDER_USER: User = {
  _id: "",
  username: "",
  liked_subject: [],
  pfp_url: "",
  roles: [],
  email: "",
  description: "",
  achievement: []
}

export const PLACEHOLDER_SUBJECT: Subject = {
  title: "",
  _id: "",
  description: "",
  contents: [],
  likes: 0,
  tags: [],
  teacher_certified: false,
  hidden_lesson_count: 0,
  image_url: "https://res.cloudinary.com/dpcig7o5t/image/upload/v1767019358/base_study_o0o20v.png",
}

/**
 * The same document `PLACEHOLDER_LESSON.content` has always held, hoisted out
 * and typed. `Lesson.content` is declared `object`, and `object` has no implicit
 * index signature, so it will not assign to TipTap's `JSONContent` — which the
 * editors' `tiptapCached` prop now is. Naming the value here gives the loaders a
 * correctly typed fallback without widening `Lesson.content` and reaching the
 * viewers. Same object, same behaviour.
 */
export const PLACEHOLDER_TIPTAP_DOC: JSONContent = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Fetching your lesson..." }] }
  ]
}

export const PLACEHOLDER_LESSON: Lesson = {
  title: "Fetching Your Lesson",
  content: PLACEHOLDER_TIPTAP_DOC,
  createdBy: "anon",
  _id: "",
  subject: "",
  student_only: false,
}

export const PLACEHOLDER_MENTORING: Mentoring = {
  title: "Fetching Your Mentoring",
  content: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Temporary Mentoring" }] }
    ]
  },
  createdBy: ["anon"],
  _id: "",
  image_url: "https://res.cloudinary.com/dpcig7o5t/image/upload/v1767019358/base_study_o0o20v.png",
  tags: [],
  description: "",
  files: [],
  createdAt: new Date('3000-01-01'),
  updatedAt: new Date('3000-04-01'),
  registration: "",
}


function daysInYear(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

export function calculateMaxStreak(streaks: Streak[]): number {
  const sorted = [...streaks].sort((a, b) => a.year - b.year);
  let max = 0, current = 0;
  for (const streak of sorted) {
    for (let i = 0; i < daysInYear(streak.year); i++) {
      if ((streak.days[String(i)] ?? 0) > 0) {
        current++;
        if (current > max) max = current;
      } else {
        current = 0;
      }
    }
  }
  return max;
}

export function calculateCurrentStreak(streaks: Streak[]): number {
  const map = new Map(streaks.map(s => [s.year, s]));
  const today = new Date();
  let year = today.getFullYear();
  let day = Math.floor(
    (today.getTime() - new Date(year, 0, 0).getTime()) / 86_400_000
  ) - 1;

  const todayActive = (map.get(year)?.days[String(day)] ?? 0) > 0;
  if (!todayActive) {
    if (day === 0) { year--; day = daysInYear(year) - 1; }
    else { day--; }
  }

  let count = 0;
  while (true) {
    const active = (map.get(year)?.days[String(day)] ?? 0) > 0;
    if (!active) break;
    count++;
    if (day === 0) { year--; day = daysInYear(year) - 1; }
    else { day--; }
  }
  return count;
}

export const PLACEHOLDER_MENTORING_MARKDOWN: string = `
위의 '마크다운 컴파일' 버튼을 통해 컴파일 결과를 확인해 보세요!

# 이건 예시 멘토링 파일입니다. 

### 이 에디터는 마크다운을 지원합니다. H1, H2 등은 이렇게 #을 통해 작성하십시오.

이렇게 **굵은** 글씨, ++밑줄++ 및 *이탤릭*도 표현 가능합니다.

+ 목록을
+ 만들 수도
+ 있고

1. 번호를
1. 매길 수도
1. 있습니다. 

| 이렇게 | 테이블을 |
| --- | --- |
| 만들 | 수도 |
| 있습 | 니다 |

latex 수식을 지원합니다. 인라인 수식은 $\\vec{F}=m\\vec{a}$ 와 같이 넣을 수 있습니다. 

수식 블록은 이렇게 넣을 수 있습니다. 이 에디터는 KaTeX를 사용하는데, 이 때문에 $\\LaTeX$와 다른 문법이 있을 수 있습니다. 
자세한 내용은 [KaTeX](https://katex.org/) 홈페이지 및 관련 내용을 검색해보기 바랍니다. 

$$
\\begin{aligned}
\\Phi_B &= \\int_{S_1} \\vec{B}_2 \\cdot d\\vec{a}_1 = \\int_{S_1} ( \\nabla \\times \\vec{A}_2 ) \\cdot d\\vec{a}_1 \\\\
&= \\oint_{P_1} \\vec{A}_2 \\cdot d\\vec{l}_1 = \\oint_{P_1} \\left( \\frac{\\mu_0 I_2 }{4 \\pi} \\oint_{P_2} \\frac{d \\vec{l}_2}{\\left|\\vec{r}-\\vec{r}^{\\prime}\\right|} \\right)\\cdot d\\vec{l}_1 \\\\
\\therefore M &= \\frac{\\mu_0}{4\\pi}\\oint_{P_1} \\oint_{P_2} \\frac{d\\vec{l}_1 \\cdot d\\vec{l}_2}{\\left| \\vec{r} - \\vec{r}^{\\prime}\\right|}
\\end{aligned}
$$

한편, 링크는 [이렇게](https://dict.naver.com/dict.search?query=%EC%9D%B4%EB%A0%87%EA%B2%8C) 넣을 수 있습니다. 

또, 유튜브 영상은 이렇게 넣을 수 있습니다. 

:::youtube {src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" width="640" height="360" start="0"} :::


인라인 코드는 \`이렇게\` 넣을 수 있으며, 코드 블럭은 이렇게 넣을 수 있습니다!

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello World!\\n");
    return 0;
}
\`\`\`

또, 이미지는 이렇게 넣을 수 있습니다. 

![Steinway D-274](https://www.steinway-gallery.com.sg/shop/image/cache/catalog/product/Resize/Boston/Steinway-GrandsD_274-500x500.png)

만약 마크다운 없이 순수하게 오른쪽 에디터로만 작성하고자 한다면 위의 '마크다운 모드 전환'을 클릭하면 됩니다.

멘토링 작성 화이팅! 
*문의사항이 있으면 학생회 정보부장(24077 이승준)에게 팀즈로 연락해주세요!
`

export const PLACEHOLDER_MARKDOWN: string = `
위의 '마크다운 컴파일' 버튼을 통해 컴파일 결과를 확인해 보세요!

# 이건 예시 강좌입니다.

### 이 에디터는 마크다운을 지원합니다. H1, H2 등은 이렇게 #을 통해 작성하십시오.

이렇게 **굵은** 글씨, ++밑줄++ 및 *이탤릭*도 표현 가능합니다.

+ 목록을
+ 만들 수도
+ 있고

1. 번호를
1. 매길 수도
1. 있습니다. 

| 이렇게 | 테이블을 |
| --- | --- |
| 만들 | 수도 |
| 있습 | 니다 |

latex 수식을 지원합니다. 인라인 수식은 $\\vec{F}=m\\vec{a}$ 와 같이 넣을 수 있습니다. 

수식 블록은 이렇게 넣을 수 있습니다. 이 에디터는 KaTeX를 사용하는데, 이 때문에 $\\LaTeX$와 다른 문법이 있을 수 있습니다. 
자세한 내용은 [KaTeX](https://katex.org/) 홈페이지 및 관련 내용을 검색해보기 바랍니다. 

$$
\\begin{aligned}
\\Phi_B &= \\int_{S_1} \\vec{B}_2 \\cdot d\\vec{a}_1 = \\int_{S_1} ( \\nabla \\times \\vec{A}_2 ) \\cdot d\\vec{a}_1 \\\\
&= \\oint_{P_1} \\vec{A}_2 \\cdot d\\vec{l}_1 = \\oint_{P_1} \\left( \\frac{\\mu_0 I_2 }{4 \\pi} \\oint_{P_2} \\frac{d \\vec{l}_2}{\\left|\\vec{r}-\\vec{r}^{\\prime}\\right|} \\right)\\cdot d\\vec{l}_1 \\\\
\\therefore M &= \\frac{\\mu_0}{4\\pi}\\oint_{P_1} \\oint_{P_2} \\frac{d\\vec{l}_1 \\cdot d\\vec{l}_2}{\\left| \\vec{r} - \\vec{r}^{\\prime}\\right|}
\\end{aligned}
$$

한편, 링크는 [이렇게](https://dict.naver.com/dict.search?query=%EC%9D%B4%EB%A0%87%EA%B2%8C) 넣을 수 있습니다. 

또, 유튜브 영상은 이렇게 넣을 수 있습니다. 

:::youtube {src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" width="640" height="360" start="0"} :::


인라인 코드는 \`이렇게\` 넣을 수 있으며, 코드 블럭은 이렇게 넣을 수 있습니다!

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello World!\\n");
    return 0;
}
\`\`\`

또, 이미지는 이렇게 넣을 수 있습니다. 

![Steinway D-274](https://www.steinway-gallery.com.sg/shop/image/cache/catalog/product/Resize/Boston/Steinway-GrandsD_274-500x500.png)

만약 마크다운 없이 순수하게 오른쪽 에디터로만 작성하고자 한다면 위의 '마크다운 모드 전환'을 클릭하면 됩니다.

강의 작성 화이팅! 
*문의사항이 있으면 학생회 정보부장(24077 이승준)에게 팀즈로 연락해주세요!
`