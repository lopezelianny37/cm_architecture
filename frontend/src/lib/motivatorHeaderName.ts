// Long names ("Aceptación", "Curiosidad", "Relaciones") wrap onto a 2nd
// line in a narrow card if sized the same as short ones. Shared by Step 1
// and Step 2 so both shrink the same set of names the same way, keeping
// every header on a single line.
const LONG_NAME_THRESHOLD = 9;

export function isLongMotivatorName(name: string): boolean {
  return name.length >= LONG_NAME_THRESHOLD;
}
