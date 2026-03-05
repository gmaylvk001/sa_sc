"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ActivityDetail({ slug }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [current, setCurrent]   = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/activities/getbyslug?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setActivity(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center py-20 bg-gradient-to-r from-pink-100 via-blue-100 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Activity Not Found</h1>
        <p className="text-gray-500 mb-6">The activity you are looking for does not exist.</p>
        <Link href="/#ACTIVITIES" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
          Back to Activities
        </Link>
      </div>
    );
  }

  const gallery = activity.gallery?.length ? activity.gallery : [activity.imageSrc];
  const total   = gallery.length;
  const prev    = () => setCurrent((c) => (c - 1 + total) % total);
  const next    = () => setCurrent((c) => (c + 1) % total);

  return (
    <section className="bg-gradient-to-r from-pink-100 via-blue-100 to-white">

      <section className="relative bg-cover bg-center py-16">
        {/* Overlay */}
        <div className="absolute inset-0"></div>
      </section>

      {/* BANNER */}
      {/* <section className="max-w-7xl mx-auto px-6 pt-6">
        <div className="relative w-full h-[50vh] md:h-[70vh] rounded-3xl overflow-hidden flex flex-col justify-end bg-gray-900">
           Blurred backdrop - always fills entire area 
          <img
            src={activity.imageSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg opacity-60"
          />
          Main image on top - anchored to top
          <img
            src={activity.imageSrc}
            alt={activity.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 px-8 pb-10">
            <p className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Sports & Activities
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {activity.name}
            </h1>
            <p className="text-white/80 text-lg md:text-xl mt-2">{activity.tagline}</p>
          </div>
        </div>
      </section> */}

      {/* CAROUSEL + CONTENT */}
      <section className="py-8 bg-gradient-to-r from-pink-100 via-blue-100 to-white">
        <div className="max-w-7xl mx-auto px-6 items-center justify-center p-8 md-p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden shadow-xl border border-gray-100 items-center p-3 md:p-6 bg-white rounded-2xl">
            {/* LEFT: Image Carousel */}
            <div
              className="relative w-full bg-gray-100 overflow-hidden h-72 sm:h-96 md:h-[420px] lg:h-[520px] rounded-2xl flex justify-center items-center mb-3"
            >
              <img
                src={gallery[current]}
                alt={`${activity.name} ${current + 1}`}
                className="w-full h-full object-contain sm:object-contain object-center rounded-2xl"
              />

              {total > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-2 rounded-full transition-all ${i === current ? "bg-red-600 w-4" : "bg-black w-2"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Text Content */}
            <div className="flex flex-col justify-center items-start px-3 md:px-6 bg-white h-full">
              <div>
                <span className="inline-block bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  About {activity.name}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                  {activity.name}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {activity.description}
                </p>

                {activity.highlights?.length > 0 && (
                  <ul className="space-y-2 mb-8">
                    {activity.highlights.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-red-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-gray-700 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href="/admission"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md text-center text-sm"
                >
                  Apply for Admission
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="bg-gradient-to-r from-pink-100 via-blue-100 to-white pb-10 text-center">
        <Link
          href="/#ACTIVITIES"
          className="text-red-600 font-semibold text-sm hover:underline inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Activities
        </Link>
      </div>

    </section>
  );
}
