"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ images, index, setIndex, onClose }) {
  if (index === null || !images.length) return null;
  
  const hasMultipleimage = images.length > 1;

  const prev = () => {
    setIndex((index - 1 + images.length) % images.length);
  };

  const next = () => {
    setIndex((index + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white"
      >
        <X size={32} />
      </button>

      {hasMultipleimage && (
        <>
          {/* Prev */}
          <button
            onClick={prev}
            className="absolute left-6 text-white"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="absolute right-6 text-white"
          >
            <ChevronRight size={40} />
          </button>
        </>
      )}

      {/* Image */}
      <img
        src={images[index].imageUrl}
        alt={images[index].title || "Gallery image"}
        className="max-h-[75vh] max-w-[90vw] rounded-lg mb-4"
      />

      {/* Title */}
      {images[index]?.title?.trim() && (
        <h3 className="text-white text-lg text-center">
          {images[index].title}
        </h3>
      )}
    </div>
  );
}
