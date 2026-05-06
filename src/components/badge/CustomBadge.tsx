import { Box, Group, Image, Space, Stack, Text } from "@mantine/core"
import { BadgeList } from "./badgeData"
import classes from "./CustomBadge.module.css"

export function CustomBadge({id}: {id: number}) {
    const badge = BadgeList[id]

    if (!badge) {
        return null;
    }

    return (
        <>
            <Group h={'70px'} w={'100%'} align={'center'} bdrs={'10px'} className={classes.badgeContainer}>
                <Space></Space>
                <Image src={badge.image} w={'50px'}></Image>
                <Stack justify={'center'} gap={'1px'}>
                    <Text className={classes.badgeName}>{badge.name}</Text>
                    <Text className={classes.badgeDes}>{badge.description}</Text>
                </Stack>
            </Group>
        </>
    )
}