import { ActionIcon, Box, getDefaultZIndex, Menu } from '@mantine/core';
import { IconMenu2, IconPencil, IconSettings } from '@tabler/icons-react'; // 원하는 아이콘으로 변경 가능
import { Link } from 'react-router';

export function FloatingActionButton({ roles }: { roles: Array<string> }) {
  const size = 56;
  return (
    <Menu position='left'>
      <Menu.Target>
        {/* This used to be `top: height - 80; left: width - 80` from
            useViewportSize(). Three problems, and the first is why the plan's
            "just add bottom: env(...)" instruction could not be followed as
            written — a `top` wins over a `bottom` on a fixed element with a
            definite height, so the positioning had to be INVERTED before env()
            could apply at all.

            1. JS computing what CSS owns. `bottom`/`right` needs no
               measurement, no resize subscription, and no re-render of this
               <Menu> on every resize frame. See the decision rule in
               src/libs/styles.ts.
            2. useViewportSize initialises to { width: 0, height: 0 } and only
               measures in a useEffect (verified in the hook source), so the
               first committed frame painted this at top:-80px; left:-80px —
               off the top-left corner — and it then jumped to the corner. On
               every /home load for admins and creators, who are the only users
               this button renders for.
            3. zIndex was 9999, Mantine's `max` layer. Drawer and Modal default
               to getDefaultZIndex('modal') = 200 (Drawer.mjs:35), so this FAB
               floated ABOVE the mobile Drawer's dimming overlay at every width
               below lg. `app` (100) is AppShell's own layer and is the right
               home for page-level floating chrome.

            24px, not the 16px the plan suggested: the arithmetic being replaced
            was `height - 80` with a 56px button, i.e. a 24px gap. This
            preserves the shipped position instead of nudging it. env() resolves
            because root.tsx's viewport meta carries viewport-fit=cover; unlike
            light-dark(), it is a native CSS function needing no PostCSS pass,
            which is why an inline style is fine here. */}
        <Box
          style={{
            position: 'fixed',
            bottom: 'max(24px, env(safe-area-inset-bottom))',
            right: 'max(24px, env(safe-area-inset-right))',
            zIndex: getDefaultZIndex('app'),
          }}
        >
          <ActionIcon
            size={size}
            radius="xl"
            variant="filled"
            color="blue"
          >
            <IconMenu2 size={28} stroke={2.5} />
          </ActionIcon>
        </Box>
      </Menu.Target>
      <Menu.Dropdown>
        {roles.includes('admin') && <>
          <Menu.Label>관리자</Menu.Label>
          <Menu.Item component={Link} to={'/admin'} leftSection={<IconSettings size={14} />}>관리자 설정</Menu.Item></>}
        <Menu.Label>새로 만들기</Menu.Label>
        <Menu.Item component={Link} to={'/subject/create'} leftSection={<IconPencil size={14} />}>과목 생성</Menu.Item>
        <Menu.Item component={Link} to={'/mentoring/create'} leftSection={<IconPencil size={14} />}>멘토링 생성</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}