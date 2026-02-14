import Image from "next/image";
import ArticleImageSection from "@/components/ArticleImageSection";

type Block = {
  id: string;
  type: "paragraph" | "image" | "youtube" | "quote" | "title";
  content: string | null;
  media_url: string | null;
  caption: string | null;
  sort_index: number;
};

function getYoutubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    const v = u.searchParams.get("v");
    if (v) return v;
    // fallback for embed urls
    const parts = u.pathname.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export default function ArticleRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6 text-white/80 leading-relaxed text-base md:text-lg">
      {blocks.map((b) => {
        if (b.type === "title") {
          return (
            <h2
              key={b.id}
              className="text-2xl md:text-3xl font-light tracking-wide text-white/90 pt-6"
            >
              {b.content}
            </h2>
          );
        }

        if (b.type === "paragraph") {
          return (
            <p key={b.id} className="whitespace-pre-wrap">
              {b.content}
            </p>
          );
        }

        if (b.type === "quote") {
          return (
            <blockquote
              key={b.id}
              className="border-l border-white/20 pl-5 py-1 text-white/70 italic"
            >
              {b.content}
            </blockquote>
          );
        }

        if (b.type === "image" && b.media_url) {
        return (
            <div key={b.id}>
            <ArticleImageSection image={b.media_url} title={b.caption} />
            </div>
        );
        }

        if (b.type === "youtube" && b.media_url) {
          const id = getYoutubeId(b.media_url);
          if (!id) return null;

          return (
            <div key={b.id} className="pt-4">
              <div className="relative w-full aspect-video border border-white/10 bg-white/5 overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${id}`}
                  title="YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {b.caption && (
                <div className="mt-3 text-xs tracking-widest uppercase text-white/40">
                  {b.caption}
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}