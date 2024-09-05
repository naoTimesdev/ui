export function castBooleanNull(value: string): boolean {
  const trueCase = ["true", "1", "yes", "y", "on", "enabled", "enable"];

  return trueCase.includes(value.toLowerCase());
}
