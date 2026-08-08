import {
  ActionIcon,
  SegmentedControl,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';

/**
 * Color-scheme controls. Two variants, one behaviour.
 *
 * THE SUBTLETY THAT BITES: `useMantineColorScheme().colorScheme` can be the
 * literal string `'auto'`, which tells you nothing about what is actually on
 * screen. Only `useComputedColorScheme()` resolves that to `'light' | 'dark'`.
 * Deciding which ICON to show from `colorScheme` puts a sun on a dark page for
 * every auto user. So: `colorScheme` drives the CONTROL's state (it is the
 * three-way setting), `computed` drives the ICON.
 *
 * `getInitialValueInEffect: false` is safe here. This app is a SPA and this
 * component never appears in the prerendered shell, so a synchronous first read
 * has nothing to mismatch against, and it avoids an icon flicker on every load.
 * Switch back to the default (`true`) only if a real problem shows up.
 */

/** Compact sun/moon button for the header bar (`sm` and up). */
export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', {
    getInitialValueInEffect: false,
  });

  const isDark = computed === 'dark';
  // Label the ACTION, not the current state — "다크 모드" on a button that
  // switches to light mode is the classic ambiguity.
  const label = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';

  // Tapping the compact control moves between the two explicit schemes. It never
  // lands on 'auto'; that is what the full control is for. But if the user IS on
  // 'auto', the first tap should pin the OPPOSITE of what they are seeing.
  const next = isDark ? 'light' : 'dark';

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        variant='default'
        size='lg'
        radius='md'
        aria-label={label}
        aria-pressed={colorScheme === 'dark'}
        onClick={() => setColorScheme(next)}
      >
        {isDark ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
      </ActionIcon>
    </Tooltip>
  );
}

const OPTIONS = [
  { value: 'light', label: '라이트', icon: IconSun },
  { value: 'dark', label: '다크', icon: IconMoon },
  { value: 'auto', label: '자동', icon: IconDeviceDesktop },
] as const;

/**
 * Labelled three-way control for the mobile Drawer and the Settings page, where
 * there is room for the explicit choice and an unlabelled icon would be
 * ambiguous. Full width so it clears the 44px tap-target rule on touch.
 */
export function ColorSchemeToggleFull() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      fullWidth
      size='md'
      radius='md'
      value={colorScheme}
      onChange={(value) => setColorScheme(value as MantineColorScheme)}
      data={OPTIONS.map(({ value, label, icon: Icon }) => ({
        value,
        label: (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: 28,
            }}
          >
            <Icon size={16} stroke={1.5} />
            {label}
          </span>
        ),
      }))}
    />
  );
}

export default ColorSchemeToggle;
