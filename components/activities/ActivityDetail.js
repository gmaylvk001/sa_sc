"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ActivityDetail({ slug }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/activities/getbyslug?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setActivity(data.data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => setEntered(true), 80);
      });
  }, [slug]);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── LOADER ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
        <div className="w-12 h-12 rounded-full border-[3px] border-white/10 border-t-red-600 animate-spin" />
        <p className="text-white/40 text-[10px] font-bold tracking-[0.26em] uppercase">
          Loading
        </p>
      </div>
    );
  }

  /* ── 404 ── */
  if (!activity) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-4 px-10 text-center">
        <span
          className="text-red-600 leading-none"
          style={{ fontSize: "clamp(100px,18vw,180px)", fontFamily: "'Bebas Neue',sans-serif" }}
        >
          404
        </span>
        <h1 className="text-white/60 text-lg font-light tracking-widest">
          Activity Not Found
        </h1>
        <Link
          href="/#ACTIVITIES"
          className="mt-2 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold tracking-[0.14em] uppercase px-7 py-3 rounded-xl transition-all duration-200"
        >
          ← Back to Activities
        </Link>
      </div>
    );
  }

  const gallery = activity.gallery?.length ? activity.gallery : [activity.imageSrc];
  const total = gallery.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <>
      <div
        className={`font-inter bg-white transition-all duration-500 ease-out ${
          entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative w-full h-screen min-h-[600px] overflow-hidden flex flex-col justify-end bg-neutral-900">

          {/* Parallax Background */}
          <div
            className="absolute will-change-transform bg-neutral-900 bg-no-repeat bg-center"
            style={{
              inset: "-10%",
              backgroundImage: `url(${activity.imageSrc})`,
              backgroundSize: "contain",
              transform: `translateY(${scrollY * 0.28}px) scale(1.1)`,
            }}
          />

          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.52) 40%, rgba(0,0,0,0.08) 100%)",
            }}
          />

          {/* Navbar */}
          <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 md:px-14 py-7">

            <Link
              href="/#ACTIVITIES"
              className="inline-flex items-center gap-2 text-white/55 hover:text-white transition-colors text-[10px] font-bold tracking-[0.16em] uppercase hover:gap-3"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All Activities
            </Link>

            <span className="inline-flex items-center gap-2 px-[18px] py-2 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase border border-red-600/45 bg-red-600/12 text-white/82 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_#DC2626] anim-blink" />
              Sports & Activities
            </span>
          </nav>

          {/* Hero Copy */}
          <div className="relative z-10 px-6 md:px-14 pb-16 md:pb-20 max-w-[860px]">
            <p className="inline-flex items-center gap-2.5 text-red-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-3.5 before:content-[''] before:block before:w-6 before:h-0.5 before:bg-red-600 before:rounded-sm">
              Featured Activity
            </p>
             <h1
              className="text-white leading-[0.88] tracking-wide mb-4"
              style={{
                fontSize: "clamp(62px, 10vw, 145px)",
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {activity.name}
            </h1>
            {activity.tagline && (
              <p
                className="text-white/50 font-light leading-[1.8] max-w-[440px]"
                style={{ fontSize: "clamp(14px, 1.5vw, 17px)" }}
              >
                {activity.tagline}
              </p>
            )}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute right-14 bottom-15 hidden md:flex flex-col items-center gap-2.5 z-10">
            <div className="w-px h-14 anim-fadeline" style={{ background: "linear-gradient(to bottom, rgba(220,38,38,0.8), transparent)" }} />
            <span className="text-[8px] tracking-[0.3em] uppercase text-white/22 writing-vertical">scroll</span>
          </div>
        </section>

        {/* ═══════════════ INTRO ═══════════════ */}
        <section className="bg-white px-6 md:px-14 py-14 md:py-14 border-b border-neutral-100">
          <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-20 items-start">

            {/* Left */}
            <div>
              <span className="inline-block text-red-600 text-[9px] font-bold tracking-[0.24em] uppercase border border-red-600/25 bg-red-600/5 px-3.5 py-1.5 rounded-full mb-4">
                About the Activity
              </span>
              <h2
                className="text-neutral-900 leading-[0.92]"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(48px, 6vw, 88px)",
                }}
              >
                {activity.name}
              </h2>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-6">
              <p className="text-neutral-500 font-light leading-[1.95] text-[15px]">
                {activity.description}
              </p>
              <div>
                <Link
                  href="/admission"
                  className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold tracking-wide px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(220,38,38,0.28)] hover:shadow-[0_16px_40px_rgba(220,38,38,0.38)]"
                >
                  Apply for Admission
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ GALLERY + HIGHLIGHTS ═══════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] min-h-[660px]">

          {/* ── Gallery Panel ── */}
          <div className="bg-white p-6 md:p-11 flex flex-col gap-5 border-r border-white/[0.04]">

            <span className="self-start inline-block text-red-600 text-[9px] font-bold tracking-[0.24em] uppercase border border-red-600/50 bg-red-600/15 px-3.5 py-1.5 rounded-full">
              Photo Gallery
            </span>

            {/* Main Frame */}
            <div className="relative w-full h-[260px] sm:h-[360px] md:h-[460px] rounded-2xl overflow-hidden bg-neutral-800 border border-white/[0.06]">

              {/* Blur bg */}
              <div
                className="absolute inset-0 scale-110 blur-3xl opacity-20 bg-cover bg-center"
                style={{ backgroundImage: `url(${gallery[current]})` }}
              />

              {/* Main image */}
              <img
                key={`g-${current}`}
                src={gallery[current]}
                alt={`${activity.name} ${current + 1}`}
                className="absolute inset-0 w-full h-full object-contain z-10 p-5 anim-imgin hover:scale-[1.03] transition-transform duration-700"
              />

              {/* Fade overlay */}
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 50%)" }}
              />

              {/* Prev / Next */}
              {total > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-3.5 pointer-events-none z-30">
                  <button
                    onClick={prev}
                    aria-label="Previous image"
                    className="pointer-events-auto w-9 h-9 rounded-full bg-white hover:bg-white flex items-center justify-center text-neutral-900 shadow-lg transition-all duration-200 hover:scale-110 border-0"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next image"
                    className="pointer-events-auto w-9 h-9 rounded-full bg-white hover:bg-white flex items-center justify-center text-neutral-900 shadow-lg transition-all duration-200 hover:scale-110 border-0"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {total > 1 && (
              <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`flex-none w-[86px] aspect-video rounded-xl overflow-hidden border-2 bg-transparent p-0 cursor-pointer transition-all duration-250 ${
                      i === current
                        ? "border-red-600 opacity-100 scale-105 shadow-[0_0_16px_rgba(220,38,38,0.45)]"
                        : "border-transparent opacity-40 hover:opacity-80 hover:scale-105"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover block" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Highlights Panel ── */}
          <div className="bg-neutral-50 px-6 md:px-11 py-12 md:py-14 flex flex-col justify-center border-l border-neutral-100">

            <span className="self-start inline-block text-red-600 text-[14px] font-bold tracking-[0.24em] uppercase border border-red-600/25 bg-red-600/5 px-3.5 py-1.5 rounded-full mb-6">
              Program Highlights
            </span>

            {activity.highlights?.length > 0 ? (
              <ul className="list-none p-0 m-0">
                {activity.highlights.map((point, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_20px] items-center gap-3 py-4 border-b border-black/[0.06] first:border-t first:border-black/[0.06] group cursor-default rounded-md transition-all duration-200 hover:bg-red-600/[0.04] hover:px-2"
                  >
                    <p className="flex items-start gap-3 text-[16px] font-medium text-neutral-800 leading-relaxed">
                      <span className="mt-[7px] w-1.5 h-1.5 min-w-[6px] rounded-full bg-red-600 flex-shrink-0" />
                      {point}
                    </p>
                    {/* <span className="flex justify-end text-black/15 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-200">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span> */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-400 text-sm">No highlights listed.</p>
            )}
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section className="relative bg-red-600 px-6 md:px-14 py-14 md:py-14 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/[0.07] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-black/[0.07] pointer-events-none" />

          <div className="relative z-10 max-w-[1160px] mx-auto flex flex-wrap items-center justify-between gap-9">
            <div>
              <p className="text-white/50 text-[9px] font-bold tracking-[0.26em] uppercase mb-2.5">
                Ready to begin?
              </p>
              <h3
                className="font-bebas text-white leading-[0.95] tracking-wide"
                style={{ fontSize: "clamp(30px, 4.5vw, 52px)" }}
              >
                Join {activity.name} today
              </h3>
            </div>

            <Link
              href="/admission"
              className="inline-flex items-center gap-2.5 bg-white hover:bg-red-50 text-red-600 text-[13px] font-bold tracking-wide px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shadow-[0_8px_32px_rgba(0,0,0,0.18)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.26)]"
            >
              Apply for Admission
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="bg-neutral-900 border-t border-white/[0.05] px-6 md:px-14 py-6 flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/#ACTIVITIES"
            className="inline-flex items-center gap-2.5 text-white hover:text-red-600 transition-all duration-200 hover:gap-3.5 text-[10px] font-bold tracking-[0.18em] uppercase"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to All Activities
          </Link>
          <span className="font-bebas text-[13px] tracking-[0.18em] text-white/12">
            Sports & Activities
          </span>
        </footer>

      </div>
    </>
  );
}
