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

export const ValidAccent = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "none"] as const;
export type ColorAccent = (typeof ValidAccent)[number];
