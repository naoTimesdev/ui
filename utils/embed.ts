export const RoleColorPalette = {
  TL: "role-bg-red",
  TLC: "role-bg-yellow",
  ENC: "role-bg-green",
  ED: "role-bg-blue",
  TM: "role-bg-indigo",
  TS: "role-bg-purple",
  QC: "role-bg-pink",
};
export const RoleColorFallback = "role-bg-fallback";

/**
 * All the available colors for Embeds
 */
export const ValidAccent = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "none"] as const;
export type ColorAccent = (typeof ValidAccent)[number];

/**
 * All the available locales for Embeds
 */
export const ValidLocales = ["id", "en", "ja", "jv", "su", "ms", "ms-Arab"] as const;
export type AvailableLocalesType = (typeof ValidLocales)[number];
