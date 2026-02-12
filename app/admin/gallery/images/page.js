"use client";

import { useEffect, useState } from "react";
import {  FaTrash,FaEdit } from "react-icons/fa";

export default function GalleryImagesPage() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [editing, setEditing] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active");
  const [file, setFile] = useState(null); 
  const [loading,setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // **Filter states**
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const ImagePerPage = 5;

  /* ================= LOAD DATA ================= */

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery/categories");
      const data = await res.json();

      // Only keep active categories
      const activeCategories = Array.isArray(data)
        ? data.filter(c => c.status === true)
        : [];

      setCategories(activeCategories);

      if (activeCategories.length > 0) {
        setCategory(activeCategories[0]._id);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    const res = await fetch("/api/gallery/images");
    const data = await res.json();

    // console.log("Images loaded:", data); 

    setImages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadCategories();
    loadImages();
  }, []);

  /* ================= MODAL HANDLING ================= */

  const openAddModal = () => {
    setEditing(null);
    setTitle("");
    setStatus("active");
    setFile(null);
    setCategory(categories[0]?._id || "");
    setModalOpen(true);
  };

  const openEditModal = (img) => {
    setEditing(img);
    setTitle(img.title);
    setCategory(img.category?._id);
    setStatus(img.status ? "active" : "inactive");
    setModalOpen(true);
  };

  /* ================= SAVE IMAGE ================= */

  const saveImage = async () => {
    if (!title || !category) {
      alert("Title and category are required");
      return;
    }

    // On add, file is required
    if (!editing && !file) {
      alert("Image file is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("status", status);

    if (file) {
      formData.append("image", file);
    }

    const url = "/api/gallery/images";
    const method = editing ? "PUT" : "POST";

    if (editing) {
      formData.append("id", editing._id);
    }

    const res = await fetch(url, { method, body: formData });
    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Something went wrong");
      return;
    }

    setModalOpen(false);
    loadImages();
  };

  /* ================= DELETE ================= */

  const deleteImage = async () => {
    await fetch(`/api/gallery/images?id=${deleteItem._id}`, {
      method: "DELETE",
    });
    setDeleteModal(false);
    loadImages();
  };

 const filteredImages = images.filter((img) => {
    const matchesTitle = img.title
      .toLowerCase()
      .includes(filterTitle.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || img.category?._id === filterCategory;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && img.status) ||
      (filterStatus === "inactive" && !img.status);

    return matchesTitle && matchesCategory && matchesStatus;
  });

  const indexOfLastImage = currentPage * ImagePerPage;
  const indexOfFirstImage = indexOfLastImage - ImagePerPage;
  const currentImages = filteredImages.slice(
    indexOfFirstImage,
    indexOfLastImage
  );

  const totalPages = Math.ceil(filteredImages.length / ImagePerPage);
  const startEntry = filteredImages.length === 0 ? 0 : indexOfFirstImage + 1;
  const endEntry = Math.min(indexOfLastImage, filteredImages.length);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  /* ================= UI ================= */

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-5 mt-5">Gallery Images</h1>

       {loading && (
            <p className="text-sm text-gray-500 mb-3">
              Loading Gallery Images...
            </p>
          )}

      {!loading && (
        <div className="overflow-x-auto border rounded py-5 px-4 bg-white">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-5">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                 <input
                  type="text"
                  placeholder="Filter by title"
                  value={filterTitle}
                  onChange={(e) => setFilterTitle(e.target.value)}
                  className="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <button
                  onClick={openAddModal}
                  className="bg-red-500 text-white px-4 py-2 rounded text-sm"
                >
                  Add Image
                </button>
              </div>
            </div>

            <hr className="border-t border-gray-200 mb-4" />

            {/* TABLE */}
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Title</th>
                  <th className="p-3 border">Category</th>
                  <th className="p-3 border">Image</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
               <tbody>
                {currentImages.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No images found
                    </td>
                  </tr>
                ) : (
                  currentImages.map((img) => (
                    <tr key={img._id}>
                      <td className="p-3 border text-center">{img.title}</td>
                      <td className="p-3 border text-center">
                        {img.category?.name}
                      </td>
                      <td className="p-3 border flex justify-center">
                        <img
                          src={img.imageUrl}
                          className="w-32 h-18 object-contain rounded"
                        />
                      </td>
                      <td className="p-3 border text-center">
                        {img.status ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => openEditModal(img)}
                          className="px-2 mr-3 py-2 rounded-full bg-red-100 text-red-500 text-s"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem(img);
                            setDeleteModal(true);
                          }}
                          className="px-2 py-2 rounded-full bg-red-100 text-red-500 text-s"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
              <div className="text-sm text-gray-600">
                Showing {startEntry} to {endEntry} of {filteredImages.length} entries
              </div>
              <div className="flex items-center space-x-1 flex-wrap">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 border rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "text-black bg-white hover:bg-gray-100"
                  }`}
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1.5 border rounded-md ${
                      currentPage === i + 1
                        ? "bg-red-500 text-white"
                        : "text-black bg-white hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 border rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "text-black bg-white hover:bg-gray-100"
                  }`}
                >
                  »
                </button>
              </div>
            </div>
            )}

        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-bold text-lg mb-4">
              {editing ? "Edit Image" : "Add Image"}
            </h2>

            <input
              className="border w-full p-2 mb-3"
              placeholder="Image Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              className="border w-full p-2 mb-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!categories || categories.length === 0}
            >
              {categories && categories.length > 0 ? (
                <>
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </>
              ) : (
                <option value="" disabled>
                  No category found
                </option>
              )}
            </select>

            <select
              className="border w-full p-2 mb-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Show existing image preview when editing */}
            {editing && editing.imageUrl && (
              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-1">Current Image</p>
                <img
                  src={editing.imageUrl}
                  alt="Current"
                  className="w-32 h-32 object-contain border rounded"
                />
                <p className="text-xs text-red-400">
                  Choose a new image only if you want to replace the existing one
                </p>
              </div>
            )}

            <input
              type="file"
              className="border w-full p-2 mb-3"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)}>Cancel</button>
              <button
                onClick={saveImage}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-80 text-center">
            <p className="mb-4">
              Are you sure you want to delete <b>{deleteItem?.title}</b> ?
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setDeleteModal(false)}>Cancel</button>
              <button
                onClick={deleteImage}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
