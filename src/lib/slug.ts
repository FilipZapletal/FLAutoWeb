export function slugify(...parts: (string | number | null | undefined)[]) {
  return parts
    .filter((p) => p !== null && p !== undefined && p !== "")
    .join(" ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
