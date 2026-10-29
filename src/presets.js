// each preset = fonts + corner shapes + a palette for dark mode and for light mode
// "classic" is not listed: it uses the colours already in site_settings
export const PRESETS = {
  magazine: {
    head: "'DM Serif Display', 'Noto Serif Devanagari', serif",
    body: "'Inter', 'Noto Sans Devanagari', sans-serif",
    radius: '0px',
    btn: '0px',
    fonts: 'family=DM+Serif+Display',
    dark: { bg: '#0b0b0b', text: '#f5f5f5', accent: '#ededed', hero: '#0b0b0b' },
    light: { bg: '#ffffff', text: '#0b0b0b', accent: '#8a8a8a', hero: '#0b0b0b' },
  },
  pastel: {
    head: "'Fraunces', 'Noto Serif Devanagari', serif",
    body: "'Nunito', 'Noto Sans Devanagari', sans-serif",
    radius: '28px',
    btn: '50px',
    fonts: 'family=Fraunces:wght@500;600;700&family=Nunito:wght@300;400;600',
    dark: { bg: '#1d1626', text: '#f7ecf3', accent: '#ff9ec7', hero: '#2a1d33' },
    light: { bg: '#fff7f2', text: '#3b2a3d', accent: '#d9588a', hero: '#2a1d33' },
  },
  neon: {
    head: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    body: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    radius: '6px',
    btn: '8px',
    fonts: 'family=Space+Grotesk:wght@400;500;600;700',
    dark: { bg: '#07070d', text: '#eafff7', accent: '#00f0a8', hero: '#06060c' },
    light: { bg: '#f2fff9', text: '#07211a', accent: '#00a676', hero: '#06060c' },
  },
}

// the fonts of a preset are loaded only when that preset is used
const loaded = new Set()
export function loadFonts(query) {
  if (!query || loaded.has(query) || typeof document === 'undefined') return
  loaded.add(query)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`
  document.head.appendChild(link)
}