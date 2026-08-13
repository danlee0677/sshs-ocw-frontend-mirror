import { Box, Group, Image, Stack, Text } from "@mantine/core";
import { Link } from "react-router";
// Imported DIRECTLY, not merged with a page module. `.Box2`, `.Vertical_align`
// and `.Image1` all live in shared.module.css, and a CSS Module import whose
// bindings are used is what keeps those rules in this component's chunk — see
// the "HOW CONSUMERS REACH THESE" note at the top of that file.
import classes from "../../styles/shared.module.css";
import { linkStyle } from "../../libs/styles";
import { PLACEHOLDER_SUBJECT } from "../../libs/utils";

/**
 * Thumbnail edge, in px. 56 rather than the 75 Home used to pass: at 75 the
 * padding below would take rows to 91px and grow Home's card by ~76px.
 */
export const SUBJECT_ROW_THUMB = 56;

/**
 * Row floor, in px. DERIVED: thumbnail + `p="xs"` (8px) top and bottom. Keep the
 * arithmetic if either half changes — Home's empty placeholder rows import this
 * so their rhythm matches the real ones, and a floor that disagrees with the
 * real content height is the `mih={64}` bug this replaced.
 */
export const SUBJECT_ROW_HEIGHT = SUBJECT_ROW_THUMB + 16;

type SubjectRowProps = {
  /** Where the thumbnail and the title link. */
  to: string;
  imageUrl: string | null;
  title: string;
  /** Second line: a lesson title on Home/Profile-recent, a description on Profile-liked. */
  subtitle: string;
  /** Omit to render `subtitle` as plain text rather than a second link. */
  subtitleTo?: string;
};

/**
 * One subject row: thumbnail, bold title, secondary line.
 *
 * EXTRACTED FROM THREE COPIES — Home's recent-lessons list and both of Profile's
 * cards. That duplication was not harmless: Profile's copy drifted to
 * `w='auto' h='100%'` on the Image, and because every containing block above it
 * was auto-height BOTH axes resolved to `auto`, so the <img> rendered at its
 * natural size (474x531 for the current subject art). Rows were several hundred
 * px tall and a different height per subject, while Home's copy stayed correct.
 * One component is what stops that happening again.
 *
 * TWO FIXED PIXEL DIMENSIONS on the Image, therefore, and `fit="cover"` — a
 * portrait source is cropped to the square rather than letterboxed into it,
 * which is what `fit="contain"` would do. `fallbackSrc` because `image_url` can
 * be absent, which rendered a broken-image icon.
 *
 * LAYOUT. The Group is `w="100%"`, NOT the `w="80%"` this replaced. That 80% sat
 * inside `.Vertical_align`'s `justify-content: center`, so it lost 10% off each
 * side — ~48px on Home and ~70px on Profile once `px="md"` was added on top,
 * which is what made the thumbnails look deeply indented against their section
 * titles. With the Group full-width that `justify-content` has nothing to
 * distribute and goes inert; `align-items: center` still does the vertical
 * centring, which is why the class stays on the Box.
 *
 * `miw={0}` in two places is load-bearing for `truncate`: an ellipsis needs every
 * ancestor between the flex container and the Text to be allowed to shrink below
 * its content width. At 80% there was slack to hide a missing one; at 100% there
 * is not.
 */
export function SubjectRow({ to, imageUrl, title, subtitle, subtitleTo }: SubjectRowProps) {
  return (
    <Box className={`${classes.Box2} ${classes.Vertical_align}`} w="100%" mih={SUBJECT_ROW_HEIGHT} miw={0}>
      <Group wrap="nowrap" w="100%" p="xs" miw={0}>
        {/* Plain style object, not Mantine props: this is react-router's Link, so
          * `display`/`align` props would land as bogus DOM attributes. No
          * `height: '100%'` — it was here in both originals and resolved to
          * `auto` in each, since nothing above it has a definite height. */}
        <Link to={to} style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            fit="cover"
            w={SUBJECT_ROW_THUMB}
            h={SUBJECT_ROW_THUMB}
            src={imageUrl ?? undefined}
            // `?? undefined` because subjectSchema declares image_url
            // `.nullable()` (types.ts:75), so the constant is typed
            // `string | null` while Image's prop is `string | undefined`.
            fallbackSrc={PLACEHOLDER_SUBJECT.image_url ?? undefined}
            className={classes.Image1}
          />
        </Link>
        {/* `style={linkStyle}` rather than no color at all: nothing in index.css
          * or Mantine's baseline resets anchors, so an unstyled <a> falls back to
          * UA link blue. `color: 'inherit'` is scheme-safe. */}
        <Stack gap={0} miw={0}>
          <Link to={to} style={linkStyle}>
            <Text truncate fw={'bold'}>{title}</Text>
          </Link>
          {/* Plain Text when there is nowhere else to go. The liked-subjects list
            * shows a description here, and wrapping it in a second Link to the
            * SAME subject would put two adjacent identical links in the row —
            * an accessibility smell with no navigational gain. */}
          {subtitleTo
            ? (
              <Link to={subtitleTo} style={linkStyle}>
                <Text truncate>{subtitle}</Text>
              </Link>
            )
            : <Text truncate>{subtitle}</Text>}
        </Stack>
      </Group>
    </Box>
  );
}
