/**
 * Slug Generator Utility
 */

export function buatSlug(teks: string): string {
  return teks
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, "-")           // spaces to hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .slice(0, 100);                  // max 100 chars
}
