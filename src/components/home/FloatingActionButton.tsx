import { ActionIcon, Box, Menu } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { IconMenu2, IconPencil, IconSettings } from '@tabler/icons-react'; // 원하는 아이콘으로 변경 가능
import { Link } from 'react-router';

export function FloatingActionButton({ roles }: { roles: Array<string> }) {
  const { width, height } = useViewportSize();
  const size = 56;
  return (
    <Menu position='left'>
      <Menu.Target>
        <Box
          style={{
            position: 'fixed',
            top: height - 80,
            left: width - 80,
            zIndex: 9999,
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