export type ColorMode = 'light' | 'dark';

export type FlowThemeTokens = {
  flowBg: string;
  dotColor: string;
  spatialBg: string;
  spatialFog: string;
  linkDefault: string;
  linkFaint: string;
  minimapNode: string;
  minimapMask: string;
  controlsBorder: string;
  controlsBg: string;
  controlsFill: string;
  controlsHover: string;
  minimapBg: string;
  personBg: string;
  personBorder: string;
  personText: string;
  personHighlightBg: string;
  personHighlightBorder: string;
  genderMaleBorder: string;
  genderFemaleBorder: string;
  branchStroke: string;
  spatialPersonFill: string;
  spatialPersonStroke: string;
  spatialPersonHighlightFill: string;
  spatialPersonHighlightStroke: string;
  spatialIconStroke: string;
};

export const flowTheme: Record<ColorMode, FlowThemeTokens> = {
  dark: {
    flowBg: '#121318',
    dotColor: '#2e3038',
    spatialBg: '#121318',
    spatialFog: '#121318',
    linkDefault: 'rgba(180, 182, 198, 0.25)',
    linkFaint: 'rgba(90, 92, 110, 0.18)',
    minimapNode: '#43455f',
    minimapMask: 'rgb(0 0 0 / 70%)',
    controlsBorder: '#2e3038',
    controlsBg: '#1b1b1f',
    controlsFill: '#c7c5d0',
    controlsHover: '#2e3038',
    minimapBg: '#1b1b1f',
    personBg: '#1b1b1f',
    personBorder: '#43455f',
    personText: '#e4e1e6',
    personHighlightBg: '#2a2d4a',
    personHighlightBorder: '#606bdf',
    genderMaleBorder: '#bdc2ff',
    genderFemaleBorder: '#f5a0c4',
    branchStroke: '#f0dc78',
    spatialPersonFill: '#1c1c22',
    spatialPersonStroke: 'rgba(255, 255, 255, 0.14)',
    spatialPersonHighlightFill: '#2a2d4a',
    spatialPersonHighlightStroke: 'rgba(96, 107, 223, 0.9)',
    spatialIconStroke: 'rgba(255, 255, 255, 0.35)',
  },
  light: {
    flowBg: '#f5f2fa',
    dotColor: '#9b99a8',
    spatialBg: '#f5f2fa',
    spatialFog: '#f5f2fa',
    linkDefault: 'rgba(70, 70, 79, 0.45)',
    linkFaint: 'rgba(119, 118, 128, 0.35)',
    minimapNode: '#c7c5d0',
    minimapMask: 'rgb(245 242 250 / 75%)',
    controlsBorder: '#efedf4',
    controlsBg: '#ffffff',
    controlsFill: '#46464f',
    controlsHover: '#eae7ef',
    minimapBg: '#ffffff',
    personBg: '#ffffff',
    personBorder: '#c7c5d0',
    personText: '#1b1b1f',
    personHighlightBg: '#e8eaff',
    personHighlightBorder: '#606bdf',
    genderMaleBorder: '#606bdf',
    genderFemaleBorder: '#f0b8d0',
    branchStroke: '#e6cf6a',
    spatialPersonFill: '#ffffff',
    spatialPersonStroke: 'rgba(27, 27, 31, 0.35)',
    spatialPersonHighlightFill: '#e8eaff',
    spatialPersonHighlightStroke: 'rgba(96, 107, 223, 0.95)',
    spatialIconStroke: 'rgba(70, 70, 79, 0.45)',
  },
};
