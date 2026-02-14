"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

type LatestItem = { title: string; href: string; year: string };

export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null);

  const [scrolled, setScrolled] = useState(false);

  // desktop dropdowns
  const [articlesOpen, setArticlesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);

  // mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<null | "articles" | "account" | "moderation">(null);

  // data
  const [latest, setLatest] = useState<LatestItem[]>([]);
  const [latestLoaded, setLatestLoaded] = useState(false);

  const { user, ready, logout } = useAuth();

  const closeAllDesktop = () => {
    setArticlesOpen(false);
    setAccountOpen(false);
    setModerationOpen(false);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileSection(null);
  };

  const closeAll = () => {
    closeAllDesktop();
    closeMobile();
  };

  const openDesktop = (k: "articles" | "account" | "moderation") => {
    setArticlesOpen(k === "articles");
    setAccountOpen(k === "account");
    setModerationOpen(k === "moderation");
  };

  // Scroll background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when click outside (desktop + mobile overlay handled separately)
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = navRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) closeAllDesktop();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Lock scroll when mobile menu open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [mobileOpen]);

  // ESC closes mobile
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch latest articles once (when needed)
  useEffect(() => {
    if ((!articlesOpen && mobileSection !== "articles") || latestLoaded) return;

    (async () => {
      try {
        const res = await fetch("/api/articles/latest", { cache: "no-store" });
        const json = await res.json();
        setLatest(Array.isArray(json?.items) ? json.items : []);
      } catch {
        setLatest([]);
      } finally {
        setLatestLoaded(true);
      }
    })();
  }, [articlesOpen, mobileSection, latestLoaded]);

  const isAdmin = ready && user?.role === "admin";
  const isAuthed = ready && !!user;

  const navBase =
    `fixed top-0 left-0 w-full z-50 transition-all duration-700 ` +
    (scrolled ? "bg-black/60 backdrop-blur-md" : "bg-transparent");

  return (
    <nav
      ref={(el) => {
        navRef.current = el;
      }}
      className={navBase}
    >
      {/* top bar */}
      <div className="px-4 md:px-10 py-5 md:py-6">
        <div className="flex justify-between items-center text-sm tracking-widest uppercase">
          <a href="/" className="hover:opacity-60 transition" onClick={closeAll}>
            Jonathan
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex gap-10 items-center">
            <a href="/jonathan" onClick={closeAll} className="hover:opacity-60 transition">
              Qui est-il?
            </a>

            <a href="/galerie" onClick={closeAll} className="hover:opacity-60 transition">
              Galerie
            </a>

            {/* Articles dropdown (desktop hover) */}
            <div
              className="relative"
              onMouseEnter={() => openDesktop("articles")}
              onMouseLeave={closeAllDesktop}
            >
              <a
                href="/dates/more"
                onClick={closeAll}
                className="block px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                LES ARTICLES
              </a>

              <AnimatePresence>
                {articlesOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-black border border-white/10 rounded-sm shadow-lg overflow-hidden"
                  >
                    {latest.length === 0 ? (
                      <li className="px-4 py-3 text-xs tracking-[0.35em] uppercase text-white/50">
                        Aucun article récent
                      </li>
                    ) : (
                      latest.map((a) => (
                        <li key={a.href}>
                          <a
                            href={a.href}
                            onClick={closeAll}
                            className="block px-4 py-3 hover:bg-white/10 transition"
                          >
                            <div className="text-[10px] tracking-[0.35em] uppercase text-white/40">
                              {a.year}
                            </div>
                            <div className="mt-1 text-sm text-white/85 font-light">
                              {a.title}
                            </div>
                          </a>
                        </li>
                      ))
                    )}

                    <li className="border-t border-white/10" />

                    <li>
                      <a
                        href="/dates/more"
                        onClick={closeAll}
                        className="block px-4 py-3 text-sm hover:bg-white/10 transition text-white/70"
                      >
                        Plus...
                      </a>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* AUTH + ADMIN (desktop) */}
            <div className="flex items-center gap-10">
              {!ready ? (
                <span className="block px-4 py-2 text-sm text-white/40 tracking-[0.3em] select-none">
                  ...
                </span>
              ) : (
                <>
                  {isAdmin && (
                    <div
                      className="relative"
                      onMouseEnter={() => openDesktop("moderation")}
                      onMouseLeave={closeAllDesktop}
                    >
                      <button className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                        MODÉRATION
                      </button>

                      <AnimatePresence>
                        {moderationOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-black border border-white/10 rounded-sm shadow-lg overflow-hidden"
                          >
                            <li>
                              <a
                                href="/moderation/users"
                                onClick={closeAll}
                                className="block px-4 py-2 text-sm hover:bg-white/10 transition"
                              >
                                Liste utilisateurs
                              </a>
                            </li>
                            <li>
                              <a
                                href="/moderation/articles/add"
                                onClick={closeAll}
                                className="block px-4 py-2 text-sm hover:bg-white/10 transition"
                              >
                                Ajouter article
                              </a>
                            </li>
                            <li>
                              <a
                                href="/moderation/articles/manage"
                                onClick={closeAll}
                                className="block px-4 py-2 text-sm hover:bg-white/10 transition"
                              >
                                Editer article
                              </a>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {!isAuthed ? (
                    <a href="/login" onClick={closeAll} className="hover:opacity-60 transition">
                      CONNEXION
                    </a>
                  ) : (
                    <div
                      className="relative"
                      onMouseEnter={() => openDesktop("account")}
                      onMouseLeave={closeAllDesktop}
                    >
                      <a href="/account" onClick={closeAll} className="hover:opacity-60 transition">
                        MON COMPTE
                      </a>

                      <AnimatePresence>
                        {accountOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="absolute top-full right-0 mt-3 w-48 bg-black border border-white/10 rounded-sm shadow-lg overflow-hidden"
                          >
                            <li>
                              <a
                                href="/account"
                                onClick={closeAll}
                                className="block px-4 py-2 text-sm hover:bg-white/10 transition"
                              >
                                Mes informations
                              </a>
                            </li>
                            <li>
                              <a
                                href="/posts"
                                onClick={closeAll}
                                className="block px-4 py-2 text-sm hover:bg-white/10 transition"
                              >
                                Mes posts
                              </a>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  logout();
                                  closeAll();
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition"
                              >
                                Me déconnecter
                              </button>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile burger */}
          <div className="md:hidden flex items-center gap-3">
            {!ready ? (
              <span className="text-white/40 text-xs tracking-[0.3em] select-none">...</span>
            ) : (
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="h-10 px-4 border border-white/15 bg-white/5 backdrop-blur-sm rounded-sm hover:bg-white/10 transition"
                aria-label="Ouvrir le menu"
              >
                <span className="text-[11px] tracking-[0.35em] uppercase text-white/80">
                  Menu
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
          >
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-lg"
              onClick={closeMobile}
            />

            {/* panel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 left-4 right-4 border border-white/10 bg-[#0b0b0b] shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="text-xs tracking-[0.35em] uppercase text-white/70">
                  Navigation
                </div>
                <button
                  className="text-white/70 hover:text-white text-2xl font-light"
                  onClick={closeMobile}
                  aria-label="Fermer le menu"
                >
                  ×
                </button>
              </div>

              <div className="px-3 py-3">
                {/* Simple links */}
                <a
                  href="/jonathan"
                  onClick={closeAll}
                  className="block px-4 py-3 text-sm hover:bg-white/10 transition"
                >
                  Qui est-il?
                </a>
                <a
                  href="/galerie"
                  onClick={closeAll}
                  className="block px-4 py-3 text-sm hover:bg-white/10 transition"
                >
                  Galerie
                </a>

                {/* Articles accordion */}
                <button
                  onClick={() =>
                    setMobileSection((s) => (s === "articles" ? null : "articles"))
                  }
                  className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition flex items-center justify-between"
                >
                  <span>Les articles</span>
                  <span className="text-white/40">{mobileSection === "articles" ? "–" : "+"}</span>
                </button>

                <AnimatePresence initial={false}>
                  {mobileSection === "articles" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-l border-white/10 ml-4"
                    >
                      <div className="py-2">
                        {latest.length === 0 ? (
                          <div className="px-4 py-2 text-xs tracking-[0.35em] uppercase text-white/40">
                            Aucun article récent
                          </div>
                        ) : (
                          latest.map((a) => (
                            <a
                              key={a.href}
                              href={a.href}
                              onClick={closeAll}
                              className="block px-4 py-2 hover:bg-white/10 transition"
                            >
                              <div className="text-[10px] tracking-[0.35em] uppercase text-white/40">
                                {a.year}
                              </div>
                              <div className="mt-1 text-sm text-white/85 font-light">
                                {a.title}
                              </div>
                            </a>
                          ))
                        )}
                        <a
                          href="/dates/more"
                          onClick={closeAll}
                          className="block px-4 py-3 text-sm hover:bg-white/10 transition text-white/70"
                        >
                          Plus...
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Auth / Admin area */}
                <div className="mt-2 border-t border-white/10 pt-2">
                  {!ready ? (
                    <div className="px-4 py-3 text-xs tracking-[0.35em] uppercase text-white/40">
                      ...
                    </div>
                  ) : !isAuthed ? (
                    <a
                      href="/login"
                      onClick={closeAll}
                      className="block px-4 py-3 text-sm hover:bg-white/10 transition"
                    >
                      Connexion
                    </a>
                  ) : (
                    <>
                      <a
                        href="/account"
                        onClick={closeAll}
                        className="block px-4 py-3 text-sm hover:bg-white/10 transition"
                      >
                        Mon compte
                      </a>
                      <a
                        href="/posts"
                        onClick={closeAll}
                        className="block px-4 py-3 text-sm hover:bg-white/10 transition"
                      >
                        Mes posts
                      </a>
                      <button
                        onClick={() => {
                          logout();
                          closeAll();
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition"
                      >
                        Me déconnecter
                      </button>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <div className="mt-2 border-t border-white/10 pt-2">
                        <button
                          onClick={() =>
                            setMobileSection((s) => (s === "moderation" ? null : "moderation"))
                          }
                          className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition flex items-center justify-between"
                        >
                          <span>Modération</span>
                          <span className="text-white/40">
                            {mobileSection === "moderation" ? "–" : "+"}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {mobileSection === "moderation" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-l border-white/10 ml-4"
                            >
                              <div className="py-2">
                                <a
                                  href="/moderation/users"
                                  onClick={closeAll}
                                  className="block px-4 py-2 hover:bg-white/10 transition"
                                >
                                  Liste utilisateurs
                                </a>
                                <a
                                  href="/moderation/articles/add"
                                  onClick={closeAll}
                                  className="block px-4 py-2 hover:bg-white/10 transition"
                                >
                                  Ajouter article
                                </a>
                                <a
                                  href="/moderation/articles/manage"
                                  onClick={closeAll}
                                  className="block px-4 py-2 hover:bg-white/10 transition"
                                >
                                  Editer article
                                </a>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-white/10 text-[10px] tracking-[0.35em] uppercase text-white/40">
                Jonathan — hommage
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}