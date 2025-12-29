import type { User, Lesson, Subject } from './types'

export function isUser(user: User | null) {
  if (user && user.username && user._id.length > 0) return true;
  return false;
}

// for conditional render of Editing
export function canEdit(user: User | null) {
  // if (user && (user.roles.includes('admin'))) return true;
  // return false;
  user
  // todo: change before deployment
  return true;
}

export const PLACEHOLDER_SUBJECT: Subject = {
  title: "",
  _id: "",
  description: "",
  contents: [],
  likes: 0
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
  subject: "",
}

export const PLACEHOLDER_MARKDOWN: string = `
위의 '마크다운 컴파일' 버튼을 통해 컴파일 결과를 확인해 보세요!

# 이건 예시 강좌입니다.

### 이 에디터는 마크다운을 지원합니다. H1, H2 등은 이렇게 #을 통해 작성하십시오.

이렇게 **굵은** 글씨도 표현 가능합니다.

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