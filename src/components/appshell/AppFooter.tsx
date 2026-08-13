import { Container, Text, Title } from '@mantine/core';
import { Link } from 'react-router';
import classes from './AppFooter.module.css';
import { useUserContext } from '../../libs/useUserContext';
import { isUser } from '../../libs/utils';
import { MENTORING_BOARD_LINK, SUBJECT_LINKS, type NavLink } from '../../libs/navLinks';

type LinkGroup = {
  title: string;
  links: NavLink[];
};

/**
 * Site-wide footer: sitemap, copyright, build version.
 *
 * Adapted from the Mantine UI "Footer links" example. The structure and class
 * names are that example's; see AppFooter.module.css for the four deviations,
 * and note the two here:
 *
 *   - the example's links are `<Text component="a" href="#">` with
 *     `event.preventDefault()` — inert demo stubs. These are react-router
 *     `<Link>`s and actually navigate, so client-side routing is preserved and
 *     the footer does not full-reload the SPA;
 *   - `MantineLogo` is replaced by a plain wordmark `<Title>`, NOT by the
 *     `useAppLogo()` image the header uses. Deliberate: a wordmark inherits
 *     `--mantine-color-text` and is therefore correct in both schemes for free,
 *     with no second image request and no `useComputedColorScheme` call site to
 *     keep in sync. If this ever becomes an image again, use `useAppLogo()` —
 *     never import the PNG directly, or the footer will show the light logo on
 *     a dark page.
 *
 * NO PROPS. It reads `useUserContext()` itself, like MainPageAppshell, so
 * mounting it needs no threading through the 13 pages that render the shell.
 *
 * Rendered once, by MainPageAppshell, inside the shell's ScrollArea — never by
 * a page directly. Do not add it to LessonViewerAppshell or the editor routes:
 * those are immersive working surfaces.
 */
function AppFooter() {
  const { user } = useUserContext();

  /*
   * The account column is the only auth-dependent one, so `data` is built per
   * render rather than at module scope.
   *
   * `isUser` rather than a truthiness check: it also rejects a User-shaped
   * object with an empty `_id`, which is what would otherwise produce a
   * `/profile/` link pointing at nothing.
   */
  const accountLinks: NavLink[] = isUser(user)
    ? [
      { link: `/profile/${user._id}`, label: '내 프로필' },
      { link: '/settings', label: '설정' },
      // Mirrors FloatingActionButton's gate on the home page: creating content
      // is for admins and creators. Linking it to everyone else would advertise
      // a route that redirects them straight back out.
      ...(user.roles.includes('admin') || user.roles.includes('creator')
        ? [{ link: '/subject/create', label: '과목 만들기' }]
        : []),
      ...(user.roles.includes('admin')
        ? [{ link: '/admin', label: '관리자' }]
        : []),
    ]
    : [{ link: '/login', label: '로그인' }];

  const data: LinkGroup[] = [
    { title: '과목', links: SUBJECT_LINKS },
    {
      title: '서비스',
      links: [
        // `/home` throws a redirect to `/` for anonymous visitors (see Home's
        // clientLoader), so pointing them straight at `/` skips a round trip
        // that would look like a broken link on a slow connection.
        { link: isUser(user) ? '/home' : '/', label: '홈' },
        { link: '/search', label: '강의 검색' },
        MENTORING_BOARD_LINK,
      ],
    },
    { title: '내 계정', links: accountLinks },
  ];

  const groups = data.map((group) => (
    <div className={classes.wrapper} key={group.title}>
      <Text className={classes.title}>{group.title}</Text>
      {group.links.map((link) => (
        <Link key={link.link} to={link.link} className={classes.link}>
          {link.label}
        </Link>
      ))}
    </div>
  ));

  return (
    <footer className={classes.footer}>
      {/* Bare <Container>, no `size`: root.tsx defaults it to CONTENT_MAX_WIDTH
        * (1200) plus px='md', so the footer lines up with every page body.
        * `size="lg"` would silently mean 1140 and misalign by 60px. */}
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Title order={2}>SSHS TIPS</Title>
          <Text size="xs" c="dimmed" className={classes.description}>
            서울과학고등학교 Teachers-in-Peers
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>

      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © 2025-26 서울과학고등학교 학생회 정보부. All rights reserved.
        </Text>
        {/* Substituted at build time by vite.config.ts's `define`; the
          * `declare const` that makes it type-check lives in vite-env.d.ts. */}
        <Text size="xs" c="dimmed" className={classes.version}>
          v{__APP_VERSION__}
        </Text>
      </Container>
    </footer>
  );
}

export default AppFooter;
