/** Never confuse an unsuccessful source read with a genuinely absent row. */
export function checkedSourceRead<T>(result: { data: T; error: unknown }, message: string): T {
  if (result.error) throw new Error(message);
  return result.data;
}