export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")   // spaces & punctuation → _
    .replace(/^_+|_+$/g, "")       // trim _
    .replace(/_+/g, "_");          // collapse __
}