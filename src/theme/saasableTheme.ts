import { createTheme } from '@mui/material/styles';

/**
 * SaasAble Free palette (Hosting theme) — adapted from
 * https://github.com/phoenixcoded/saasable-ui (admin/vite/src/themes/palette.js)
 * MUI Store: https://mui.com/store/items/saasable-free-multipurpose-ui-kit-dashboard/
 */
export const saasableTheme = createTheme({
  cssVariables: true,
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
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { margin: 0 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});
