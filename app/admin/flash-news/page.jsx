"use client";

import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function FlashNewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingNews, setEditingNews] = useState(null);
  const [newsToDelete, setNewsToDelete] = useState(null);

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    content: "",
    publishDate: "",
    expiryDate: "",
    priority: 0,
    status: "Active",
  });

  const [toast, setToast] = useState("");

  const formatForInput = (date) => {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const fetchNews = async () => {
    setLoading(true);
    const res = await fetch("/api/flash-news/get");
    const data = await res.json();
    if (data.success) setNews(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filtered news based on search
  const filteredNews = news.filter((item) =>
    item.content?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (item = null) => {
    if (item) {
      setEditingNews(item);
      setForm({
        content: item.content || "",
        publishDate: item.publishDate ? formatForInput(item.publishDate) : "",
        expiryDate: item.expiryDate ? formatForInput(item.expiryDate) : "",
        priority: item.priority || 0,
        status: item.status || "Active",
      });
    } else {
      setEditingNews(null);
      setForm({
        content: "",
        publishDate: "",
        expiryDate: "",
        priority: 0,
        status: "Active",
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      content: form.content,
      publishDate: new Date(form.publishDate).toISOString(),
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      priority: Number(form.priority),
      status: form.status,
    };

    const url = editingNews
      ? `/api/flash-news/update/${editingNews._id}`
      : `/api/flash-news/create`;

    const method = editingNews ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    setModalOpen(false);
    setForm({
      content: "",
      publishDate: "",
      expiryDate: "",
      priority: 0,
      status: "Active",
    });

    fetchNews();
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!form.publishDate) {
      newErrors.publishDate = "Publish date is required";
    }

    if (form.expiryDate && form.expiryDate < form.publishDate) {
      newErrors.expiryDate = "Expiry must be after publish date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;

    await fetch(`/api/flash-news/delete/${newsToDelete._id}`, {
      method: "DELETE",
    });

    setDeleteModalOpen(false);
    setNewsToDelete(null);
    fetchNews();

    setToast("Deleted successfully!");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="container mx-auto">

      {/* Title — always visible */}
      <h1 className="text-2xl font-bold mb-5 mt-5">Flash News</h1>

      {/* Loading — shown below title */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
        <div className="bg-white shadow-md rounded-lg p-5">
            {/* Top bar: Add Button + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

              {/* Search Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search flash news..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border px-3 py-2 rounded w-72 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>


              <button
                onClick={() => openModal()}
                className="bg-red-500 text-white px-4 py-2 rounded w-fit"
              >
                Add Flash News
              </button>
            </div>

            {/* Table */}
            <div className="bg-white border rounded p-4">
              {loading ? (
                <p>Loading...</p>
              ) : filteredNews.length === 0 ? (
                <div className="text-center py-8">
                  <p>{search ? "No results found" : "No news found"}</p>
                </div>
              ) : (
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-center">Content</th>
                      <th className="p-2 text-center">Publish</th>
                      <th className="p-2 text-center">Expiry</th>
                      <th className="p-2 text-center">Priority</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Created</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNews.map((item) => (
                      <tr key={item._id} className="border-b text-center">
                        <td className="p-2">{item.content}</td>

                        <td className="p-2">
                          {item.publishDate
                            ? new Date(item.publishDate).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                              })
                            : "-"}
                        </td>

                        <td className="p-2">
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                              })
                            : "-"}
                        </td>

                        <td className="p-2">{item.priority}</td>

                        <td className="p-2">{item.status}</td>

                        <td className="p-2">
                          {new Date(item.createdAt).toISOString().split("T")[0]}
                        </td>

                        <td className="p-2 flex justify-center gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="bg-red-100 text-red-500 p-2 rounded-full"
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => {
                              setNewsToDelete(item);
                              setDeleteModalOpen(true);
                            }}
                            className="bg-red-100 text-red-500 p-2 rounded-full"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
        </div>
      </>)}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingNews ? "Edit News" : "Add News"}
            </h2>

            <label className="block text-sm font-medium mb-1">
              Flash News Content
            </label>
            <input
              type="text"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`border px-3 py-2 w-full mb-1 ${
                errors.content ? "border-red-500" : ""
              }`}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mb-2">{errors.content}</p>
            )}

            <label className="block text-sm font-medium mb-1">
              Publish Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.publishDate}
              onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
              className={`border px-3 py-2 w-full mb-1 ${
                errors.publishDate ? "border-red-500" : ""
              }`}
            />
            {errors.publishDate && (
              <p className="text-red-500 text-xs mb-2">{errors.publishDate}</p>
            )}

            <label className="block text-sm font-medium mb-1">
              Expiry Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className={`border px-3 py-2 w-full mb-1 ${
                errors.expiryDate ? "border-red-500" : ""
              }`}
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-xs mb-2">{errors.expiryDate}</p>
            )}

            <label className="block text-sm font-medium mb-1">
              Priority (Order)
            </label>
            <input
              type="number"
              placeholder="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="border px-3 py-2 w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border px-3 py-2 w-full mb-4"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 text-center">
            <h2 className="text-lg font-semibold mb-3">Delete News</h2>
            <p className="mb-4">Are you sure?</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}
    </div>
  );
}
