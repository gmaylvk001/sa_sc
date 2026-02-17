"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function BlogComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") || "all";

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([{ _id: "all", name: "All" }]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const limit = 2;
  const debounceRef = useRef(null);
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // ✅ Fetch blogs function
  const fetchBlogs = async (reset = false) => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory === "all" ? "" : selectedCategory;

      const res = await fetch(
        `/api/blogs/frontend?search=${searchTerm}&category=${categoryParam}&page=${page}&limit=${limit}`
      );

      const json = await res.json();

      if (json.success) {
        setBlogs((prev) => (reset ? json.data : [...prev, ...json.data]));
        setHasMore(json.page * json.limit < json.total);

        // Update categories dynamically
        const uniqueCategoriesMap = new Map();
        json.data.forEach((blog) => {
          if (
            blog.category?._id &&
            blog.category?.status === true
          ) {
            uniqueCategoriesMap.set(blog.category._id, blog.category);
          }
        });

        setCategories((prev) => {
          const merged = new Map();
          prev.forEach((cat) => merged.set(cat._id, cat));
          uniqueCategoriesMap.forEach((cat) => merged.set(cat._id, cat));
          return [{ _id: "all", name: "All" }, ...merged.values()].filter(
            (cat, index, self) => index === self.findIndex((c) => c._id === cat._id)
          );
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial Load
  useEffect(() => {
    fetchBlogs(true);
  }, []);

  // ✅ Handle search & category change (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setBlogs([]);
      setPage(1);
      setHasMore(true);
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, selectedCategory]);

  // ✅ Fetch blogs on page/search/category change
  useEffect(() => {
    fetchBlogs(page === 1);
  }, [page, searchTerm, selectedCategory]);

  // ✅ Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  // ✅ Handle category click
  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setBlogs([]);
    setPage(1);
    setHasMore(true);

    // Update URL without reload
    const params = new URLSearchParams(window.location.search);
    if (catId === "all") params.delete("category");
    else params.set("category", catId);
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <>
      <section className="relative bg-cover bg-center py-16">
        <div className="absolute inset-0"></div>
      </section>

      <section className="pt-2 pb-8 min-h-screen bg-gradient-to-r from-pink-100 via-blue-100 to-white">
        {/* Hero */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 py-14 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Blogs</h1>
          <p className="max-w-2xl mx-auto">
            Explore the latest news, articles, and insights.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">

          <div className="lg:col-span-1 space-y-6 px-6 py-5 shadow rounded-xl lg:sticky lg:top-24 self-start bg-white">

            <div>
              <h3 className="font-semibold text-lg mb-5 border-b">Search</h3>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-5 border-b">Categories</h3>

              {/* Scrollable container */}
              <div className="flex flex-col max-h-72 overflow-y-auto scrollbar-hide">
                {categories.map((cat) => (
                  <div key={cat._id} className="w-full border-b">
                    <button
                      onClick={() => handleCategoryClick(cat._id)}
                      className={`
                        w-fit px-4 py-2 rounded-lg text-md text-left mb-2 
                        relative overflow-hidden 
                        transition-colors duration-500
                        ${selectedCategory === cat._id
                          ? "text-red-500"
                          : "text-gray-700 hover:text-red-500"
                        }
                      `}
                    >
                      <span className="relative z-10">{cat.name}</span>
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>


          <div className="lg:col-span-3">
            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col group hover:-translate-y-2 hover:shadow-2xl transition duration-300"
                  >
                    <div className="h-52 w-full overflow-hidden">
                      <img
                        src={blog.image || "/default-blog.jpg"}
                        alt={blog.blog_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <span className="text-red-500 text-xs bg-red-100 px-3 py-1 rounded-full w-max mb-3">
                        {new Date(blog.createdAt).toLocaleDateString("en-GB")}
                      </span>

                      <Link
                        href={`/blog/${blog.blog_slug}`}
                        className="group-hover:text-red-500 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-red-500 mb-2 hover:underline">
                          {blog.blog_name.slice(0,25)}
                        </h3>
                      </Link>

                      <p className="text-gray-600 flex-1 mb-4 text-sm">
                        {stripHtml(blog.description).slice(0, 90)}...
                      </p>

                      <Link
                        href={`/blog/${blog.blog_slug}`}
                        className="relative inline-block overflow-hidden text-red-500 text-sm font-medium py-2 px-3 rounded-lg underline
                        transition-colors duration-300
                        before:absolute before:inset-0 before:bg-red-600
                        before:origin-left before:scale-x-0 before:transition-transform before:duration-300
                        hover:text-white hover:before:scale-x-100 w-max"
                      >
                        <span className="relative z-10">Read More</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-center text-gray-500">No blogs found.</p>
              </div>
            )}
          </div>

        </div>
        {loading && blogs.length > 0 && (
          <div className="col-span-full flex justify-center py-10">
            <div className="flex items-center gap-3 text-red-500 font-medium">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
              Loading more blogs...
            </div>
          </div>
        )}
      </section>
    </>
  );
}
