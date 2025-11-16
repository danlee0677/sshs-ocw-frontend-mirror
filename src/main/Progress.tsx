import { IconTargetArrow } from '@tabler/icons-react';
import { Badge, Group, Paper, Progress, Text, ThemeIcon } from '@mantine/core';
import classes from './Progress.module.css';

export function ProgressCard({type} : {type: number}) {
    return (
        <Paper radius="md" withBorder className={classes.card} mt={0}>
            <ThemeIcon className={`${classes.icon} ${type === 1 ? classes.week : classes.month}`} size={60} radius={60}>
                <IconTargetArrow size={32} stroke={1.5} />
            </ThemeIcon>

            <Text ta="center" fw={700} className={classes.title}>
                {type === 1 ? "주간 목표" : "월간 목표"}
            </Text>
            <Text c="dimmed" ta="center" fz="sm">
                {type === 1 ? "32 score / week" : "32 score / month"}
            </Text>

            <Group justify="space-between" mt="xs">
                <Text fz="sm" c="dimmed">
                    진척도
                </Text>
                <Text fz="sm" c="dimmed">
                    62%
                </Text>
            </Group>

            <Progress value={62} mt={5} />

            <Group justify="space-between" mt="md">
                <Text fz="sm">20 / 36</Text>
                <Badge size="sm">4 days left</Badge>
            </Group>
        </Paper>
    );
}