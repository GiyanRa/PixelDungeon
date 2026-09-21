export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  // Apply Colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-text', theme.colors.text);
  
  // Apply Fonts
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);
  
  // Load Fonts dynamically
  loadGoogleFonts([theme.fonts.heading, theme.fonts.body]);
};

const loadGoogleFonts = (fonts) => {
  const linkId = 'dynamic-google-fonts';
  let link = document.getElementById(linkId);
  
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  
  // Create Google Fonts URL (e.g., family=Inter:wght@400;700&family=Roboto:wght@400;700)
  const fontFamilies = fonts.map(font => font.replace(/ /g, '+') + ':wght@400;500;600;700').join('&family=');
  const href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
  
  link.href = href;
};

export const generateTailwindConfig = (theme) => {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: '${theme.colors.primary}',
          secondary: '${theme.colors.secondary}',
          accent: '${theme.colors.accent}',
          background: '${theme.colors.background}',
          text: '${theme.colors.text}',
        }
      },
      fontFamily: {
        heading: ['"${theme.fonts.heading}"', 'sans-serif'],
        body: ['"${theme.fonts.body}"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}`;
};

export const generateCssVariables = (theme) => {
  return `:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};
  
  --font-heading: '${theme.fonts.heading}';
  --font-body: '${theme.fonts.body}';
}`;
};
