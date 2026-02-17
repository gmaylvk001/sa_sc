"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function BlogCategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [deleting, setDeleting] = useState(false);
  const categoriesPerPage = 10;

  const filteredCategories = categories.filter((c) => {
  const matchesName = c.name.toLowerCase().includes(filterName.toLowerCase());
  const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && c.status) ||
      (filterStatus === "inactive" && !c.status);
    return matchesName && matchesStatus;
  });

const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
const indexOfLast = currentPage * categoriesPerPage;
const indexOfFirst = indexOfLast - categoriesPerPage;
const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);



  const fetchCategories = async () => {
    const res = await fetch("/api/blogs/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setStatus("active");
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setStatus(cat.status ? "active" : "inactive");
    setModalOpen(true);
  };

  const saveCategory = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

      // Prevent duplicate names
    const nameExists = categories.some(
      (cat) =>
        cat.name.toLowerCase() === name.trim().toLowerCase() &&
        cat._id !== (editing?._id || "")
    );

    if (nameExists) {
    setError("Category with this name already exists");
    return;
  }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const body = JSON.stringify({
      name,
      slug,
      status: status === "active",
    });

    const url = editing ? `/api/blogs/categories/${editing._id}` : `/api/blogs/categories`;
    const method = editing ? "PUT" : "POST";

    setSaving(true);
    setSaveProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setSaveProgress(Math.round(progress));
    }, 150);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();
      if (!data.success) {
        clearInterval(interval);
        setSaving(false);
        setSaveProgress(0);
        setError(data.message || "Something went wrong");
        return;
      }

      clearInterval(interval);
      setSaveProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 400));

      const wasEditing = !!editing;
      setModalOpen(false);
      setSaving(false);
      setSaveProgress(0);
      fetchCategories();
      resetForm();

      setToast(wasEditing ? "Category updated successfully!" : "Category added successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      clearInterval(interval);
      setSaving(false);
      setSaveProgress(0);
      console.error("Save failed:", error);
    }
  };

  const confirmDelete = (cat) => {
    setDeleteCategory(cat);
    setDeleteModal(true);
  };

  const deleteCategoryNow = async () => {
    if (!deleteCategory) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/categories/${deleteCategory._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        setDeleting(false);
        alert(data.message || "Failed to delete");
        return;
      }

      setDeleteModal(false);
      setDeleteCategory(null);
      setDeleting(false);
      fetchCategories();

      setToast("Category deleted successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto ">
      <h1 className="text-2xl font-bold mb-5 mt-5">Blog Categories</h1>
       {loading && (
            <p className="text-sm text-gray-500 mb-3">
              Loading categories...
            </p>
          )}

      {!loading && (
      <div className="overflow-x-auto border rounded py-5 px-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={filterName}
            onChange={(e) => {
              setFilterName(e.target.value);
              setCurrentPage(1); // reset to first page
            }}
            placeholder="Filter by name"
            className="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2 flex justify-start md:justify-end">
          <button
            onClick={openAddModal}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm"
          >
            Add Category
          </button>
        </div>
      </div>


      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Slug</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCategories.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No categories found
              </td>
            </tr>
          ) : (
            currentCategories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50">
                <td className="p-3 border text-center">{cat.name}</td>
                <td className="p-3 border text-center">{cat.slug}</td>
                <td className="p-3 border text-center text-sm">
                 <span
                    className={`px-2 py-1 rounded-xl ${
                      cat.status ? "text-green-600 bg-green-100" : "text-gray-500"
                    }`}
                  >
                    {cat.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 border flex gap-2 justify-center">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 bg-red-100 text-red-500 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => confirmDelete(cat)}
                    className="p-2 bg-red-100 text-red-500 rounded"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
      </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredCategories.length)} of{" "}
            {filteredCategories.length} entries
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
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
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 border rounded-md ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "text-black bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
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


      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit" : "Add"} Category</h2>

            {saving ? (
              <div className="py-6">
                <p className="text-sm text-gray-600 text-center mb-3">
                  {saveProgress < 100 ? "Saving category..." : "Saved successfully!"}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-200 ${
                      saveProgress < 100 ? "bg-blue-500" : "bg-green-500"
                    }`}
                    style={{ width: `${saveProgress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm font-semibold mt-2 text-gray-700">
                  {saveProgress}%
                </p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setName(newName);

                    // Live validation
                    if (!newName.trim()) {
                      setError("Category name is required");
                    } else {
                      // Check if name already exists (excluding the category being edited)
                      const nameExists = categories.some(
                        (cat) =>
                          cat.name.toLowerCase() === newName.trim().toLowerCase() &&
                          cat._id !== (editing?._id || "")
                      );

                      if (nameExists) {
                        setError("Category with this name already exists");
                      } else {
                        setError(""); // clear error if valid
                      }
                    }
                  }}
                  className={`border w-full p-2 rounded mb-3 ${error ? "border-red-500" : ""}`}
                />
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border w-full p-2 rounded mb-4"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCategory}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96 text-center">
            <h2 className="text-lg font-semibold mb-3">Delete Category</h2>
            <p className="mb-5">
              Are you sure you want to delete <b>{deleteCategory?.name}</b>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteCategoryNow}
                disabled={deleting}
                className={`px-4 py-2 rounded text-white ${
                  deleting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
