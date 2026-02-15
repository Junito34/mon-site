"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ArticleRenderer from "@/features/articles/components/ArticleRenderer";

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

/* =========================
   Types
========================= */

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

type Mode = "create" | "edit";

type Props =
  | { mode: "create" }
  | { mode: "edit"; initialArticle: DbArticle | null; initialBlocks: DbBlock[]; initialError: string | null };

type ValidationResult =
  | { ok: true }
  | { ok: false; message: string; field?: "title" | "date" | "slug" | "blocks" };

/* =========================
   Utils
========================= */

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

/* =========================
   UI atoms (internes)
========================= */

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

function MobileViewSwitch({
  value,
  onChange,
}: {
  value: "editor" | "preview";
  onChange: (v: "editor" | "preview") => void;
}) {
  const isEditor = value === "editor";

  return (
    <div className="lg:hidden sticky top-[88px] z-20 -mx-6 px-6 pb-4 pt-3 bg-black/70 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
        <div className="text-xs tracking-[0.35em] uppercase text-white/50">Vue</div>

        <div className="relative flex h-11 items-center border border-white/15 bg-white/5 rounded-full p-1 select-none">
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full transition-transform duration-300 ${
              isEditor ? "translate-x-0" : "translate-x-full"
            }`}
          />
          <button
            type="button"
            onClick={() => onChange("editor")}
            className={`relative z-10 h-9 px-6 text-[11px] tracking-[0.35em] uppercase rounded-full transition ${
              isEditor ? "text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Édition
          </button>
          <button
            type="button"
            onClick={() => onChange("preview")}
            className={`relative z-10 h-9 px-6 text-[11px] tracking-[0.35em] uppercase rounded-full transition ${
              !isEditor ? "text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Aperçu
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableBlockCard({
  block,
  index,
  onRemove,
  onDuplicate,
  onUpdate,
  onPickImage,
  highlight,
}: {
  block: Block;
  index: number;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Block>) => void;
  onPickImage: (id: string, file: File | null) => void;
  highlight?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      id={`block-${block.id}`}
      ref={setNodeRef}
      style={style}
      className={`border border-white/10 bg-black/30 transition ${
        isDragging ? "opacity-70" : "opacity-100"
      } ${highlight ? "ring-2 ring-white/60 bg-white/10" : ""}`}
    >
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex items-center gap-4">
            <span {...attributes} {...listeners} className="px-1 shrink-0">
              <DragHandle />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                  Bloc {index + 1}
                </div>
                <TypeBadge type={block.type} />
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/60">
                <button
                  onClick={() => onDuplicate(block.id)}
                  className="border border-white/15 px-3 py-1.5 tracking-widest uppercase hover:bg-white hover:text-black transition"
                >
                  Dupliquer
                </button>
                <button
                  onClick={() => onRemove(block.id)}
                  className="border border-white/15 px-3 py-1.5 tracking-widest uppercase hover:bg-white hover:text-black transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          <div className="hidden sm:block shrink-0 text-[10px] tracking-[0.35em] uppercase text-white/30">
            ⠿ drag
          </div>
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

            {(block as any).url && (
              <div className="border border-white/10 bg-white/5 p-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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

/* =========================
   Main component
========================= */

export default function ArticleEditor(props: Props) {
  const supabase = createClient();

  const mode: Mode = props.mode;

  let initialArticle: DbArticle | null = null;
  let initialBlocks: DbBlock[] = [];
  let initialError: string | null = null;

  if (props.mode === "edit") {
    initialArticle = props.initialArticle;
    initialBlocks = props.initialBlocks;
    initialError = props.initialError;
  }

  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [err, setErr] = useState<string | null>(initialError ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Meta fields state
  const [title, setTitle] = useState(mode === "edit" ? initialArticle?.title ?? "" : "");
  const [publishedDate, setPublishedDate] = useState(
    mode === "edit" ? (initialArticle?.published_date ? initialArticle.published_date.slice(0, 10) : "") : ""
  );
  const [slugInput, setSlugInput] = useState(mode === "edit" ? initialArticle?.slug ?? "" : "");

  const computedSlug = useMemo(
    () => (slugInput ? slugify(slugInput) : slugify(title)),
    [slugInput, title]
  );

  // Blocks state
  const [blocks, setBlocks] = useState<Block[]>(
    mode === "edit"
      ? (initialBlocks ?? [])
          .slice()
          .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0))
          .map((b) => {
            if (b.type === "image") return { id: b.id, type: "image", file: null, url: b.media_url ?? "", caption: b.caption ?? "" };
            if (b.type === "youtube") return { id: b.id, type: "youtube", url: b.media_url ?? "", caption: b.caption ?? "" };
            return { id: b.id, type: b.type as any, content: b.content ?? "" };
          })
      : [{ id: uid(), type: "paragraph", content: "" }]
  );

  useEffect(() => {
    setMobileView("editor");
  }, []);

  // refs for scroll highlight
  const titleRef = useRef<HTMLInputElement | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);
  const slugRef = useRef<HTMLInputElement | null>(null);
  const blocksTopRef = useRef<HTMLDivElement | null>(null);

  const [flashField, setFlashField] = useState<null | "title" | "date" | "slug" | "blocks">(null);
  const [flashBlockId, setFlashBlockId] = useState<string | null>(null);

  const pendingScrollRef = useRef<
    null | { kind: "field"; field: "title" | "date" | "slug" | "blocks" } | { kind: "block"; id: string }
  >(null);

  const scrollToField = (field: "title" | "date" | "slug" | "blocks") => {
    setMobileView("editor");
    pendingScrollRef.current = { kind: "field", field };
    setFlashField(field);
    window.setTimeout(() => setFlashField(null), 2600);
  };

  const scrollToBlock = (id: string) => {
    setMobileView("editor");
    pendingScrollRef.current = { kind: "block", id };
    setFlashBlockId(id);
    window.setTimeout(() => setFlashBlockId(null), 2600);
  };

  useEffect(() => {
    const p = pendingScrollRef.current;
    if (!p) return;

    const doScroll = () => {
      if (p.kind === "field") {
        const map = {
          title: titleRef.current,
          date: dateRef.current,
          slug: slugRef.current,
          blocks: blocksTopRef.current,
        } as const;

        const el = map[p.field];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: p.field === "blocks" ? "start" : "center" });
          if (p.field !== "blocks") (el as any)?.focus?.();
          pendingScrollRef.current = null;
          return;
        }
      } else {
        const el = document.getElementById(`block-${p.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          pendingScrollRef.current = null;
          return;
        }
      }

      window.setTimeout(doScroll, 80);
    };

    doScroll();
  }, [mobileView, blocks.length]);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  // Block actions
  const addBlock = (type: Block["type"]) => {
    const newId = uid();
    setBlocks((p) => {
      if (type === "youtube") return [...p, { id: newId, type: "youtube", url: "", caption: "" }];
      if (type === "image") return [...p, { id: newId, type: "image", file: null, caption: "" }];
      return [...p, { id: newId, type, content: "" } as any];
    });
    scrollToBlock(newId);
  };

  const removeBlock = (id: string) => setBlocks((p) => p.filter((b) => b.id !== id));

  const duplicateBlock = (id: string) => {
    const newId = uid();
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i === -1) return prev;
      const copy: Block = JSON.parse(JSON.stringify(prev[i]));
      (copy as any).id = newId;
      const out = [...prev];
      out.splice(i + 1, 0, copy);
      return out;
    });
    scrollToBlock(newId);
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as any) : b)));
  };

  const pickImage = (blockId: string, file: File | null) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== "image") return b;
        const url = file ? URL.createObjectURL(file) : b.url;
        return { ...b, file, url };
      })
    );
    scrollToBlock(blockId);
  };

  // Upload
  const uploadImage = async (articleId: string, blockId: string, file: File) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${articleId}/${blockId}.${ext}`;

    const { error } = await supabase.storage.from("article-images").upload(path, file, { upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const validate = async (): Promise<ValidationResult> => {
    if (!title.trim()) return { ok: false, message: "Titre requis.", field: "title" };
    if (!publishedDate) return { ok: false, message: "Date requise.", field: "date" };
    if (!computedSlug) return { ok: false, message: "Slug invalide.", field: "slug" };

    const q = supabase.from("articles").select("id").eq("slug", computedSlug);
    if (mode === "edit" && initialArticle?.id) q.neq("id", initialArticle.id);

    const { data: existing, error } = await q.maybeSingle();
    if (error) return { ok: false, message: error.message, field: "slug" };
    if (existing) return { ok: false, message: mode === "edit" ? "Slug déjà utilisé par un autre article." : "Slug déjà utilisé. Change-le.", field: "slug" };

    const hasContent = blocks.some((b) => {
      if (b.type === "image") return !!b.file || !!b.url;
      if (b.type === "youtube") return (b.url || "").trim().length > 0;
      return (b as any).content?.trim?.().length > 0;
    });
    if (!hasContent) return { ok: false, message: "Ajoute au moins un bloc non vide.", field: "blocks" };

    return { ok: true };
  };

  const save = async () => {
    setErr(null);
    setMsg(null);
    setSaving(true);

    const v = await validate();
    if (!v.ok) {
      setSaving(false);
      setErr(v.message);
      if (v.field) scrollToField(v.field);
      return;
    }

    try {
      if (mode === "create") {
        // auth
        const {
          data: { user },
          error: uErr,
        } = await supabase.auth.getUser();
        if (uErr || !user) {
          setSaving(false);
          setErr("Session invalide. Reconnecte-toi.");
          scrollToField("title");
          return;
        }

        // create article
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

        if (aErr || !article) throw new Error(aErr?.message || "Erreur création article.");

        // blocks
        const rows: any[] = [];
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i];

          if (b.type === "image") {
            if (!b.file) continue;
            const url = await uploadImage(article.id, b.id, b.file);
            rows.push({ article_id: article.id, type: "image", media_url: url, caption: (b.caption || "").trim() || null, sort_index: i });
          } else if (b.type === "youtube") {
            const url = (b.url || "").trim();
            if (!url) continue;
            rows.push({ article_id: article.id, type: "youtube", media_url: url, caption: (b.caption || "").trim() || null, sort_index: i });
          } else {
            const content = ((b as any).content || "").trim();
            if (!content) continue;
            rows.push({ article_id: article.id, type: b.type, content, sort_index: i });
          }
        }

        const { error: bErr } = await supabase.from("article_blocks").insert(rows);
        if (bErr) throw new Error(bErr.message);

        setSaving(false);
        setMsg("Article créé.");
        const year = yearFromDate(publishedDate);
        window.location.href = `/dates/${year}/${computedSlug}`;
        return;
      }

      // ===== EDIT MODE
      if (!initialArticle?.id) throw new Error("Article introuvable.");

      const { error: aErr } = await supabase
        .from("articles")
        .update({ title: title.trim(), slug: computedSlug, published_date: publishedDate })
        .eq("id", initialArticle.id);

      if (aErr) throw new Error(aErr.message);

      const { error: delErr } = await supabase.from("article_blocks").delete().eq("article_id", initialArticle.id);
      if (delErr) throw new Error(delErr.message);

      const rows: any[] = [];
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];

        if (b.type === "image") {
          let url = b.url ?? "";
          if (b.file) url = await uploadImage(initialArticle.id, b.id, b.file);
          if (!url) continue;
          rows.push({ article_id: initialArticle.id, type: "image", media_url: url, caption: (b.caption || "").trim() || null, sort_index: i });
        } else if (b.type === "youtube") {
          const url = (b.url || "").trim();
          if (!url) continue;
          rows.push({ article_id: initialArticle.id, type: "youtube", media_url: url, caption: (b.caption || "").trim() || null, sort_index: i });
        } else {
          const content = ((b as any).content || "").trim();
          if (!content) continue;
          rows.push({ article_id: initialArticle.id, type: b.type, content, sort_index: i });
        }
      }

      const { error: bErr } = await supabase.from("article_blocks").insert(rows);
      if (bErr) throw new Error(bErr.message);

      setSaving(false);
      setMsg("Modifications enregistrées.");
      const year = yearFromDate(publishedDate);
      window.location.href = `/dates/${year}/${computedSlug}`;
    } catch (e: any) {
      setSaving(false);
      setErr(e?.message || "Erreur.");
    }
  };

  // preview blocks
  const previewBlocks = useMemo(() => {
    return blocks.map((b, i) => {
      if (b.type === "image") return { id: b.id, type: "image", content: null, media_url: b.url ?? null, caption: b.caption ?? null, sort_index: i };
      if (b.type === "youtube") return { id: b.id, type: "youtube", content: null, media_url: b.url || null, caption: b.caption ?? null, sort_index: i };
      return { id: b.id, type: b.type, content: (b as any).content ?? null, media_url: null, caption: null, sort_index: i };
    });
  }, [blocks]);

  const previewYear = useMemo(() => (publishedDate ? yearFromDate(publishedDate) : "—"), [publishedDate]);
  const fieldGlow = (field: "title" | "date" | "slug" | "blocks") =>
    flashField === field ? "ring-2 ring-white/70 bg-white/10" : "";

  const pageTitle = mode === "edit" ? "Modifier un article" : "Ajouter un article";
  const saveLabel = mode === "edit" ? "Enregistrer" : "Publier l’article";
  const savingLabel = mode === "edit" ? "Enregistrement..." : "Création...";

  // écran edit: si pas d'article
  if (mode === "edit" && !initialArticle) {
    return (
      <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-light">Article introuvable</h1>
          {err && <p className="mt-4 text-white/60">{err}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pt-32 lg:pt-40 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <MobileViewSwitch value={mobileView} onChange={setMobileView} />

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* LEFT */}
          <div className={`w-full lg:w-1/2 ${mobileView === "preview" ? "hidden lg:block" : "block"}`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">{pageTitle}</h1>
            <p className="mt-4 text-white/60 text-sm md:text-base">Drag’n drop des blocs + aperçu live.</p>

            {(err || msg) && (
              <div
                className={`mt-8 border px-4 py-3 text-sm ${
                  err ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {err ?? msg}
              </div>
            )}

            <div className="mt-10 border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-8 space-y-6">
              {/* Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`transition rounded-sm ${fieldGlow("title")}`}>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Titre</div>
                  <input
                    ref={titleRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                  />
                </div>

                <div className={`transition rounded-sm ${fieldGlow("date")}`}>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Date</div>
                  <input
                    ref={dateRef}
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                  />
                </div>

                <div className={`transition rounded-sm ${fieldGlow("slug")}`}>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/50">Slug</div>
                  <input
                    ref={slugRef}
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

              {/* Blocks */}
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

                <div className="mt-8" ref={blocksTopRef}>
                  <div className={`transition rounded-sm ${fieldGlow("blocks")}`}>
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
                              highlight={flashBlockId === b.id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row sm:justify-end gap-3">
                  <button
                    onClick={() => setMobileView("preview")}
                    className="lg:hidden border border-white/20 px-6 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
                  >
                    Voir l’aperçu
                  </button>

                  <button
                    onClick={save}
                    disabled={saving}
                    className="border border-white/20 px-6 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? savingLabel : saveLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT preview */}
          <div className={`w-full lg:w-1/2 lg:sticky lg:top-32 ${mobileView === "editor" ? "hidden lg:block" : "block"}`}>
            <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs tracking-[0.3em] uppercase text-white/50">Aperçu</div>
                <button
                  onClick={() => setMobileView("editor")}
                  className="lg:hidden text-xs tracking-widest uppercase text-white/60 hover:text-white transition"
                >
                  Retour édition
                </button>
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-white/90">
                {title.trim() || "Titre de l’article"}
              </h2>

              <div className="mt-3 text-xs tracking-[0.3em] uppercase text-white/40 break-words">
                {previewYear} — /dates/{previewYear !== "—" ? previewYear : "YYYY"}/{computedSlug || "slug"}
              </div>

              <div className="mt-8 sm:mt-10">
                <ArticleRenderer blocks={previewBlocks as any} />
              </div>
            </div>

            <div className="mt-4 text-xs text-white/40">Astuce: attrape le ⠿ pour déplacer un bloc.</div>
          </div>
        </div>
      </div>
    </main>
  );
}