import { Group, Image, Space, Stack, Text } from "@mantine/core"
import { BadgeList } from "./BadgeData"
import classes from "./CustomBadge.module.css"
// JalnanGothic's @font-face used to be declared in this component's own module
// as well as in shared.module.css. @font-face is global, so both applied and
// source order decided which — see the note in CustomBadge.module.css. The
// binding below must stay USED: a CSS-module import whose exports are never
// read is tree-shaken, which would silently stop the font loading.
import shared from "../../styles/shared.module.css"

export function CustomBadge({id}: {id: number}) {
    const badge = BadgeList[id]

    if (!badge) {
        return null;
    }

    return (
        <>
            <Group h={'70px'} w={'100%'} align={'center'} bdrs={'10px'} className={classes.badgeContainer}>
                <Space></Space>
                {/* `flex="0 0 auto"` is load-bearing once the text column can
                    shrink: index.css's fluid-media rule gives this <img> a
                    max-width, but nothing stops it being squeezed as a flex
                    item, so without it the IMAGE shrinks instead of the label
                    truncating. Ships with the miw={0} below, not separately. */}
                <Image src={badge.image} w={'50px'} flex="0 0 auto"></Image>
                {/* A flex item's min-width is `auto`, so `truncate` and
                    `lineClamp` cannot engage without miw={0}. Same finding as
                    Prompts 16 and 21. Matters at Profile's badge column, which
                    is span={{ base: 12, sm: 4 }} — about a third of a capped
                    1200 — while the descriptions are full Korean sentences. */}
                <Stack justify={'center'} gap={'1px'} miw={0}>
                    <Text className={shared.JalnanGothic} truncate>{badge.name}</Text>
                    <Text className={classes.badgeDes} lineClamp={1}>{badge.description}</Text>
                </Stack>
            </Group>
        </>
    )
}
