"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 px-10 py-6 transition-all duration-700 ${
        scrolled ? "bg-black/60 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center text-sm tracking-widest uppercase">

        {/* Logo */}
        <a href="/" className="hover:opacity-60 transition">
          Jonathan
        </a>

        <div className="flex gap-10 items-center">

          <a href="/jonathan" className="hover:opacity-60 transition">
            Qui est-il?
          </a>

          <a href="/photos" className="hover:opacity-60 transition">
            Photos
          </a>

          {/* Les Dates */}
          <div
            className="relative"
            onMouseEnter={() => setDatesOpen(true)}
            onMouseLeave={() => setDatesOpen(false)}
          >
            <button className="hover:opacity-60 transition">
              LES DATES
            </button>

            <AnimatePresence>
              {datesOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-40 bg-black border border-white/10 rounded-sm shadow-lg overflow-hidden"
                >
                  <li>
                    <a href="/dates/2026" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                      2026
                    </a>
                  </li>
                  <li>
                    <a href="/dates/2024" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                      2024
                    </a>
                  </li>
                  <li>
                    <a href="/dates/2022" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                      2022
                    </a>
                  </li>
                  <li>
                    <a href="/dates/more" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                      Plus...
                    </a>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Auth */}
          {!user ? (
            <a href="/login" className="hover:opacity-60 transition">
              CONNEXION
            </a>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <button className="hover:opacity-60 transition">
                MON COMPTE
              </button>

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
                      <a href="/account" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                        Mes informations
                      </a>
                    </li>
                    <li>
                      <a href="/posts" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                        Mes posts
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={logout}
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

        </div>
      </div>
    </nav>
  );
}
