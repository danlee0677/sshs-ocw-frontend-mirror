import { useEffect, type ReactNode } from "react";
import { ActionIcon, AppShell, Box, Group, Image, TextInput, UnstyledButton, Button, Burger, Drawer, ScrollArea, Divider, Stack, Avatar, Menu } from "@mantine/core";
import { IconSearch } from '@tabler/icons-react';
import { Form, Link, useFetcher } from "react-router";
import { FROM_LG_QUERY, HEADER_HEIGHT, linkStyle } from "../../libs/styles";
import classes from "./Appshell.module.css";
import { useAppLogo } from './useAppLogo';
import { isUser } from "../../libs/utils";
import { useUserContext } from "../../libs/useUserContext";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ColorSchemeToggle, ColorSchemeToggleFull } from "./ColorSchemeToggle";
import { HEADERa_LINKS } from "../../libs/navLinks";
import AppFooter from "./AppFooter";

/**
 * The search field, used inline in the header and again inside the Drawer.
 *
 * Both copies are always RENDERED; only CSS hides the header one below `sm`.
 * Unmounting a field inside `<Form method="get">` would stop it being submitted
 * — see the warning in src/libs/styles.ts.
 */
function SearchForm({ fullWidth = false, onSubmit }: { fullWidth?: boolean; onSubmit?: () => void }) {
  return (
    <Form
      action="/search"
      method="get"
      onSubmit={onSubmit}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Group className={classes.searchArea}>
        <TextInput
          /*
           * `auto` is required for the submit control to work at all. Mantine's
           * Input defaults `leftSectionPointerEvents` to `"none"`, which it
           * applies as `pointer-events` on the section — so the submit button
           * that used to live here was never clickable. Search worked only
           * through implicit form submission on Enter.
           */
          leftSectionPointerEvents="auto"
          leftSection={
            /*
             * ActionIcon, not Button. A `filled` Button sets
             * `--button-color: var(--mantine-color-white)` on its root, so an
             * icon inheriting `currentColor` inside one renders WHITE — the
             * inline style here killed the Button's background and border but
             * never its color, leaving a white icon on a white input. `subtle`
             * + `gray` is themed per scheme, so neither mode needs a literal.
             *
             * Size is bounded by the section: `--input-left-section-size` is
             * `input-height - 2px` ≈ 34px, so anything above `md` (28px) clips.
             */
            <ActionIcon type="submit" variant="subtle" color="gray" size="md" aria-label="검색">
              <IconSearch size={16} stroke={1.5} />
            </ActionIcon>}
          placeholder="검색어를 입력해 주세요."
          name="keyword"
          maxLength={20}
          w={fullWidth ? '100%' : undefined}
        />
      </Group>
    </Form>
  );
}

interface MainPageAppshellProps {
  children: ReactNode;
  /**
   * Render the inline header search field. `/search` passes `false` — it has its
   * own search UI and a second form in the header is noise.
   *
   * This is a per-route prop, NOT a width branch, so it is exempt from the
   * "never unmount a control behind a media query" rule in src/libs/styles.ts:
   * nothing here depends on viewport width. The Drawer search is deliberately
   * NOT gated by it — hiding both is the bug fixed below.
   */
  showSearch?: boolean;
  /**
   * Render AppFooter, and with it the shell-owned page scroll container.
   *
   * `false` restores the OLD contract verbatim — `children` are placed straight
   * into AppShell.Main and must bring their own ScrollArea. Its only callers are
   * the three editors (SubjectEditor, LessonEditor, MentoringEditor), which back
   * all six create/edit routes.
   *
   * That opt-out is not cosmetic. LessonEditor and MentoringEditor pin a
   * RichTextEditor toolbar beneath an action bar whose height they MEASURE at
   * runtime, both `position: sticky` against their own ScrollArea viewport.
   * Nesting them inside a second scroller would pin them against the wrong
   * scrollport and slide the toolbar under the action bar — a bug LessonEditor
   * already documents having fixed once. A marketing-style footer on a
   * full-screen editing surface is not worth reopening it.
   */
  showFooter?: boolean;
}

function MainPageAppshell({ children, showSearch = true, showFooter = true }: MainPageAppshellProps) {
  const { user } = useUserContext();
  const fetcher = useFetcher();
  const [opened, { toggle, close }] = useDisclosure(false);

  /*
   * Release the Drawer when the viewport crosses into desktop.
   *
   * `hiddenFrom="lg"` only sets `display: none` on the Drawer's own Box, but
   * Mantine mounts `<RemoveScroll enabled={opened}>` as that Box's PARENT (see
   * ModalBase.mjs), so hiding the Drawer does not release the body scroll lock.
   * Open the Drawer at 800px, then rotate or resize past 1200px: the Drawer and
   * its close button vanish while `opened` stays true, and the page is locked
   * with nothing left on screen to unlock it — the Burger is `hiddenFrom="lg"`
   * too. Pre-existing, but every widening of this boundary widens the band it
   * can be triggered from.
   *
   * FROM_LG_QUERY rather than a max-width query: `hiddenFrom="lg"` is
   * `min-width: 75em`, and at exactly 75em a max-width query still reports
   * mobile — so the guard would miss the one width it exists for. See styles.ts.
   *
   * Nothing here is inside a `<Form method="get">`, so the never-unmount-a-field
   * rule does not apply: the Drawer's search is a separate form from the
   * header's, and closing does not submit either.
   */
  const isDesktopNav = useMediaQuery(FROM_LG_QUERY, false, { getInitialValueInEffect: false });

  // Scheme-aware logo; see useAppLogo. Used by both the header and the Drawer title.
  const logo = useAppLogo();

  useEffect(() => {
    if (isDesktopNav) {
      close();
    }
  }, [isDesktopNav, close]);

  // `close` on every link: tapping a category used to navigate and leave the
  // Drawer open over the new page. Calling it when the Drawer is already shut
  // (the header copies) is a no-op.
  const items = HEADER_LINKS.map((link) =>
    <Link
      key={link.label}
      to={link.link}
      className={classes.link}
      onClick={close}
    >
      {link.label}
    </Link>
  )

  return (
    <AppShell
      // ONE source of truth for the height. Previously this, `h` on
      // AppShell.Header and `height: 56px` in the CSS module all disagreed, and
      // the old `8dvh` resolved to ~30px on a landscape phone — enough to clip
      // the logo, the Burger and the scheme toggle.
      header={{ height: HEADER_HEIGHT }}
      h="100dvh"
    >
      {/* No `h` prop: AppShell.Header reads --app-shell-header-height from the
        * `header` config above. */}
      <AppShell.Header className={classes.header}>
        <div className={classes.inner}>
          <Group wrap="nowrap" miw={0}>
            {/* Burger and the link group are complements: the six Korean
              * categories plus logo, search, avatar and toggle need ~1180px, so
              * below `lg` the links collapse into the Drawer. The Drawer below
              * and the guard effect above must share this `lg` boundary.
              *
              * This was `md` and it was measured wrong: at 992px the links
              * appeared but had roughly 330px to fit ~470px of label, so every
              * one of them ellipsed — 물리 rendered as `물...`. All-or-nothing is
              * the right rule for labels this short. */}
            <Burger
              opened={opened}
              onClick={toggle}
              size="md"
              hiddenFrom="lg"
              aria-label="Toggle navigation"
            />
            {/* `flexShrink: 0` is not cosmetic: Mantine's Button label part is
              * `white-space: nowrap; overflow: hidden`, so once this Button is
              * allowed to shrink it silently CROPS the logo image rather than
              * scaling it. */}
            <Button component={Link} to={"/"} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
              <Image alt="logo" h={36} w="auto" src={logo} />
            </Button>
            <Group ml="xl" gap={5} className={classes.links} visibleFrom="lg">
              {items}
            </Group>
          </Group>
          <Group wrap="nowrap">
            {showSearch && (
              // Hidden rather than unmounted below `sm`, and wrapped so the
              // empty <Form> does not linger as a flex item.
              <Box visibleFrom="sm">
                <SearchForm />
              </Box>
            )}
            {/* ColorSchemeToggle takes no props (it is a fixed-size ActionIcon),
              * so the breakpoint gate goes on a wrapper rather than the
              * component. */}
            <Box visibleFrom="sm">
              <ColorSchemeToggle />
            </Box>
            {isUser(user) ? (
              <Menu shadow="md" width={240} position="bottom-end">
                <Menu.Target>
                  <Avatar src={user.pfp_url} radius="xl" size="md" style={{ cursor: 'pointer' }} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    component={Link}
                    to={`/profile/${user._id}`}
                    className={classes.menuProfileHeader}
                    styles={{ itemLabel: { display: 'flex', justifyContent: 'center' } }}
                  >
                    <Avatar src={user.pfp_url} radius="xl" size={80} />
                  </Menu.Item>
                  <Divider />
                  <Group grow gap={0} className={classes.menuActions}>
                    <Menu.Item component={Link} to="/settings" className={classes.menuActionItem}>
                      설정
                    </Menu.Item>
                    <fetcher.Form method="post" action="/action/auth/logout" style={{ flex: 1 }}>
                      <Menu.Item type="submit" component="button" className={classes.menuActionItem} style={{ width: '100%' }}>
                        로그아웃
                      </Menu.Item>
                    </fetcher.Form>
                  </Group>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs" visibleFrom="sm" wrap="nowrap">
                <UnstyledButton component={Link} className={classes.LogOutButton} to="/login" style={linkStyle}>
                  로그인
                </UnstyledButton>
              </Group>
            )}
          </Group>
        </div>

        <Drawer
          opened={opened}
          onClose={close}
          size="100%"
          padding="md"
          // Matches the Burger. If these two ever disagree there is a width band
          // where the Burger renders but the Drawer it opens is display:none.
          hiddenFrom="lg"
          position="left"
          title={<Image alt="logo" h={32} w="auto" src={logo} />}
          closeOnClickOutside
          zIndex={1000000}
        >
          <ScrollArea>
            <Divider my="sm" />
            {/* No `visibleFrom` here. The header copy is `visibleFrom="sm"` and
              * this one used to be `visibleFrom="xs"`, so below 576px there was
              * no search box anywhere in the app. */}
            <SearchForm fullWidth onSubmit={close} />
            {/* Not gated by `hiddenFrom`: the Drawer itself is already
              * `hiddenFrom="lg"`, and gating at `sm` would leave the 992–1200
              * Drawer without a toggle. */}
            <Box py="md">
              <ColorSchemeToggleFull />
            </Box>
            <Stack py="md">{items}</Stack>
            {!isUser(user) && (
              <>
                <Divider my="sm" />
                {/* The header login button is `visibleFrom="sm"`, so without
                  * this a logged-out phone user has no login affordance. */}
                <UnstyledButton
                  component={Link}
                  className={classes.LogOutButton}
                  to="/login"
                  style={linkStyle}
                  onClick={close}
                >
                  로그인
                </UnstyledButton>
              </>
            )}
            <Divider my="sm" />
          </ScrollArea>
        </Drawer>
      </AppShell.Header>

      {/*
        * `100dvh`, NOT `calc(100dvh - HEADER_HEIGHT)`: Mantine already gives
        * AppShell.Main `padding-top: calc(var(--app-shell-header-offset) +
        * var(--app-shell-padding))`, and box-sizing is border-box globally, so
        * subtracting the header a second time leaves a dead strip at the bottom
        * of every page.
        *
        * `overflow: hidden`, so exactly one scroll container must exist below
        * it — and WHEN `showFooter` IS TRUE, THE SHELL OWNS IT. Pages pass
        * plain content and must NOT wrap it in a ScrollArea of their own; a
        * second one nests two scrollbars and strands the footer inside the
        * inner viewport, where it can never reach the bottom of the page.
        *
        * It used to be the other way round: each of the 11 route files wrapped
        * itself. That could not carry a footer, because anything the shell
        * rendered after `{children}` landed OUTSIDE the page's scroller and
        * became a permanently visible bar eating viewport height. Moving the
        * scroller up here is what lets AppFooter scroll with the content — and
        * new routes inherit it without knowing it exists.
        *
        * `showFooter={false}` keeps the OLD contract for the three editors,
        * whose sticky toolbars measure against their own viewport. See the prop.
        *
        * "Page-level" is the operative word: Profile.tsx keeps a NESTED
        * ScrollArea inside its badge list, which is an inner list scroller and
        * is still allowed. Counting `<ScrollArea>` tokens per file mis-flags it.
        *
        * `scrollbarSize={10}` came from SearchResult, the only page that set
        * one; the other ten move 12px -> 10px, which is the consistent choice
        * now that a single scrollbar serves them all.
        */}
      <AppShell.Main style={{ height: "100dvh", overflow: "hidden" }}>
        {showFooter ? (
          <ScrollArea w="100%" h="100%" scrollbarSize={10}>
            {/* `.mainScrollBody` carries a one-screen min-height, so AppFooter
              * always begins below the fold and has to be scrolled to — even on
              * a page as short as /settings. Plain block flow, no flex column:
              * see Appshell.module.css for why the floor is in dvh rather than
              * the `100%` that an ancestor would need to make definite. */}
            <div className={classes.mainScrollBody}>{children}</div>
            <AppFooter />
          </ScrollArea>
        ) : (
          children
        )}
      </AppShell.Main>
    </AppShell>)
}

export default MainPageAppshell;
