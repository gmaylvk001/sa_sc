// app/blog/[slug]/page.js
import React from "react";
import Link from "next/link";

// ================= FETCH BLOGS =================
async function getBlogs() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/blogs/get`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch blogs");

    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Fetch blogs error:", error);
    return [];
  }
}

// ================= PAGE =================
export default async function BlogPost({ params }) {
  const { slug } = params;

  const blogs = await getBlogs();
  const blog = blogs.find((b) => b.blog_slug === slug);

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h1 className="text-xl font-semibold mb-2">Blog not found</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  // Recent posts (exclude current)
const recentPosts = blogs
  .filter(b => b._id !== blog._id && b.status === "Active")
  .slice(0, 3);

  // Unique categories
  const categories = [
    ...new Map(
      blogs
        .filter(b => b.category && b.status === "Active")
        .map(b => [b.category._id, b.category])
    ).values()
  ];

  return (
    <>
    <section className="relative bg-cover bg-center py-16 "> 
        <div className="absolute inset-0"></div>
    </section>

    <section className="bg-gradient-to-r from-pink-100 via-blue-100 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-4 gap-8">

        {/* ================= LEFT CONTENT ================= */}
        <article className="lg:col-span-3 bg-white rounded-xl  px-3 py-4 md:px-5 md:py-6 mb-4">
          
          {blog.image && (
            <div className="mb-8 rounded-lg overflow-hidden aspect-video">
              <img
                src={blog.image}
                alt={blog.blog_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}


          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {blog.blog_name}
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Published on{" "}
            {new Date(blog.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="prose prose-lg max-w-none">
            <div
              className="blog-content text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.description }}
            />
          </div>
        </article>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="space-y-8 lg:sticky lg:top-24 self-start">

          {/* -------- Recent Posts -------- */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2 flex items-center gap-2">
              Recent Posts
            </h3>

            {recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.blog_slug}`}
                    className="group flex flex-col sm:flex-row gap-3 items-start sm:items-center min-w-0"
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.blog_name}
                        className="w-full max-w-[120px] w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="max-w-[calc(100vw-80px)] sm:max-w-none break-words">
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-red-500">
                        {post.blog_name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md">
                No recent posts available.
              </div>
            )}
          </div>

          
          {/* -------- Categories -------- */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2 flex items-center gap-2">
              Categories
            </h3>

            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/blog?category=${cat._id}`} // ✅ Directly use cat._id
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm cursor-pointer hover:bg-red-100 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md">
                No categories found.
              </div>
            )}
          </div>

        </aside>
      </div>
    </section>
    </>
  );
}
