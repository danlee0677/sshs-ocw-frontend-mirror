import { Badge, Image } from '@mantine/core';
import { BadgeList } from '../../components/badge/BadgeData';

/**
 * 홈 프로필 카드의 인라인 배지.
 *
 * 이전 구현은 `type: number`를 받아 삼항 체인으로 분기했고, 마지막 else가
 * `Error`를 렌더했습니다. Home.tsx가 type={1} {2} {3}을 하드코딩하고 있었는데
 * 3번 분기가 없어서, 조건부가 아니라 모든 사용자에게 항상 "ERROR"가 떴습니다.
 * (대문자로 보인 것은 Mantine Badge의 기본 text-transform: uppercase 때문)
 *
 * 더 큰 문제는 이 컴포넌트가 BadgeList의 중복 구현이었다는 점입니다.
 * 같은 id가 서로 다른 것을 가리켰습니다 — BadgeList의 2번은 "응원의 한 표"인데
 * 여기서는 "고수"였습니다. 이제 BadgeList 하나만 참조합니다.
 *
 * components/badge/CustomBadge는 70px 높이의 목록 행이라 프로필 배지 칸에는
 * 맞지만 이 자리에는 맞지 않습니다. 그래서 알약 형태를 여기서 따로 유지합니다.
 */
export function HomeBadge({ id }: { id: number }) {
  const badge = BadgeList[id];

  // 모르는 id는 조용히 건너뜁니다. 사용자 화면에 오류 문자열이 보이는 것은
  // 어떤 경우에도 정상이 아닙니다.
  if (!badge) {
    console.warn('[HomeBadge] 정의되지 않은 배지 id:', id);
    return null;
  }

  return (
    <Badge
      size="lg"
      variant="light"
      color="blue"
      /* 이전에는 green.4 / red.4를 filled로 써서 흰 글씨 대비가 각각
         1.75:1, 2.32:1이었습니다(WCAG AA 4.5:1 미달). light 변형은
         연한 배경에 진한 글씨라 색조를 유지하면서 대비가 올라갑니다.

         색을 배지마다 다르게 주지 않는 이유: BadgeList에 색 필드가 없어
         지금 색을 정하면 근거 없는 의미가 생깁니다. 특히 초록/빨강은
         관습적으로 정상/오류를 뜻하므로 등급이나 업적에 쓰면 오해를 부릅니다.
         구분이 필요해지면 BadgeList에 color를 추가하는 편이 낫습니다. */
      tt="none"
      leftSection={
        badge.image
          ? <Image src={badge.image} w={16} h={16} alt="" />
          : undefined
      }
    >
      {badge.name}
    </Badge>
  );
}