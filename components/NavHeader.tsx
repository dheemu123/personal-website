"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "hobbies", label: "Hobbies" },
  { id: "contact", label: "Contact" },
];

export default function NavHeader() {
  const [activeSection, setActiveSection] = useState("home");
  const [hasScrolled, setHasScrolled] = useState(false);

  // Track scroll position for background opacity change
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer to track active section
  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: "-96px 0px -60% 0px",
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  // Smooth scroll handler
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-4 right-4 z-[80] px-2 py-2 rounded-full border transition-all duration-300 ${
        hasScrolled
          ? "bg-white/80 backdrop-blur-md border-white/70 shadow-lg shadow-blue-500/10"
          : "bg-white/60 backdrop-blur-sm border-white/50 shadow-md shadow-blue-500/5"
      }`}
    >
      <ul className="flex items-center gap-1">
        {navLinks.map((link) => (
          <li key={link.id}>
            <button
              onClick={() => handleClick(link.id)}
              className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 rounded-full ${
                activeSection === link.id
                  ? "text-blue-600"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {/* Active indicator pill */}
              {activeSection === link.id && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 bg-blue-100/60 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
