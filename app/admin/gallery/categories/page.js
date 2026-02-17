"use client";

import { useState, useEffect } from "react";
import {  FaTrash,FaEdit } from "react-icons/fa";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // delete modal
  const [editingCategory, setEditingCategory] = useState(null); // currently editing category
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active"); // string from select
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [nameError, setNameError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [deleting, setDeleting] = useState(false);
  const categoriesPerPage = 10;


  // Load categories from API
  const loadCategories = async () => {
  const categoriesRes = await fetch("/api/gallery/categories");
  const imagesRes = await fetch("/api/gallery/images");

  const categoriesData = await categoriesRes.json();
  const imagesData = await imagesRes.json();

  // Map each category to include image count
  const categoriesWithCount = categoriesData.map((cat) => ({
    ...cat,
    imageCount: imagesData.filter((img) => img.category?._id === cat._id).length,
  }));

  setAllCategories(categoriesWithCount); 
  setCategories(categoriesWithCount);
  setLoading(false);
};


  useEffect(() => {
    loadCategories();
  }, []);

   // Filtered + paginated categories
  const filteredCategories = allCategories.filter((c) => {
    const matchesName = c.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && c.status) ||
      (filterStatus === "inactive" && !c.status);
    return matchesName && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const paginate = (pageNumber) => setCurrentPage(pageNumber)



  // Generate slug automatically
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Open modal for add/edit
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setStatus(category.status ? "active" : "inactive");
    } else {
      setEditingCategory(null);
      setName("");
      setStatus("active");
    }
    setModalOpen(true);
  };

  // Save category (add or edit)
  const saveCategory = async () => {
    if (!name.trim()) return alert("Please enter category name");

    const slug = generateSlug(name);
    const statusBoolean = status === "active";

    setSaving(true);
    setSaveProgress(0);

    // Animate progress from 0 to 90 while API call is in progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setSaveProgress(Math.round(progress));
    }, 150);

    try {
      if (editingCategory) {
        await fetch(`/api/gallery/categories/${editingCategory._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, status: statusBoolean }),
        });
      } else {
        await fetch("/api/gallery/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, status: statusBoolean }),
        });
      }

      clearInterval(interval);
      setSaveProgress(100);

      // Brief pause at 100% before closing
      await new Promise((resolve) => setTimeout(resolve, 400));

      const wasEditing = !!editingCategory;
      setModalOpen(false);
      setName("");
      setStatus("active");
      setEditingCategory(null);
      setSaving(false);
      setSaveProgress(0);
      loadCategories();

      // Show toast
      setToast(wasEditing ? "Category updated successfully!" : "Category added successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      clearInterval(interval);
      setSaving(false);
      setSaveProgress(0);
      console.error("Save failed:", error);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Delete category
  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `/api/gallery/categories/${categoryToDelete._id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        // show API error in modal
        setDeleteError(data.error || "Unable to delete category");
        setDeleting(false);
        return;
      }

      // success
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      setDeleteError("");
      setDeleting(false);
      loadCategories();

      // Show toast
      setToast("Category deleted successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  };

  // validation
  const handleSaveWithValidation = () => {
    let valid = true;

    // Reset errors
    setNameError("");
    setStatusError("");

    // Name required
    if (!name.trim()) {
      setNameError("Category name is required");
      valid = false;
    } else {
      // Check for duplicates (excluding the current editing category)
      const nameExists = allCategories.some(
        (cat) =>
          cat.name.toLowerCase() === name.trim().toLowerCase() &&
          cat._id !== (editingCategory?._id || "")
      );

      if (nameExists) {
        setNameError("Category with this name already exists");
        valid = false;
      }
    }

    // Status required
    if (!status) {
      setStatusError("Status is required");
      valid = false;
    }

    if (!valid) return; // stop if invalid

    // Call the save function if everything is valid
    saveCategory();
  };


 
  return (
     <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-5 mt-5">Gallery Categories</h1>
        {loading && (
            <p className="text-sm text-gray-500 mb-3">
              Loading categories...
            </p>
          )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto border rounded py-5 px-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-5">
                <div className="w-full">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Filter by name"
                      value={filterName}
                      onChange={(e) => {
                        setFilterName(e.target.value);
                        setCurrentPage(1); // reset page
                      }}
                      className="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                </div>
              
                 <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1); // reset page
                    }}
                    className="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                 </div>

                <div>
                  <button
                  onClick={() => openModal()}
                  className="bg-red-500 text-white px-4 py-2 rounded text-sm"
                >
                  Add Category
                </button>
                </div>
            </div>

            <hr className="border-t border-gray-200 mb-4" />

            <table className="min-w-full text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border text-center">Category Name</th>
                  <th className="px-4 py-2 border text-center">Slug</th>
                  <th className="px-4 py-2 border text-center">Status</th>
                  <th className="px-4 py-2 border text-center">Images</th>
                  <th className="px-4 py-2 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No image categories found
                    </td>
                  </tr>
                ) : (
                  currentCategories.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">{c.name}</td>
                      <td className="px-4 py-2 border text-center">{c.slug}</td>
                      <td className="px-4 py-2 border text-center text-sm">
                        <span
                          className={`px-2 py-1 rounded-xl ${
                            c.status ? "text-green-600 bg-green-100" : "text-gray-500"
                          }`}
                        >
                          {c.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center text-sm">
                        {c.imageCount ?? 0}
                      </td>
                      <td className="px-4 py-2 border flex gap-2 justify-center">
                        <button
                          onClick={() => openModal(c)}
                          className="px-2 py-2 rounded-full bg-red-100 text-red-500 text-sm"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="px-2 py-1 rounded-full bg-red-100 text-red-500 text-sm"
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
                  Showing {indexOfFirstCategory + 1} to{" "}
                  {Math.min(indexOfLastCategory, filteredCategories.length)} of{" "}
                  {filteredCategories.length} entries
                </div>

                <div className="flex items-center space-x-1">
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

        {/* Modal (always full) */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded w-96">
              <h2 className="text-xl font-bold mb-4">{editingCategory ? "Edit Category" : "Add Category"}</h2>

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
                <div className="space-y-3">
                  {/* Category Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setName(newName);

                        // Live validation
                        if (!newName.trim()) {
                          setNameError("Category name is required");
                        } else {
                          // Check for duplicates excluding current category
                          const nameExists = allCategories.some(
                            (cat) =>
                              cat.name.toLowerCase() === newName.trim().toLowerCase() &&
                              cat._id !== (editingCategory?._id || "")
                          );
                          if (nameExists) {
                            setNameError("Category with this name already exists");
                          } else {
                            setNameError(""); // Clear error if valid
                          }
                        }
                      }}
                      className={`border px-3 py-2 w-full rounded
                        ${nameError ? "border-red-500" : name ? "border-green-500" : ""}`}
                    />
                    {nameError && (
                      <p className="text-red-500 text-sm mt-1">{nameError}</p>
                    )}
                  </div>


                  {/* Status */}
                  <div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`border px-3 py-2 w-full rounded ${
                        statusError ? "border-red-500" : ""
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {statusError && (
                      <p className="text-red-500 text-sm mt-1">{statusError}</p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        setNameError("");
                        setStatusError("");
                      }}
                      className="px-4 py-2 rounded border"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveWithValidation}
                      className="px-4 py-2 rounded bg-blue-500 text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 text-center shadow-lg">

              {!deleteError ? (
                <>
                  <h2 className="text-lg font-semibold mb-3 text-gray-800">
                    Delete Category
                  </h2>

                  <p className="text-sm text-gray-600 mb-5">
                    Are you sure you want to delete the category{" "}
                    <span className="font-semibold text-gray-800">
                      {categoryToDelete?.name}
                    </span>
                    ?
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={deleteCategory}
                      disabled={deleting}
                      className={`px-4 py-2 rounded text-white ${
                        deleting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-3 text-red-600">
                    Cannot Delete Category
                  </h2>

                  <p className="text-sm text-gray-600 mb-4">
                    This category contains images and cannot be deleted.
                  </p>

                  <p className="text-sm text-gray-600 mb-6">
                    You can <span className="font-semibold">set the category to Inactive</span> instead of deleting it.
                  </p>

                  <button
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setDeleteError("");
                    }}
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    OK
                  </button>
                </>
              )}

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
