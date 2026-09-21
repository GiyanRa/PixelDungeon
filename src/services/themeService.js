// Mock AI Service for Theme Generation

const MOCK_THEMES = {
  "default": {
    colors: {
      primary: "#8b5cf6",
      secondary: "#ec4899",
      accent: "#06b6d4",
      background: "#0f172a",
      text: "#f8fafc",
    },
    fonts: {
      heading: "Outfit",
      body: "Inter",
    }
  },
  "retro": {
    colors: {
      primary: "#ff007f",
      secondary: "#7df9ff",
      accent: "#fce205",
      background: "#2b00ff",
      text: "#ffffff",
    },
    fonts: {
      heading: "Press Start 2P",
      body: "Roboto Mono",
    }
  },
  "nature": {
    colors: {
      primary: "#2e8b57",
      secondary: "#8fbc8f",
      accent: "#d8bfd8",
      background: "#f0fff0",
      text: "#2f4f4f",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
    }
  },
  "corporate": {
    colors: {
      primary: "#005b96",
      secondary: "#03396c",
      accent: "#b3cde0",
      background: "#ffffff",
      text: "#333333",
    },
    fonts: {
      heading: "Montserrat",
      body: "Open Sans",
    }
  },
  "pastel": {
    colors: {
      primary: "#ffb3ba",
      secondary: "#ffdfba",
      accent: "#ffffba",
      background: "#fafafa",
      text: "#5c5c5c",
    },
    fonts: {
      heading: "Quicksand",
      body: "Nunito",
    }
  }
};

const getRandomHex = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

const fontPairs = [
  { heading: "Outfit", body: "Inter" },
  { heading: "Playfair Display", body: "Lora" },
  { heading: "Montserrat", body: "Open Sans" },
  { heading: "Quicksand", body: "Nunito" },
  { heading: "Poppins", body: "Roboto" }
];

const generateRandomTheme = (index) => {
  const categories = ['retro', 'nature', 'corporate', 'pastel', 'popular', 'new', 'primary', 'secondary', 'tertiary'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const fontPair = fontPairs[Math.floor(Math.random() * fontPairs.length)];
  return {
    id: `theme-${index + 1}`,
    category: randomCategory,
    colors: {
      primary: getRandomHex(),
      secondary: getRandomHex(),
      accent: getRandomHex(),
      background: getRandomHex(),
      text: getRandomHex(),
    },
    fonts: fontPair
  };
};

// Generate 1000 themes once and cache them
const GENERATED_THEMES = Array.from({ length: 1000 }, (_, i) => generateRandomTheme(i));

/**
 * Returns all default mock themes + 1000 random themes.
 */
export const getAllThemes = () => {
  const defaultThemes = Object.entries(MOCK_THEMES).map(([id, theme]) => ({
    id,
    category: id,
    ...theme
  }));
  
  return [...defaultThemes, ...GENERATED_THEMES];
};

/**
 * Simulates calling an AI API to generate a theme based on a prompt.
 * @param {string} prompt 
 * @returns {Promise<Object>} The generated theme object
 */
export const generateTheme = async (prompt) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      let selectedTheme = MOCK_THEMES.default;
      
      if (lowerPrompt.includes("retro") || lowerPrompt.includes("80s")) {
        selectedTheme = MOCK_THEMES.retro;
      } else if (lowerPrompt.includes("nature") || lowerPrompt.includes("forest") || lowerPrompt.includes("earth")) {
        selectedTheme = MOCK_THEMES.nature;
      } else if (lowerPrompt.includes("corporate") || lowerPrompt.includes("business") || lowerPrompt.includes("finance")) {
        selectedTheme = MOCK_THEMES.corporate;
      } else if (lowerPrompt.includes("pastel") || lowerPrompt.includes("soft") || lowerPrompt.includes("kids")) {
        selectedTheme = MOCK_THEMES.pastel;
      } else {
        // Just generate a random theme for unknown prompts
        selectedTheme = generateRandomTheme(Math.floor(Math.random() * 10000));
      }
      
      resolve({
        id: `ai-${Date.now()}`,
        ...selectedTheme
      });
    }, 1500); // Simulate network latency
  });
};
