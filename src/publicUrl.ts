/** Resolve a `public/` asset path for the current Vite base URL (e.g. `/cosmica/`). */
export function publicUrl(path: string): string {
  const trimmed = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${trimmed}`;
}
