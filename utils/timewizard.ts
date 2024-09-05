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
