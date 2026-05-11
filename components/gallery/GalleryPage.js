"use client";

import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import Lightbox from "./Lightbox";

export default function GalleryPage() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tabLoading, setTabLoading] = useState(false);
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

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setTabLoading(true); // start loading
    setActiveImage(null);
    setPage(1);

    // Simulate a small delay for loading effect
    setTimeout(() => {
      setTabLoading(false);
    }, 300); // 0.3s for smoothness
  };

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
      <div className="min-h-screen flex justify-center items-center py-20 bg-gradient-to-r from-pink-100 via-blue-100 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const noGalleryData = categories.length === 0 || images.length === 0;

  const breakpointColumns = {
    default: 5,
    1280: 4,
    1024: 3,
    640: 2,
  };


  return (
    <>
      {/* <section className="relative bg-cover bg-center py-16">
        Overlay
        <div className="absolute inset-0"></div>
      </section> */}

      <section className="pb-10 mt-4 min-h-screen bg-gradient-to-r from-pink-100 via-blue-100 to-white">

        <div className="bg-gradient-to-r from-red-600 to-red-500 py-14 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our School Moments</h1>
          <p className="max-w-2xl mx-auto">
            Moments of learning, growth, and happiness that shape our young minds every day.
          </p>
        </div>

        {/* If No Images */}
        {noGalleryData ? (
          <div className="bg-gradient-to-r from-pink-100 via-blue-100 to-white min-h-screen flex items-center justify-center py-20">
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
                onClick={() => handleTabClick(tab)}
                className={`px-5 py-2 rounded-full border transition-all duration-300 transform ${
                  activeTab === tab
                    ? "bg-red-500 text-white"
                    : "bg-white hover:bg-gray-100 hover:scale-105 hover:shadow-lg hover:border-red-500"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Masonry Image Grid */}
          <div className="flex justify-center">
            {tabLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex gap-4"
                columnClassName="flex flex-col gap-4"
              >
                {paginatedImages.map((img, index) => (
                  <div key={img._id} className="cursor-pointer transition-transform hover:scale-105 rounded-xl overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt={img.title || "Gallery image"}
                      onClick={() => setActiveImage(index)}
                      className="w-full rounded-xl"
                    />
                  </div>
                ))}
              </Masonry>
            )}
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
