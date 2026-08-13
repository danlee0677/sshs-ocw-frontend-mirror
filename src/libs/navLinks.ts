/**
 * Navigation link data shared by the header (MainPageAppshell) and the footer
 * sitemap (AppFooter).
 *
 * It lives here rather than in either component because both render the same six
 * subject categories. When this was a `links` array local to MainPageAppshell,
 * the only way to give the footer the same list was to copy it — and a copy of a
 * label list drifts the moment one subject is renamed.
 *
 * DATA ONLY, no components. A module that exports both would trip
 * `react-refresh/only-export-components`, the same rule that put
 * `useUserContext` and `useAppLogo` in their own files.
 */

export type NavLink = {
  /** A router path, passed straight to `<Link to>`. Never an absolute URL. */
  link: string;
  label: string;
};

/**
 * The six subject categories, as `/search` queries rather than routes of their
 * own — there is no `/subject/math` page, the category IS a tag filter.
 *
 * Annotated `NavLink[]` rather than `as const`: a readonly tuple is not
 * assignable to the mutable `links` field of the footer's column data, and
 * nothing here needs the labels as a literal union.
 */
export const SUBJECT_LINKS: NavLink[] = [
  { link: '/search?tags=Math', label: '수학' },
  { link: '/search?tags=Physics', label: '물리' },
  { link: '/search?tags=Chemistry', label: '화학' },
  { link: '/search?tags=Biology', label: '생명과학' },
  { link: '/search?tags=Earth+Science', label: '지구과학' },
  { link: '/search?tags=Informatics', label: '정보' },
];

export const MENTORING_BOARD_LINK: NavLink = {
  link: '/mentoring/board',
  label: '오프라인 멘토링',
};

/**
 * What the header nav renders, in order.
 *
 * The length is load-bearing: MainPageAppshell collapses these into the Drawer
 * below `lg` because the six categories plus logo, search, avatar and toggle
 * need ~1180px. Adding an entry here narrows that margin — re-measure the
 * breakpoint if you do.
 */
export const HEADER_LINKS: NavLink[] = [...SUBJECT_LINKS, MENTORING_BOARD_LINK];
