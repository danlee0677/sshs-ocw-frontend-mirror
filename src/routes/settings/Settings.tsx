import { Text, Group, TextInput, Stack, Button, ScrollArea, Container, Title } from "@mantine/core";
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { ColorSchemeToggleFull } from "../../components/appshell/ColorSchemeToggle";

function Setting() {
  return (
    <MainPageAppshell>
      {/* AppShell.Main is `overflow: hidden`, so each page owns its own scroll
        * container. Without this the page clips instead of scrolling.
        * Exactly one, and it is INSIDE the shell — the scroll-container
        * invariant is about nesting order, not about the token count. */}
      <ScrollArea w="100%" h="100%">
        {/* Bare <Container>, no `size` prop: the theme default is
          * CONTENT_MAX_WIDTH (1200) and `size="lg"` would silently mean 1140.
          * Was `w='80%'` of an UNCAPPED viewport, so this row ran to ~1536px on
          * a 1920 screen while Home and Profile stopped at 1200. `py`, not `p`
          * — the Container already supplies px. */}
        <Container w="100%" py="md">
          <Stack gap="xl">
            {/* Was `<Group className={classes.Vertical_align} w='80%' h='10vh'>`.
              * `h='10vh'` is ~64px on a phone and ~36px in landscape, too short
              * for a row that has to wrap; and Vertical_align set align-items
              * and justify-content at the same (0,1,0) specificity as Mantine's
              * own Group rule, so which won was decided by chunk order rather
              * than intent. Mantine's own props say it once, unambiguously. */}
            <Stack gap="xs">
              <Title order={4}>계정</Title>
              <Group w="100%" wrap="wrap" gap="md" align="flex-end">
                <TextInput
                  label="아이디 변경"
                  name="username"
                  placeholder="새 아이디를 입력하세요"
                  flex={1}
                  miw={200}
                />
                {/* Still disabled: this feature is not wired up, and labelling
                  * an inert control is the whole of this change. Do not connect
                  * it here. */}
                <Button disabled={true}>적용</Button>
              </Group>
            </Stack>

            {/* Third mount of the same control, after the header and the mobile
              * Drawer. That is deliberate — this is discoverability, not a
              * replacement. All three read the same useMantineColorScheme
              * state, so they cannot disagree; keep them consistent if the
              * component's API ever changes. */}
            <Stack gap="xs">
              <Title order={4}>화면 테마</Title>
              <Text size="sm" c="dimmed">
                라이트 / 다크 / 자동 중에서 선택하세요. 자동은 기기 설정을 따릅니다.
              </Text>
              <ColorSchemeToggleFull />
            </Stack>
          </Stack>
        </Container>
      </ScrollArea>
    </MainPageAppshell>
  )
}

export default Setting;
