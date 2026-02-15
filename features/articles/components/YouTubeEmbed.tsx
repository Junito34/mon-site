"use client";

function getYouTubeId(url: string) {
  try {
    const u = new URL(url);

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }

    // youtube.com/watch?v=<id>
    const v = u.searchParams.get("v");
    if (v) return v;

    // youtube.com/embed/<id>
    const parts = u.pathname.split("/");
    const embedIndex = parts.indexOf("embed");
    if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];

    return null;
  } catch {
    return null;
  }
}

export default function YouTubeEmbed({
  url,
  title = "YouTube video",
}: {
  url: string;
  title?: string;
}) {
  const id = getYouTubeId(url);
  if (!id) return null;

  return (
    <div className="max-w-3xl mx-auto mt-16 px-6">
      <h2 className="text-sm tracking-[0.3em] uppercase text-white/60 mb-6">
        Musique
      </h2>

      <div className="relative w-full aspect-video border border-white/10">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
