import { formatTimeAgo, type UseTimeAgoMessages, type UseTimeAgoUnitNamesDefault } from "@vueuse/core";
import type { AvailableLocalesType } from "./embed";

/**
 * Convert a number to a roman numeral
 * @param number The number to convert to roman numerals
 * @returns Resulting roman numeral
 */
export function romanizeNumber(number: number): string {
  if (Number.isNaN(number)) {
    return "NaN";
  }

  const digits = String(+number).split("");

  const romankeys = [
    "",
    "C",
    "CC",
    "CCC",
    "CD",
    "D",
    "DC",
    "DCC",
    "DCCC",
    "CM",
    "",
    "X",
    "XX",
    "XXX",
    "XL",
    "L",
    "LX",
    "LXX",
    "LXXX",
    "XC",
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
  ];
  let roman = "";
  let i = 3;

  while (i--) {
    const dig = digits.pop();

    if (dig) {
      roman = (romankeys[+dig + i * 10] || "") + roman;
    }
  }

  return Array(+digits.join("") + 1).join("M") + roman;
}

function loadLocales(locale: AvailableLocalesType): UseTimeAgoMessages<UseTimeAgoUnitNamesDefault> {
  const { t } = useI18n();

  return {
    justNow: t("timeAgo.now", [], { locale }),
    past: (n) => (n.match(/\d/) ? t("timeAgo.past", [n], { locale }) : n),
    future: (n) => (n.match(/\d/) ? t("timeAgo.future", [n], { locale }) : n),
    month: (n, past) =>
      n === 1
        ? past
          ? t("timeAgo.month.singular.past", [], { locale })
          : t("timeAgo.month.singular.future", [], { locale })
        : t("timeAgo.month.plural", n, { locale, named: { n } }),
    year: (n, past) =>
      n === 1
        ? past
          ? t("timeAgo.year.singular.past", [], { locale })
          : t("timeAgo.year.singular.future", [], { locale })
        : t("timeAgo.year.plural", n, { locale, named: { n } }),
    day: (n, past) =>
      n === 1
        ? past
          ? t("timeAgo.day.singular.past", [], { locale })
          : t("timeAgo.day.singular.future", [], { locale })
        : t("timeAgo.day.plural", n, { locale, named: { n } }),
    week: (n, past) =>
      n === 1
        ? past
          ? t("timeAgo.week.singular.past", [], { locale })
          : t("timeAgo.week.singular.future", [], { locale })
        : t("timeAgo.week.plural", n, { locale, named: { n } }),
    hour: (n) => t("timeAgo.hour", n, { locale, named: { n } }),
    minute: (n) => t("timeAgo.minute", n, { locale, named: { n } }),
    second: (n) => t("timeAgo.second", n, { locale, named: { n } }),
    invalid: "",
  };
}

/**
 * Format a date to a time ago string
 * @param from The date to compare
 * @param locale The locale to use
 * @returns The time ago string
 */
export function timeAgo(from: Date, locale: AvailableLocalesType, nowDate?: Date): string {
  const locales = loadLocales(locale);

  return formatTimeAgo(
    from,
    {
      messages: locales,
    },
    nowDate
  );
}
