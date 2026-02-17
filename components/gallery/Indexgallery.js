"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Lightbox from "./Lightbox";

export default function IndexGalleryPreview() {
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewCount, setPreviewCount] = useState(15);

  // Detect screen size
  useEffect(() => {
    const updatePreviewCount = () => {
      if (window.innerWidth < 1024) {
        // Mobile + Medium (below lg)
        setPreviewCount(10);
      } else {
        // Large screens
        setPreviewCount(13);
      }
    };

    updatePreviewCount();
    window.addEventListener("resize", updatePreviewCount);

    return () => window.removeEventListener("resize", updatePreviewCount);
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch("/api/gallery/images");
        const data = await res.json();
        const activeImages = Array.isArray(data)
          ? data.filter((img) => img.status === true)
          : [];

        setImages(activeImages);
      } catch (err) {
        console.error(err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  if (loading || images.length === 0) return null;

  const displayedImages = images.slice(0, previewCount);

  return (
    <section className="py-14 max-w-7xl mx-auto px-6 bg-gradient-to-r from-pink-100 via-blue-100 to-white shadow">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">
          Life at <span className="text-red-600">Sathya School</span>
        </h2>
        <p className="text-gray-600 mt-2">
          Capturing joyful learning, creativity, and memorable moments at Sathya School.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="columns-2 sm:columns-3 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 max-w-[1200px]">
          {displayedImages.map((img, index) => (
            <div
              key={img._id}
              className="cursor-pointer transition-transform hover:scale-105 rounded-xl"
            >
              <img
                src={img.imageUrl}
                alt={img.title || "Gallery image"}
                onClick={() => setActiveImage(index)}
                className="block w-full rounded-xl"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 text-center">
        <Link
          href="/gallery"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-400 text-white font-semibold hover:gap-3 transition-all border border-red-500 rounded-full py-2 px-3 transform hover:scale-105"
        >
          View Full Gallery
        </Link>
      </div>

      <Lightbox
        images={displayedImages}
        index={activeImage}
        setIndex={setActiveImage}
        onClose={() => setActiveImage(null)}
      />
    </section>
  );
}
