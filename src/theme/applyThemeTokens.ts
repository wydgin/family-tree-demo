import { flowTheme, type ColorMode } from './flowTheme';

export const COLOR_MODE_STORAGE_KEY = 'family-tree-color-mode';

/** Push flow + canvas tokens to :root so every view shares one theme system. */
export function applyThemeTokens(mode: ColorMode) {
  const t = flowTheme[mode];
  const root = document.documentElement;

  root.setAttribute('data-mui-color-scheme', mode);
  root.style.colorScheme = mode;

  root.style.setProperty('--flow-bg', t.flowBg);
  root.style.setProperty('--flow-dot', t.dotColor);
  root.style.setProperty('--spatial-bg', t.spatialBg);
  root.style.setProperty('--spatial-fog', t.spatialFog);
  root.style.setProperty('--link-default', t.linkDefault);
  root.style.setProperty('--link-faint', t.linkFaint);
  root.style.setProperty('--minimap-node', t.minimapNode);
  root.style.setProperty('--minimap-mask', t.minimapMask);
  root.style.setProperty('--person-bg', t.personBg);
  root.style.setProperty('--person-border', t.personBorder);
  root.style.setProperty('--person-text', t.personText);
  root.style.setProperty('--person-highlight-bg', t.personHighlightBg);
  root.style.setProperty('--person-highlight-border', t.personHighlightBorder);
  root.style.setProperty('--controls-border', t.controlsBorder);
  root.style.setProperty('--controls-bg', t.controlsBg);
  root.style.setProperty('--controls-fill', t.controlsFill);
  root.style.setProperty('--controls-hover', t.controlsHover);
  root.style.setProperty('--minimap-bg', t.minimapBg);
  root.style.setProperty('--gender-male-border', t.genderMaleBorder);
  root.style.setProperty('--gender-female-border', t.genderFemaleBorder);
  root.style.setProperty('--branch-stroke', t.branchStroke);
}
