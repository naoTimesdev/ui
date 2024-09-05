import type { Config } from "tailwindcss";
import type { PluginCreator } from "tailwindcss/types/config";
import animate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";
import defaultTheme from "tailwindcss/defaultTheme";

import postcss from "postcss";
import postcssJS from "postcss-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function approxRemToPx(rem: number): string {
  return Math.round(rem * 16).toString();
}

function cssImportPlugin(cssPath: string): PluginCreator {
  // get current file dir, do not use process.cwd() because it will be different
  // and we can't use import.meta.url because it's not a module

  const fullPath = join(__dirname, cssPath);

  if (!fullPath.endsWith(".css")) {
    throw new Error("cssImportPlugin: path must be a .css file");
  }

  if (!existsSync(fullPath)) {
    throw new Error(`cssImportPlugin: file not found at ${fullPath}`);
  }

  return ({ addBase, addComponents, addUtilities }) => {
    const css = readFileSync(fullPath, "utf8");

    const root = postcss.parse(css);
    const jss = postcssJS.objectify(root);

    if (jss["@layer base"]) {
      addBase(jss["@layer base"]);
    }

    if (jss["@layer components"]) {
      addComponents(jss["@layer components"]);
    }

    if (jss["@layer utilities"]) {
      addUtilities(jss["@layer utilities"]);
    }
  };
}

export default {
  content: [
    "./assets/**/*.{js,css,scss,html}",
    "./components/**/*.{js,ts,vue}",
    "./composables/**/*.{js,ts,vue}",
    "./layouts/**/*.{js,ts,vue}",
    "./middleware/**/*.{js,ts,vue}",
    "./pages/**/*.{js,ts,vue}",
    "./utils/**/*.{js,ts,vue}",
    "./content/**/*.{md,mdx,json,yaml,yml}",
    "./app.vue",
    "./error.vue",
  ],
  prefix: "",
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        monospace: ["Monaspace Xenon Var VF", "Monaspace Xenon", ...defaultTheme.fontFamily.mono],
        sans: ["Monaspace Neon Var VF", "Monaspace Neon", ...defaultTheme.fontFamily.sans],
        custom: ["Monaspace Neon", "Monaspace Xenon", "Monaspace Neon Var VF", "Monaspace Xenon Var VF"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-in-out",
        "collapsible-up": "collapsible-up 0.2s ease-in-out",
      },
    },
  },
  plugins: [
    animate,
    cssImportPlugin("./assets/css/components/autolink.css"),
    cssImportPlugin("./assets/css/components/glow-text.css"),
    cssImportPlugin("./assets/css/components/monaspace.css"),
    plugin(({ addComponents, addUtilities, matchUtilities, theme }) => {
      // Variable fonts
      addComponents({
        ".font-variable": {
          "font-variation-settings":
            "'wght' var(--font-variable-wght), 'slnt' var(--font-variable-slnt), 'opsz' var(--font-variable-opsz), 'wdth' var(--font-variable-wdth), 'ital' var(--font-variable-ital)",
          "font-weight": "var(--font-variable-wght)",
          "font-style": "oblique var(--font-variable-slnt)deg",
          "font-optical-sizing": "var(--font-variable-opsz)",
          "font-stretch": "var(--font-variable-wdth)%",
          // default values
          "--font-variable-wght": "400",
          "--font-variable-slnt": "0",
          "--font-variable-opsz": "100",
          "--font-variable-wdth": "100",
          "--font-variable-ital": "0",
        },
      });

      addUtilities({
        ".font-variable-italic": {
          "font-style": "italic",
          "--font-variable-ital": "1",
        },
      });

      matchUtilities(
        {
          "variation-weight": (value) => ({
            "--font-variable-wght": value,
          }),
        },
        {
          values: theme("fontWeight"),
        }
      );

      matchUtilities(
        {
          "variation-slant": (value) => ({
            "--font-variable-slnt": value,
          }),
        },
        {
          // 0 to 20, step 5
          values: {
            ...Object.fromEntries(Array.from({ length: 5 }, (_, i) => [i * 5, (i * 5).toString()])),
          },
        }
      );

      matchUtilities(
        {
          "variation-optical": (value) => ({
            "--font-variable-opsz": value,
          }),
        },
        {
          // similar to fontSize
          values: {
            ...Object.fromEntries(
              // @ts-expect-error A bit of a hack to get the type right
              Object.entries(theme("fontSize")).map(([key, value]) => [
                key,
                approxRemToPx(Number.parseFloat(value[0].replace("rem", ""))),
              ])
            ),
          },
        }
      );

      matchUtilities(
        {
          "variation-width": (value) => ({
            "--font-variable-wdth": value,
          }),
        },
        {
          values: {
            normal: "100",
            condensed: "75",
            compressed: "50",
            stretch: "125",
            extended: "150",
          },
        }
      );
    }),
  ],
  safelist: [
    "dark",
    "inline-block",
    "variation-width-stretch",
    {
      pattern: /^tracking-.*/,
    },
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "variation-*",
  ],
} as Partial<Config>;
