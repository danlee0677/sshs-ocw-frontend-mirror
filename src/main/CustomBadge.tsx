import { IconUserPlus, IconUserCheck } from '@tabler/icons-react';
import { Badge } from '@mantine/core';

export function CustomBadge({ type }: { type: number }) {
    const icon1 = <IconUserPlus></IconUserPlus>;
    const icon2 = <IconUserCheck></IconUserCheck>

    return (
        <>
            {
                type === 1 ? (
                    <Badge size="lg" color="green" leftSection={icon1} mr={'xs'}>신입</Badge>
                ) : type === 2 ? (
                    <Badge size="lg" color="red" leftSection={icon2} mr={'xs'}>고수</Badge>
                ) : (
                    <Badge size="lg" color="lightgreen" leftSection={icon1} mr={'xs'}>Error</Badge>
                )
            }
        </>
    );
}