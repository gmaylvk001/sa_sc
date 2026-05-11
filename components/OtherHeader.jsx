'use client';

import Link from "next/link";
import { useState } from 'react';
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Grade", href: "/#grade" },
  { label: "Why Parent Trust Us", href: "/#Why" },
  { label: "Activities", href: "/#ACTIVITIES" },
  { label: "Admission Open", href: "/admission" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blogs", href: "/blog" },
];

const OtherHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">

          {/* Logo */}
          <Link href="/">
            <img
              src="/user/logo.png"
              alt="Logo"
              style={{ imageRendering: 'auto' }}
              className="object-contain w-16 h-auto"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            {navLinks.map((link) => {
              
              // HASH remove pannrom active check ku
              const cleanHref = link.href.split("#")[0] || "/";

              const isActive =
                pathname === cleanHref;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-red-500"
                      : "text-gray-800 hover:text-red-500"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden ml-auto focus:outline-none bg-red-500 text-white rounded p-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 12h16"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 18h16"
                  />
                </>
              )}
            </svg>
          </button>

        </div>
      </header>

      {/* Spacer */}
      <div className="h-[72px]" />

      {/* Mobile Sidebar Menu */}
      {isOpen && (
        <nav className="fixed inset-0 z-40 flex md:hidden text-white font-semibold text-xl">

          {/* LEFT MENU */}
          <div className="menu-slide-left flex flex-col space-y-8 px-6 pt-8 bg-red-600 w-[280px]">

            {navLinks.map((link) => {

              const cleanHref = link.href.split("#")[0] || "/";

              const isActive =
                pathname === cleanHref;

              return (
                <Link
                  key={link.href}
                  className={`menu-item transition-all duration-300 ${
                    isActive
                      ? "text-yellow-300"
                      : "text-white"
                  }`}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="menu-text">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Click outside to close */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
        </nav>
      )}
    </>
  );
};

export default OtherHeader;
