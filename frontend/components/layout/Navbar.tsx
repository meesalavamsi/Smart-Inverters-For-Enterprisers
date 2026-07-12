"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ShoppingCart, ChevronDown, Globe, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useAuthStore, useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
];

const navLinks = [
  { href: "/", key: "home" },
  { href: "/products", key: "products" },
  { href: "/service-booking", key: "services" },
  { href: "/learning-center", key: "learningCenter" },
  { href: "/recycling", key: "recycling" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLocale = (locale: string) => {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    window.location.reload();
    setLangOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
    setUserOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-400 relative",
        scrolled
          ? "bg-white/80 backdrop-blur-2xl shadow-md"
          : "bg-white/60 backdrop-blur-xl"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 group-hover:from-green-600 group-hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-300/50 group-hover:scale-105 group-hover:shadow-green-400/60">
              <Zap className="h-5 w-5 text-white" />
              <span className="absolute inset-0 rounded-xl ring-2 ring-green-400/0 group-hover:ring-green-400/40 transition-all duration-300" />
            </div>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight">
              Smart <span className="gradient-text-blue">Inverter's</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1 bg-gray-50/80 rounded-full p-1 border border-gray-100">
            {navLinks.map((link) => (
              <li key={link.key} className="relative">
                <Link
                  href={link.href}
                  className={cn(
                    "relative z-10 block px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200",
                    pathname === link.href
                      ? "text-white"
                      : "text-gray-600 hover:text-green-700"
                  )}
                >
                  {t(link.key)}
                </Link>
                {pathname === link.href && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-md shadow-green-300/50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 text-sm transition-colors"
              >
                <Globe className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden"
                  >
                    {LOCALES.map((loc) => (
                      <button
                        key={loc.code}
                        onClick={() => handleLocale(loc.code)}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                      >
                        <span>{loc.flag}</span>
                        <span>{loc.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1 px-3 py-2 rounded-full text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-white text-[10px] font-bold shadow-md shadow-green-400/50 animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-green-50 text-sm transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[80px] truncate font-medium">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden"
                    >
                      {user.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                          <Settings className="h-4 w-4" />Admin Dashboard
                        </Link>
                      )}
                      <Link href="/dashboard" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                        <LayoutDashboard className="h-4 w-4" />My Account
                      </Link>
                      <hr className="border-gray-100" />
                      <button onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-green-700 border border-green-200 hover:border-green-400 hover:bg-green-50 rounded-full transition-all duration-200">
                  {t("login")}
                </Link>
                <Link href="/register"
                  className="px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-full transition-all duration-200 shadow-md shadow-green-300/50 hover:shadow-lg hover:shadow-green-400/50 hover:scale-105">
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Brand accent stripe */}
      <div className="h-[3px] w-full bg-gradient-to-r from-green-400 via-green-600 to-green-400" />

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  )}
                >
                  {t(link.key)}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors">
                    {t("login")}
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    {t("register")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
