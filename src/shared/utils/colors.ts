// Colors extracted from tailwind.config.js
// These should only be used when you need actual hex values (e.g., for Icon color props)
// For styling components, use Tailwind classes instead: text-primary, bg-background, etc.
export const colors = {
  primary: '#111111',
  background: '#FFFFFF', 
  muted: '#9CA3AF',
  border: '#E5E7EB',
  accent: '#FFB020',
  white: '#FFFFFF',
  error: '#EF4444',
} as const;

export type ColorKey = keyof typeof colors;
