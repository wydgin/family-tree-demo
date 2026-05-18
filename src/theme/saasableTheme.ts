import { createTheme } from '@mui/material/styles';

/** Hosting grey scale — from saasable-ui admin/vite/src/themes/palette.js */
const hostingGrey = {
  50: '#FBF8FF',
  100: '#F5F2FA',
  200: '#EFEDF4',
  300: '#EAE7EF',
  400: '#E4E1E6',
  500: '#DBD9E0',
  600: '#C7C5D0',
  700: '#777680',
  800: '#46464F',
  900: '#1B1B1F',
};

const hostingGreyDark = {
  50: '#2A2B33',
  100: '#25262D',
  200: '#2E3038',
  300: '#35373F',
  400: '#3D3F48',
  500: '#4A4C56',
  600: '#6B6D78',
  700: '#94959F',
  800: '#C7C5D0',
  900: '#E4E1E6',
};

/**
 * SaasAble Free palette (Hosting theme) — adapted from
 * https://github.com/phoenixcoded/saasable-ui (admin/vite/src/themes/palette.js)
 * Pill nav pattern: uikit/react NavbarContent10 + NavItems
 */
export const saasableTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: '#BDC2FF',
          light: '#E0E0FF',
          dark: '#606BDF',
        },
        secondary: {
          main: '#C3C4E4',
          dark: '#5A5C78',
        },
        grey: hostingGreyDark,
        background: {
          default: '#121318',
          paper: '#1B1B1F',
        },
        text: {
          primary: '#E4E1E6',
          secondary: '#C7C5D0',
        },
        divider: '#2E3038',
      },
    },
    light: {
      palette: {
        primary: {
          main: '#606BDF',
          light: '#BDC2FF',
          dark: '#3944B8',
        },
        secondary: {
          main: '#5A5C78',
        },
        grey: hostingGrey,
        background: {
          default: '#F5F2FA',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#1B1B1F',
          secondary: '#46464F',
        },
        divider: '#EFEDF4',
      },
    },
  },
  typography: {
    fontFamily: '"Figtree", "Archivo", system-ui, sans-serif',
    h6: { fontWeight: 600, fontSize: '1.05rem' },
    body2: { fontSize: '0.8125rem' },
    caption2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.007em',
    },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
        },
        body: {
          margin: 0,
          minHeight: '100%',
        },
        '#root': {
          minHeight: '100%',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// MUI module augmentation for caption2
declare module '@mui/material/styles' {
  interface TypographyVariants {
    caption2: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    caption2?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption2: true;
  }
}
