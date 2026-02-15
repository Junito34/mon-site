export type Block =
  | { id: string; type: "title"; content: string }
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "quote"; content: string }
  | { id: string; type: "youtube"; url: string; caption?: string }
  | { id: string; type: "image"; file?: File | null; url?: string; caption?: string };

export type DbBlock = {
  id: string;
  type: string;
  content: string | null;
  media_url: string | null;
  caption: string | null;
  sort_index: number;
};

export type DbArticle = {
  id: string;
  title: string;
  slug: string;
  published_date: string | null;
};

export const uid = () => crypto.randomUUID();

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function yearFromDate(d: string) {
  try {
    return new Date(d).getFullYear().toString();
  } catch {
    return "0000";
  }
}