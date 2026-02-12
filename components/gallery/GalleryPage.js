"use client";

import { useState, useEffect } from "react";
import Lightbox from "./Lightbox";

export default function GalleryPage() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const imagesPerPage = 20;

  // Load categories
  const loadCategories = async () => {
    try {
      const res = await fetch("/api/gallery/categories");
      const data = await res.json();

      const activeCategories = Array.isArray(data)
        ? data.filter((cat) => cat.status === true)
        : [];

      // Filter categories that have at least one active image
      const filteredCategories = activeCategories.filter((cat) =>
        images.some((img) => img.status === true && img.category?.slug === cat.slug)
      );

      setCategories(filteredCategories);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  // Load images
  const loadImages = async () => {
    try {
      const res = await fetch("/api/gallery/images");
      const data = await res.json();

      const activeImages = Array.isArray(data)
        ? data.filter((img) => img.status === true)
        : [];

      setImages(activeImages);
      return activeImages;
    } catch (err) {
      console.error(err);
      setImages([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const activeImages = await loadImages();
      try {
        const res = await fetch("/api/gallery/categories");
        const data = await res.json();

        const activeCategories = Array.isArray(data)
          ? data.filter((cat) => cat.status === true)
          : [];

        const filteredCategories = activeCategories.filter((cat) =>
          activeImages.some((img) => img.category?.slug === cat.slug)
        );

        setCategories(filteredCategories);
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    }

    fetchData();
  }, []);

  // Close lightbox when tab changes
  useEffect(() => {
    setActiveImage(null);
    setPage(1); // Reset page when tab changes
  }, [activeTab]);

  // Tabs with "all" plus only categories with images
  const tabs = ["all", ...categories.map((c) => c.slug)];

  // Filter images by active tab
  const filteredImages =
    activeTab === "all"
      ? images
      : images.filter((img) => img.category?.slug === activeTab);

  // Pagination slice of images
  const paginatedImages = filteredImages.slice(0, page * imagesPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading gallery...</p>
      </div>
    );
  }

  const noGalleryData = categories.length === 0 || images.length === 0;


  return (
    <>
      <section className="relative bg-cover bg-center py-16">
        {/* Overlay */}
        <div className="absolute inset-0"></div>
      </section>

      <section className="pb-10 mt-4 min-h-screen">

        <div className="bg-gradient-to-r from-red-600 to-red-500 py-14 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our School Moments</h1>
          <p className="max-w-2xl mx-auto">
            Moments of learning, growth, and happiness that shape our young minds every day.
          </p>
        </div>

        {/* If No Images */}
        {noGalleryData ? (
          <div className="min-h-screen flex items-center justify-center py-20">
            <p className="text-gray-500 text-lg italic">
              No gallery images found.
            </p>
          </div>
        ) : (
        <div className="max-w-7xl mx-auto px-6 text-center">

          {/* Tabs */}
          <div className="flex justify-center gap-4 flex-wrap my-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full border transition ${
                  activeTab === tab ? "bg-red-500 text-white" : "hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Masonry Image Grid */}
          <div className="flex justify-center">
            <div className="columns-2 sm:columns-3 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6 max-w-[1200px]">
              {paginatedImages.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 italic">
                  No images available in this category.
                </p>
              ) : (
                paginatedImages.map((img, index) => (
                  <img
                    key={img._id}
                    src={img.imageUrl}
                    alt={img.title || "Gallery image"}
                    onClick={() => setActiveImage(index)}
                    className="block mx-auto rounded-lg cursor-pointer hover:scale-105 transition shadow break-inside-avoid"
                  />
                ))
              )}
            </div>
          </div>

          {/* Load More Button */}
          {page * imagesPerPage < filteredImages.length && (
            <div className="text-center mt-6">
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
        )}

        {/* Lightbox */}
        <Lightbox
          images={paginatedImages}
          index={activeImage}
          setIndex={setActiveImage}
          onClose={() => setActiveImage(null)}
        />
      </section>
    </>
  );
}
