"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

type LatestItem = {
  title: string;
  href: string;
  year: string;
};

export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null);

  const [scrolled, setScrolled] = useState(false);

  const [articlesOpen, setArticlesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);

  const [latest, setLatest] = useState<LatestItem[]>([]);
  const [latestLoaded, setLatestLoaded] = useState(false);

  const { user, loading, ready, logout } = useAuth();

  const closeAll = () => {
    setArticlesOpen(false);
    setAccountOpen(false);
    setModerationOpen(false);
  };

  const openArticles = () => {
    setArticlesOpen(true);
    setAccountOpen(false);
    setModerationOpen(false);
  };

  const openAccount = () => {
    setAccountOpen(true);
    setArticlesOpen(false);
    setModerationOpen(false);
  };

  const openModeration = () => {
    setModerationOpen(true);
    setArticlesOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = navRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) closeAll();
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!articlesOpen || latestLoaded) return;

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
  }, [articlesOpen, latestLoaded]);

  return (
    <nav
      ref={(el) => {
        navRef.current = el;
      }}
      className={`fixed top-0 left-0 w-full z-50 px-10 py-6 transition-all duration-700 ${
        scrolled ? "bg-black/60 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center text-sm tracking-widest uppercase">
        <a href="/" className="hover:opacity-60 transition" onClick={closeAll}>
          Jonathan
        </a>

        <div className="flex gap-10 items-center">
          <a href="/jonathan" onClick={closeAll} className="hover:opacity-60 transition">
            Qui est-il?
          </a>

          <a href="/photos" onClick={closeAll} className="hover:opacity-60 transition">
            Photos
          </a>

          {/* LES ARTICLES */}
          <div className="relative" onMouseEnter={openArticles}>
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

          {/* ✅ BLOC AUTH/ADMIN : tout apparaît d’un coup */}
          <div className="flex items-center gap-10">
            {!ready ? (
              // placeholder unique, stable
              <span className="block px-4 py-2 text-sm text-white/40 tracking-[0.3em] select-none">
                ...
              </span>
            ) : (
              <>
                {/* MODÉRATION */}
                {user?.role === "admin" && (
                  <div className="relative" onMouseEnter={openModeration}>
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

                {/* AUTH */}
                {!user ? (
                  <a href="/login" onClick={closeAll} className="hover:opacity-60 transition">
                    CONNEXION
                  </a>
                ) : (
                  <div className="relative" onMouseEnter={openAccount}>
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

          {/* (Optionnel) loading state restant si tu veux le garder visible ailleurs */}
          {/* {loading && <span className="text-white/30 text-xs">loading</span>} */}
        </div>
      </div>
    </nav>
  );
}