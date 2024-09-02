import { rm } from "node:fs/promises";
import { join } from "node:path";
import type { LocaleObject } from "@nuxtjs/i18n";

const ipxModifiers = {
  format: "webp",
  quality: "90",
};

const locales: LocaleObject[] = [
  {
    code: "id",
    language: "id-ID",
    name: "Bahasa Indonesia",
    file: "id.json",
  },
  {
    code: "en",
    language: "en-US",
    name: "English",
    file: "en.json",
  },
];
const defaultLocale = "id";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxtjs/i18n",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@vueuse/nuxt",
    "@pinia/nuxt",
  ],
  app: {
    head: {
      title: "naoTimesUI",
      meta: [
        {
          "http-equiv": "x-ua-compatible",
          content: "IE=edge",
        },
        {
          name: "apple-mobile-web-app-title",
          content: "naoTimesUI",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "application-name",
          content: "naoTimesUI",
        },
        // {
        //   name: "msapplication-TileColor",
        //   content: "#171717",
        // },
        // {
        //   name: "msapplication-TileImage",
        //   content: "/assets/favicons/mstile-150x150.png",
        // },
      ],
      link: [
        // {
        //   rel: "shortcut icon",
        //   href: "/favicon.ico",
        // },
        // {
        //   rel: "apple-touch-icon",
        //   sizes: "180x180",
        //   href: "/assets/favicons/apple-touch-icon.png",
        // },
        // {
        //   rel: "icon",
        //   type: "image/png",
        //   sizes: "512x512",
        //   href: "/assets/favicons/android-chrome-512x512.png",
        // },
        // {
        //   rel: "icon",
        //   type: "image/png",
        //   sizes: "192x192",
        //   href: "/assets/favicons/android-chrome-192x192.png",
        // },
        // {
        //   rel: "icon",
        //   type: "image/png",
        //   sizes: "96x96",
        //   href: "/assets/favicons/android-chrome-96x96.png",
        // },
        // {
        //   rel: "icon",
        //   type: "image/png",
        //   sizes: "32x32",
        //   href: "/assets/favicons/favicon-32x32.png",
        // },
        // {
        //   rel: "icon",
        //   type: "image/png",
        //   sizes: "32x32",
        //   href: "/assets/favicons/favicon-32x32.png",
        // },
        // {
        //   rel: "icon",
        //   type: "image/png",
        //   sizes: "16x16",
        //   href: "/assets/favicons/favicon-16x16.png",
        // },
        // {
        //   rel: "icon",
        //   type: "image/png",
        //   href: "/assets/favicons/android-chrome-192x192.png",
        // },
        // {
        //   rel: "manifest",
        //   href: "/site.webmanifest",
        // },
        // {
        //   rel: "mask-icon",
        //   href: "/assets/favicons/safari-pinned-tab.svg",
        //   color: "#c2410c",
        // },
      ],
      script: [
        {
          src: "https://tr.n4o.xyz/js/37a79777T080eR4f52A99e2Ica9619a85a5d.js",
          defer: true,
          async: true,
          "data-domain": new URL(import.meta.env.DOMAIN_URL || "https://panel.naoti.me").hostname,
          "data-api": "https://tr.n4o.xyz/magic/18c5dcddMc036A4d1dGb785Iaa2e310238c9",
        },
      ],
    },
  },
  imports: {
    imports: [
      {
        name: "FetchError",
        from: "ofetch",
      },
    ],
  },
  i18n: {
    strategy: "prefix_except_default",
    baseUrl: import.meta.env.DOMAIN_URL || "https://panel.naoti.me",
    detectBrowserLanguage: false,
    langDir: "locales",
    defaultLocale,
    locales,
  },
  fonts: {
    families: [
      {
        // Main font
        name: "Monaspace Xenon",
        provider: "fontsource",
        weights: ["200", "300", "400", "500", "600", "700", "800"],
      },
      {
        // Codeblock font
        name: "Monaspace Neon",
        provider: "fontsource",
        weights: ["400", "600", "700", "800"],
      },
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  colorMode: {
    preference: "system",
    fallback: "dark",
    classSuffix: "",
    storageKey: "naotimesui.colorMode",
  },
  pinia: {
    storesDirs: ["./stores/**"],
  },
  image: {
    ipx: {
      modifiers: ipxModifiers,
    },
    ipxStatic: {
      modifiers: ipxModifiers,
    },
    static: {
      modifiers: ipxModifiers,
    },
    providers: {
      none: {
        name: "none",
        provider: "~/providers/img-none.ts",
      },
    },
  },
  hooks: {
    "nitro:config": () => {
      // verify defaultLocale is in locales early
      if (!locales.map((locale) => locale.code).includes(defaultLocale)) {
        throw new Error(`defaultLocale ${defaultLocale} is not in locales`);
      }
    },
    "nitro:build:public-assets": async (nitro) => {
      // Do not run on dev mode
      if (nitro.options.dev) {
        return;
      }

      // Do not run if no public dir (similar behaviour from `copyPublicAssets`)
      if (nitro.options.noPublicDir) {
        return;
      }

      // Get all pregenerated images
      const pregenIpxImages = nitro._prerenderedRoutes?.filter(
        (route) =>
          route.route.startsWith("/_ipx/") &&
          !route.route.startsWith("/_ipx/_/") &&
          route.route.includes("/assets/images/")
      );

      if (pregenIpxImages && pregenIpxImages.length) {
        nitro.logger.info(`Removing original images of ${pregenIpxImages.length} pre-generated IPX images`);

        // Get public output dir
        const nitroPublicDir = nitro.options.output.publicDir;

        // Delete all original images that got pregenerated
        const actualImagesPath = pregenIpxImages.map((route) => {
          // ipx fileName format are '/_ipx/f_webp&q_90/assets/images/kidoworkshop1/img-hero.png'
          // remove '/_ipx/xxxxxx/' part
          const cleanedPath = (route.fileName ?? route.route).replace(/^\/_ipx\/[^/]+\//, "/");

          // Transform into {PUBLID_DIR}/{ACTUAL_PATH}
          return join(nitroPublicDir, cleanedPath);
        });

        for (const path of actualImagesPath) {
          // Delete file
          await rm(path);
        }

        nitro.logger.info(`Deleted ${actualImagesPath.length} from ${nitroPublicDir}`);
      }
    },
  },
});

