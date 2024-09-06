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
    dir: "ltr",
  },
  {
    code: "en",
    language: "en-US",
    name: "English",
    file: "en.json",
    dir: "ltr",
  },
  {
    code: "ja",
    language: "ja-JP",
    name: "日本語",
    file: "ja.json",
    dir: "ltr",
  },
  {
    code: "jv",
    language: "jv-ID",
    name: "Jawa",
    file: "jv.json",
    dir: "ltr",
  },
  {
    code: "su",
    language: "su-ID",
    name: "Sunda",
    file: "su.json",
    dir: "ltr",
  },
  {
    code: "ms",
    language: "ms-MY",
    name: "Bahasa Melayu",
    file: "ms.json",
    dir: "ltr",
  },
  {
    code: "ms-Arab",
    language: "ms-MY-Arab",
    name: "بهاس ملايو",
    file: "ms-Arab.json",
    dir: "rtl",
  },
];
const defaultLocale = "id";

function getWsEndpoint(originalUrl: string) {
  if (!originalUrl) {
    return "";
  }

  const url = new URL(originalUrl);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return url.toString();
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/i18n",
    "radix-vue/nuxt",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/apollo",
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
        {
          name: "msapplication-TileColor",
          content: "#fd8455",
        },
        {
          name: "msapplication-TileImage",
          content: "/assets/favicons/ms-icon-144x144.png",
        },
        {
          name: "theme-color",
          content: "#fd8455",
        },
      ],
      link: [
        {
          rel: "shortcut icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/assets/favicons/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          href: "/assets/favicons/android-chrome-512x512.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/assets/favicons/android-chrome-192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "96x96",
          href: "/assets/favicons/android-chrome-96x96.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/assets/favicons/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/assets/favicons/favicon-16x16.png",
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/assets/favicons/android-chrome-192x192.png",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
        {
          rel: "mask-icon",
          href: "/assets/favicons/safari-pinned-tab.svg",
          color: "#fd8455",
        },
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
    autoImport: true,
    scan: true,
  },
  components: [
    {
      path: "~/components/ui",
      prefix: "UI",
    },
    "~/components",
  ],
  runtimeConfig: {
    public: {
      apiUrl: import.meta.env.API_URL || "https://api.naoti.me",
      cdnUrl: import.meta.env.CDN_URL || import.meta.env.API_URL || "https://api.naoti.me",
      meiliUrl: import.meta.env.MEILI_URL || "https://msapi.naoti.me",
      meiliKey: import.meta.env.MEILI_KEY,
      domainUrl: import.meta.env.DOMAIN_URL || "https://panel.naoti.me",
    },
    meiliPrivateKey: import.meta.env.MEILI_KEY,
    apiPrivateKey: import.meta.env.API_KEY,
  },
  i18n: {
    strategy: "no_prefix",
    baseUrl: import.meta.env.DOMAIN_URL || "https://panel.naoti.me",
    detectBrowserLanguage: false,
    langDir: "locales",
    defaultLocale,
    locales,
  },
  apollo: {
    // Disable cookies
    proxyCookies: false,
    clients: {
      default: {
        httpEndpoint: `${import.meta.env.API_URL || "https://api.naoti.me"}/graphql`,
        // XXX: Enable later when WS is fully implemented
        wsEndpoint: getWsEndpoint(`${import.meta.env.API_URL || "https://api.naoti.me"}/graphql`),
        tokenName: "naotimesui.token",
        tokenStorage: "localStorage",
        websocketsOnly: false,
        authHeader: "Authorization",
        authType: "Bearer",
      },
    },
    clientAwareness: true,
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
      {
        // Monospace font for JP glyphs
        name: "M PLUS 1 Code",
        provider: "fontsource",
        weights: ["200", "300", "400", "500", "600", "700", "800"],
      },
      {
        name: "Rubik",
        provider: "fontsource",
        weights: ["300", "400", "500", "600", "700"],
        display: "swap",
        styles: ["normal", "italic"],
        subsets: ["latin", "latin-ext"],
      },
    ],
  },
  colorMode: {
    preference: "system",
    fallback: "dark",
    classSuffix: "",
    storageKey: "naotimesui.colorMode",
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
  piniaPluginPersistedstate: {
    storage: "localStorage",
    key: "naotimesui:%id",
  },
  experimental: {
    buildCache: true,
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

