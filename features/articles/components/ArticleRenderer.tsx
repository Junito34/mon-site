import ArticleImageSection from "@/features/articles/components/ArticleImageSection";

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

    // embed urls fallback: /embed/<id>
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export default function ArticleRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div
      className="
        text-white/80 leading-relaxed
        text-base md:text-lg
        space-y-5 md:space-y-6
      "
    >
      {blocks.map((b) => {
        if (b.type === "title") {
          return (
            <h2
              key={b.id}
              className="
                pt-6 md:pt-8
                text-white/90 font-light tracking-wide
                text-xl sm:text-2xl md:text-3xl
                leading-snug
              "
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
              className="
                border-l border-white/20
                pl-4 md:pl-5
                py-1
                text-white/70 italic
                text-[0.95rem] md:text-lg
              "
            >
              {b.content}
            </blockquote>
          );
        }

        if (b.type === "image" && b.media_url) {
          return (
            <div key={b.id} className="pt-2 md:pt-3">
              <ArticleImageSection image={b.media_url} title={b.caption ?? undefined} />
            </div>
          );
        }

        if (b.type === "youtube" && b.media_url) {
          const id = getYoutubeId(b.media_url);
          if (!id) return null;

          return (
            <div key={b.id} className="pt-3 md:pt-4">
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
                <div className="mt-3 text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/40">
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