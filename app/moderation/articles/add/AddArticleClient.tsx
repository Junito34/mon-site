"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ArticleRenderer from "@/app/dates/[year]/[slug]/ArticleRenderer";

// DnD kit
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
  return (
    <span
      className="cursor-grab active:cursor-grabbing select-none text-white/50 hover:text-white/80 transition"
      title="Déplacer"
    >
      ⠿
    </span>
  );
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
      className={`border border-white/10 bg-black/30 ${
        isDragging ? "opacity-70" : "opacity-100"
      }`}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span {...attributes} {...listeners} className="px-1">
              <DragHandle />
            </span>
            <div className="text-xs tracking-[0.3em] uppercase text-white/50">
              Bloc {index + 1}
            </div>
          </div>
          <TypeBadge type={block.type} />
        </div>

        <div className="flex items-center gap-4 text-xs text-white/60">
          <button onClick={() => onDuplicate(block.id)} className="hover:text-white transition">
            Dupliquer
          </button>
          <button onClick={() => onRemove(block.id)} className="hover:text-white transition">
            Supprimer
          </button>
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        {block.type === "image" ? (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickImage(block.id, e.target.files?.[0] ?? null)}
              className="w-full text-sm text-white/70"
            />

            {(block as any).url && (
              <div className="border border-white/10 bg-white/5 p-3">
                <img src={(block as any).url} alt="preview" className="max-h-48 w-auto" />
              </div>
            )}

            <input
              placeholder="Légende (optionnel)"
              value={(block as any).caption || ""}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value } as any)}
              className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            />
          </div>
        ) : block.type === "youtube" ? (
          <div className="space-y-3">
            <input
              placeholder="URL YouTube"
              value={(block as any).url}
              onChange={(e) => onUpdate(block.id, { url: e.target.value } as any)}
              className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            />
            <input
              placeholder="Légende (optionnel)"
              value={(block as any).caption || ""}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value } as any)}
              className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            />
          </div>
        ) : (
          <textarea
            value={(block as any).content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value } as any)}
            placeholder="Contenu…"
            className="w-full min-h-[120px] bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
          />
        )}
      </div>
    </div>
  );
}

export default function AddArticleClient() {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [publishedDate, setPublishedDate] = useState<string>("");
  const [slugInput, setSlugInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<Block[]>([
    { id: uid(), type: "paragraph", content: "" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const computedSlug = useMemo(
    () => (slugInput ? slugify(slugInput) : slugify(title)),
    [slugInput, title]
  );

  const previewYear = useMemo(
    () => (publishedDate ? yearFromDate(publishedDate) : "—"),
    [publishedDate]
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
      const b = prev[i];
      const copy: Block = JSON.parse(JSON.stringify(b));
      (copy as any).id = uid();
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
        const url = file ? URL.createObjectURL(file) : undefined;
        return { ...b, file, url };
      })
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

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
    const cleanTitle = title.trim();
    if (!cleanTitle) return "Titre requis.";
    if (!publishedDate) return "Date de publication requise.";
    if (!computedSlug) return "Slug invalide.";

    const { data: existing, error } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", computedSlug)
      .maybeSingle();

    if (error) return error.message;
    if (existing) return "Slug déjà utilisé. Change-le (ex: ajoute un suffixe).";

    const hasContent = blocks.some((b) => {
      if (b.type === "image") return !!b.file;
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

    const {
      data: { user },
      error: uErr,
    } = await supabase.auth.getUser();

    if (uErr || !user) {
      setSaving(false);
      setErr("Session invalide. Reconnecte-toi.");
      return;
    }

    const { data: article, error: aErr } = await supabase
      .from("articles")
      .insert({
        title: title.trim(),
        slug: computedSlug,
        published_date: publishedDate,
        author_id: user.id,
      })
      .select("id")
      .single();

    if (aErr || !article) {
      setSaving(false);
      setErr(aErr?.message || "Erreur création article.");
      return;
    }

    const rows: any[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      if (b.type === "image") {
        const file = b.file;
        if (!file) continue;
        const url = await uploadImage(article.id, b.id, file);
        rows.push({
          article_id: article.id,
          type: "image",
          media_url: url,
          caption: (b.caption || "").trim() || null,
          sort_index: i,
        });
      } else if (b.type === "youtube") {
        const url = (b.url || "").trim();
        if (!url) continue;
        rows.push({
          article_id: article.id,
          type: "youtube",
          media_url: url,
          caption: (b.caption || "").trim() || null,
          sort_index: i,
        });
      } else {
        const content = ((b as any).content || "").trim();
        if (!content) continue;
        rows.push({
          article_id: article.id,
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
    setMsg("Article créé.");

    const year = yearFromDate(publishedDate);
    window.location.href = `/dates/${year}/${computedSlug}`;
  };

  const previewBlocks = useMemo(() => {
    return blocks.map((b, i) => {
      if (b.type === "image") {
        return {
          id: b.id,
          type: "image",
          content: null,
          media_url: (b as any).url ?? null,
          caption: (b as any).caption ?? null,
          sort_index: i,
        };
      }
      if (b.type === "youtube") {
        return {
          id: b.id,
          type: "youtube",
          content: null,
          media_url: (b as any).url || null,
          caption: (b as any).caption ?? null,
          sort_index: i,
        };
      }
      return {
        id: b.id,
        type: b.type,
        content: (b as any).content ?? null,
        media_url: null,
        caption: null,
        sort_index: i,
      };
    });
  }, [blocks]);

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* LEFT: Editor */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">Ajouter un article</h1>
            <p className="mt-4 text-white/60 text-sm md:text-base">
              Éditeur V3 : drag’n drop des blocs + preview live.
            </p>

            {(err || msg) && (
              <div
                className={`mt-8 border px-4 py-3 text-sm ${
                  err
                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {err ?? msg}
              </div>
            )}

            <div className="mt-10 border border-white/10 bg-white/5 backdrop-blur-sm p-8 space-y-6">
              {/* Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Titre</div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                  />
                </div>

                <div>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Date</div>
                  <input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                  />
                </div>

                <div>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Slug</div>
                  <input
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    placeholder={slugify(title) || "ex: 13-juin"}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                  />
                  <div className="mt-2 text-xs text-white/40">
                    Utilisé : <span className="text-white/70">{computedSlug || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Tools */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => addBlock("title")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">
                    + Titre
                  </button>
                  <button onClick={() => addBlock("paragraph")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">
                    + Paragraphe
                  </button>
                  <button onClick={() => addBlock("quote")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">
                    + Citation
                  </button>
                  <button onClick={() => addBlock("image")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">
                    + Image
                  </button>
                  <button onClick={() => addBlock("youtube")} className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition">
                    + YouTube
                  </button>
                </div>

                {/* DnD Blocks */}
                <div className="mt-8">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                  >
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
                    {saving ? "Création..." : "Publier l’article"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live preview */}
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

              <div className="mt-14 flex justify-end">
                <div className="text-xs tracking-[0.4em] uppercase text-white/40">
                  Auteur : <span className="text-white/70">Moi</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/40">
              Astuce: attrape le ⠿ pour déplacer un bloc.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}