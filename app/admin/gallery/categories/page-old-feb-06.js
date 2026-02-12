"use client";

import { useState, useEffect } from "react";
import {  FaTrash,FaEdit } from "react-icons/fa";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // delete modal
  const [editingCategory, setEditingCategory] = useState(null); // currently editing category
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active"); // string from select

  // Load categories from API
  const loadCategories = async () => {
    const res = await fetch("/api/gallery/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

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

    if (editingCategory) {
      // Edit
      await fetch(`/api/gallery/categories/${editingCategory._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, status: statusBoolean }),
      });
    } else {
      // Add
      await fetch("/api/gallery/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, status: statusBoolean }),
      });
    }

    setModalOpen(false);
    setName("");
    setStatus("active");
    setEditingCategory(null);
    loadCategories();
  };

  // Open delete confirmation modal
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Delete category
  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    await fetch(`/api/gallery/categories/${categoryToDelete._id}`, {
      method: "DELETE",
    });

    setDeleteModalOpen(false);
    setCategoryToDelete(null);
    loadCategories();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gallery Categories</h1>

      {/* Table */}
      <div className="overflow-x-auto border rounded py-5 px-4 bg-white">

        <button
        onClick={() => openModal()}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Category
      </button>

      
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-center">Category Name</th>
              <th className="px-4 py-2 border text-center">Slug</th>
              <th className="px-4 py-2 border text-center">Status</th>
              <th className="px-4 py-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{c.name}</td>
                <td className="px-4 py-2 border text-center">{c.slug}</td>
                <td className="px-4 py-2 border text-center text-sm">
                  <span className={`px-2 py-1 rounded-xl  ${c.status ? "text-green-600 bg-green-100" : "text-gray-500"}`}>
                    {c.status ? "Active" : "Inactive"}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal (always full) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? "Edit Category" : "Add Category"}</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border px-3 py-2 w-full rounded"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 w-full rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCategory}
                  className="px-4 py-2 rounded bg-blue-500 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-80 text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{categoryToDelete?.name}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={deleteCategory}
                className="px-4 py-2 rounded bg-red-500 text-white"
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
