"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ArticleRenderer from "@/app/dates/[year]/[slug]/ArticleRenderer";

// DnD
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Block =
  | { id: string; type: "title"; content: string }
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "quote"; content: string }
  | { id: string; type: "youtube"; url: string; caption?: string }
  | { id: string; type: "image"; file?: File | null; url?: string; caption?: string };

const uid = () => crypto.randomUUID();

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function yearFromDate(d: string) {
  try {
    return new Date(d).getFullYear().toString();
  } catch {
    return "0000";
  }
}

function TypeBadge({ type }: { type: Block["type"] }) {
  return (
    <span className="text-[10px] tracking-[0.35em] uppercase text-white/45 border border-white/10 px-2 py-1">
      {type}
    </span>
  );
}
function DragHandle() {
  return <span className="cursor-grab active:cursor-grabbing select-none text-white/50 hover:text-white/80 transition">⠿</span>;
}

function SortableBlockCard({
  block,
  index,
  onRemove,
  onDuplicate,
  onUpdate,
  onPickImage,
}: {
  block: Block;
  index: number;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Block>) => void;
  onPickImage: (id: string, file: File | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-white/10 bg-black/30 ${isDragging ? "opacity-70" : "opacity-100"}`}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <span {...attributes} {...listeners} className="px-1">
            <DragHandle />
          </span>
          <div className="text-xs tracking-[0.3em] uppercase text-white/50">Bloc {index + 1}</div>
          <TypeBadge type={block.type} />
        </div>

        <div className="flex items-center gap-4 text-xs text-white/60">
          <button onClick={() => onDuplicate(block.id)} className="hover:text-white transition">Dupliquer</button>
          <button onClick={() => onRemove(block.id)} className="hover:text-white transition">Supprimer</button>
        </div>
      </div>

      <div className="p-5">
        {block.type === "image" ? (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickImage(block.id, e.target.files?.[0] ?? null)}
              className="w-full text-sm text-white/70"
            />

            {block.url && (
              <div className="border border-white/10 bg-white/5 p-3">
                <img src={block.url} alt="preview" className="max-h-48 w-auto" />
              </div>
            )}

            <input
              placeholder="Légende (optionnel)"
              value={block.caption || ""}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value } as any)}
              className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            />
          </div>
        ) : block.type === "youtube" ? (
          <div className="space-y-3">
            <input
              placeholder="URL YouTube"
              value={block.url}
              onChange={(e) => onUpdate(block.id, { url: e.target.value } as any)}
              className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            />
            <input
              placeholder="Légende (optionnel)"
              value={block.caption || ""}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value } as any)}
              className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            />
          </div>
        ) : (
          <textarea
            value={(block as any).content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value } as any)}
            className="w-full min-h-[120px] bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            placeholder="Contenu…"
          />
        )}
      </div>
    </div>
  );
}

type DbBlock = {
  id: string;
  type: string;
  content: string | null;
  media_url: string | null;
  caption: string | null;
  sort_index: number;
};

type DbArticle = {
  id: string;
  title: string;
  slug: string;
  published_date: string | null;
};

export default function ArticleEditorClient({
  initialArticle,
  initialBlocks,
  initialError,
}: {
  initialArticle: DbArticle | null;
  initialBlocks: DbBlock[];
  initialError: string | null;
}) {
  const supabase = createClient();

  const [err, setErr] = useState<string | null>(initialError);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!initialArticle) {
    return (
      <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-light">Article introuvable</h1>
          {err && <p className="mt-4 text-white/60">{err}</p>}
        </div>
      </main>
    );
  }

  const [title, setTitle] = useState(initialArticle.title);
  const [publishedDate, setPublishedDate] = useState(
    initialArticle.published_date ? initialArticle.published_date.slice(0, 10) : ""
  );
  const [slugInput, setSlugInput] = useState(initialArticle.slug);

  const computedSlug = useMemo(
    () => (slugInput ? slugify(slugInput) : slugify(title)),
    [slugInput, title]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // hydrate blocks depuis DB -> Block editor
  const [blocks, setBlocks] = useState<Block[]>(
    (initialBlocks ?? []).map((b) => {
      if (b.type === "image") {
        return { id: b.id, type: "image", file: null, url: b.media_url ?? "", caption: b.caption ?? "" };
      }
      if (b.type === "youtube") {
        return { id: b.id, type: "youtube", url: b.media_url ?? "", caption: b.caption ?? "" };
      }
      return { id: b.id, type: b.type as any, content: b.content ?? "" };
    })
  );

  const addBlock = (type: Block["type"]) => {
    if (type === "youtube") setBlocks((p) => [...p, { id: uid(), type: "youtube", url: "", caption: "" }]);
    else if (type === "image") setBlocks((p) => [...p, { id: uid(), type: "image", file: null, caption: "" }]);
    else setBlocks((p) => [...p, { id: uid(), type, content: "" } as any]);
  };

  const removeBlock = (id: string) => setBlocks((p) => p.filter((b) => b.id !== id));

  const duplicateBlock = (id: string) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i === -1) return prev;
      const copy: Block = JSON.parse(JSON.stringify(prev[i]));
      copy.id = uid();
      const out = [...prev];
      out.splice(i + 1, 0, copy);
      return out;
    });
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as any) : b)));
  };

  const pickImage = (blockId: string, file: File | null) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== "image") return b;
        const url = file ? URL.createObjectURL(file) : b.url; // si on enlève le file, on garde l’ancienne url
        return { ...b, file, url };
      })
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const uploadImage = async (articleId: string, blockId: string, file: File) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${articleId}/${blockId}.${ext}`;
    const { error } = await supabase.storage.from("article-images").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const validate = async () => {
    if (!title.trim()) return "Titre requis.";
    if (!publishedDate) return "Date requise.";
    if (!computedSlug) return "Slug invalide.";

    // slug unique sauf cet article
    const { data: existing, error } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", computedSlug)
      .neq("id", initialArticle.id)
      .maybeSingle();

    if (error) return error.message;
    if (existing) return "Slug déjà utilisé par un autre article.";

    const hasContent = blocks.some((b) => {
      if (b.type === "image") return !!b.file || !!b.url;
      if (b.type === "youtube") return (b.url || "").trim().length > 0;
      return (b as any).content?.trim?.().length > 0;
    });
    if (!hasContent) return "Ajoute au moins un bloc non vide.";
    return null;
  };

  const save = async () => {
    setErr(null);
    setMsg(null);
    setSaving(true);

    const v = await validate();
    if (v) {
      setSaving(false);
      setErr(v);
      return;
    }

    // Update article
    const { error: aErr } = await supabase
      .from("articles")
      .update({
        title: title.trim(),
        slug: computedSlug,
        published_date: publishedDate,
      })
      .eq("id", initialArticle.id);

    if (aErr) {
      setSaving(false);
      setErr(aErr.message);
      return;
    }

    // Replace blocks (simple & fiable)
    const { error: delErr } = await supabase
      .from("article_blocks")
      .delete()
      .eq("article_id", initialArticle.id);

    if (delErr) {
      setSaving(false);
      setErr(delErr.message);
      return;
    }

    const rows: any[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      if (b.type === "image") {
        let url = b.url ?? "";
        if (b.file) url = await uploadImage(initialArticle.id, b.id, b.file);
        if (!url) continue;

        rows.push({
          article_id: initialArticle.id,
          type: "image",
          media_url: url,
          caption: (b.caption || "").trim() || null,
          sort_index: i,
        });
      } else if (b.type === "youtube") {
        const url = (b.url || "").trim();
        if (!url) continue;
        rows.push({
          article_id: initialArticle.id,
          type: "youtube",
          media_url: url,
          caption: (b.caption || "").trim() || null,
          sort_index: i,
        });
      } else {
        const content = ((b as any).content || "").trim();
        if (!content) continue;
        rows.push({
          article_id: initialArticle.id,
          type: b.type,
          content,
          sort_index: i,
        });
      }
    }

    const { error: bErr } = await supabase.from("article_blocks").insert(rows);
    if (bErr) {
      setSaving(false);
      setErr(bErr.message);
      return;
    }

    setSaving(false);
    setMsg("Modifications enregistrées.");

    const year = yearFromDate(publishedDate);
    window.location.href = `/dates/${year}/${computedSlug}`;
  };

  const previewBlocks = useMemo(() => {
    return blocks.map((b, i) => {
      if (b.type === "image") {
        return { id: b.id, type: "image", media_url: b.url ?? null, caption: b.caption ?? null, content: null, sort_index: i };
      }
      if (b.type === "youtube") {
        return { id: b.id, type: "youtube", media_url: b.url || null, caption: b.caption ?? null, content: null, sort_index: i };
      }
      return { id: b.id, type: b.type, content: (b as any).content ?? null, media_url: null, caption: null, sort_index: i };
    });
  }, [blocks]);

  const previewYear = publishedDate ? yearFromDate(publishedDate) : "—";

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* LEFT */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">Modifier un article</h1>
            <p className="mt-4 text-white/60 text-sm md:text-base">
              Drag’n drop, preview live, update en base.
            </p>

            {(err || msg) && (
              <div className={`mt-8 border px-4 py-3 text-sm ${err ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"}`}>
                {err ?? msg}
              </div>
            )}

            <div className="mt-10 border border-white/10 bg-white/5 backdrop-blur-sm p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Titre</div>
                  <input value={title} onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition" />
                </div>

                <div>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Date</div>
                  <input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition" />
                </div>

                <div>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Slug</div>
                  <input value={slugInput} onChange={(e) => setSlugInput(e.target.value)}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition" />
                  <div className="mt-2 text-xs text-white/40">
                    Utilisé : <span className="text-white/70">{computedSlug || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => addBlock("title")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">+ Titre</button>
                  <button onClick={() => addBlock("paragraph")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">+ Paragraphe</button>
                  <button onClick={() => addBlock("quote")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">+ Citation</button>
                  <button onClick={() => addBlock("image")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">+ Image</button>
                  <button onClick={() => addBlock("youtube")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">+ YouTube</button>
                </div>

                <div className="mt-8">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {blocks.map((b, idx) => (
                          <SortableBlockCard
                            key={b.id}
                            block={b}
                            index={idx}
                            onRemove={removeBlock}
                            onDuplicate={duplicateBlock}
                            onUpdate={updateBlock}
                            onPickImage={pickImage}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                <div className="mt-10 flex justify-end">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="border border-white/20 px-6 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT preview */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
            <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <div className="text-xs tracking-[0.3em] uppercase text-white/50">Aperçu</div>

              <h2 className="mt-4 text-3xl md:text-4xl font-light tracking-wide text-white/90">
                {title.trim() || "Titre de l’article"}
              </h2>

              <div className="mt-3 text-xs tracking-[0.3em] uppercase text-white/40">
                {previewYear} — /dates/{previewYear !== "—" ? previewYear : "YYYY"}/{computedSlug || "slug"}
              </div>

              <div className="mt-10">
                <ArticleRenderer blocks={previewBlocks as any} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}