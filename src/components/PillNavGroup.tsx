import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';

import { useAppColorMode } from '../theme/ColorModeProvider';

export type PillNavItem<T extends string = string> = {
  value: T;
  label: string;
};

type PillNavGroupProps<T extends string> = {
  value: T;
  items: PillNavItem<T>[];
  onChange: (value: T) => void;
  'aria-label': string;
};

/**
 * Pill nav — adapted from saasable-ui NavbarContent10 + NavItems
 * (uikit/react/src/blocks/navbar/navbar-content/NavbarContent10.jsx)
 */
export function PillNavGroup<T extends string>({
  value,
  items,
  onChange,
  'aria-label': ariaLabel,
}: PillNavGroupProps<T>) {
  const theme = useTheme();
  const { mode } = useAppColorMode();
  const isDark = mode === 'dark';

  return (
    <Stack
      direction="row"
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        bgcolor: 'grey.200',
        borderRadius: 50,
        p: 0.5,
        gap: 0.25,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark
          ? 'none'
          : `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`,
      }}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Button
            key={item.value}
            role="tab"
            aria-selected={selected}
            size="small"
            disableElevation
            onClick={() => onChange(item.value)}
            sx={{
              py: 1.25,
              px: { xs: 2, sm: 2.75 },
              minWidth: 0,
              borderRadius: 50,
              typography: 'caption2',
              fontWeight: selected ? 600 : 500,
              color: selected
                ? 'primary.main'
                : isDark
                  ? 'grey.800'
                  : 'text.primary',
              bgcolor: selected
                ? isDark
                  ? 'grey.400'
                  : 'background.paper'
                : 'transparent',
              boxShadow: selected && !isDark
                ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`
                : 'none',
              '&:hover': {
                bgcolor: selected
                  ? isDark
                    ? 'grey.400'
                    : 'background.paper'
                  : isDark
                    ? alpha(theme.palette.common.white, 0.06)
                    : alpha(theme.palette.common.black, 0.04),
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Stack>
  );
}
