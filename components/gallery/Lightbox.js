"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ images, index, setIndex, onClose }) {
  if (index === null || !images.length) return null;

  const prev = () => {
    setIndex((index - 1 + images.length) % images.length);
  };

  const next = () => {
    setIndex((index + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white"
      >
        <X size={32} />
      </button>

      {/* Prev */}
      <button
        onClick={prev}
        className="absolute left-6 text-white"
      >
        <ChevronLeft size={40} />
      </button>

      {/* Image */}
      <img
        src={images[index].imageUrl}
        alt={images[index].title || "Gallery image"}
        className="max-h-[85vh] max-w-[90vw] rounded-lg"
      />

      {/* Next */}
      <button
        onClick={next}
        className="absolute right-6 text-white"
      >
        <ChevronRight size={40} />
      </button>
    </div>
  );
}
