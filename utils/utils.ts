export function castBooleanNull(value: string | boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const trueCase = ["true", "1", "yes", "y", "on", "enabled", "enable"];

  return trueCase.includes(value.toLowerCase());
}
