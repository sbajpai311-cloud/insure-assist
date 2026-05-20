// SC Mobile Color Palette — extracted from sc.com/in
export const theme = {
  colors: {
    tealPrimary:  '#00AAB5',   // Primary brand teal
    tealDark:     '#007E87',   // Darker teal for hover/active
    tealLight:    '#E6F7F8',   // Teal wash backgrounds
    navy:         '#1A2B4A',   // Deep navy for headings
    white:        '#FFFFFF',
    grey100:      '#F5F6F7',   // Page backgrounds
    grey300:      '#C8CDD3',   // Borders
    grey600:      '#6B7280',   // Body text secondary
    grey900:      '#1F2937',   // Body text primary
    success:      '#16A34A',
    warning:      '#D97706',
    error:        '#DC2626',
    goldAccent:   '#B8860B',   // Premium/featured highlight
  },
  fonts: {
    display: 'Merriweather',
    body:    'System',
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

export type Theme = typeof theme;
