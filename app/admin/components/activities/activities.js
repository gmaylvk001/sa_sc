"use client";
import { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { Icon } from "@iconify/react";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// ─── Config ───────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5;
const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── Helper ───────────────────────────────────────────────────────────────────
function validateImageFile(file, label = "Image") {
  if (!file) return null;
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${label} must be JPEG, PNG, WEBP, or GIF.`;
  }
  if (file.size > MAX_BYTES) {
    return `${label} "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — max allowed is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}

const emptyForm = {
  _id: null,
  name: "",
  tagline: "",
  description: "",
  highlights: [""],
  status: "Active",
  order: 0,
  imageSrc: null,
  existingImageSrc: "",
  gallery: [],
  existingGallery: [],
};

export default function ActivitiesAdminComponent() {
  const [activities, setActivities]           = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [searchQuery, setSearchQuery]         = useState("");
  const [currentPage, setCurrentPage]         = useState(0);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [form, setForm]                       = useState(emptyForm);
  const [bannerPreview, setBannerPreview]     = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [saving, setSaving]                   = useState(false);
  const [saveProgress, setSaveProgress]       = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId]               = useState(null);
  const [deleting, setDeleting]               = useState(false);

  // ---------- fetch ----------
  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activities/getall");
      const data = await res.json();
      setActivities(data.data || []);
    } catch {
      toast.error("Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  // ---------- filter + paginate ----------
  const filtered = activities.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  // ---------- open modal ----------
  const openAdd = () => {
    setForm(emptyForm);
    setBannerPreview("");
    setGalleryPreviews([]);
    setIsModalOpen(true);
  };

  const openEdit = (activity) => {
    setForm({
      _id: activity._id,
      name: activity.name,
      tagline: activity.tagline || "",
      description: activity.description,
      highlights: activity.highlights?.length ? activity.highlights : [""],
      status: activity.status,
      order: activity.order || 0,
      imageSrc: null,
      existingImageSrc: activity.imageSrc || "",
      gallery: [],
      existingGallery: activity.gallery || [],
    });
    setBannerPreview(activity.imageSrc || "");
    setGalleryPreviews(activity.gallery || []);
    setIsModalOpen(true);
  };

  // ---------- highlights ----------
  const addHighlight = () => setForm((f) => ({ ...f, highlights: [...f.highlights, ""] }));
  const removeHighlight = (i) =>
    setForm((f) => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));
  const updateHighlight = (i, val) =>
    setForm((f) => {
      const h = [...f.highlights];
      h[i] = val;
      return { ...f, highlights: h };
    });

  // ---------- banner image ----------
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file, "Banner image");
        if (error) {
          toast.error(error);
          e.target.value = ""; // clear input
          return;
        }
    
    setForm((f) => ({ ...f, imageSrc: file }));
    setBannerPreview(URL.createObjectURL(file));
  };

  // ---------- gallery images ----------
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (let i = 0; i < files.length; i++) {
      const error = validateImageFile(files[i], `Gallery image ${i + 1}`);
      if (error) {
        toast.error(error);
        e.target.value = ""; // clear entire input on any invalid file
        return;
      }
      validFiles.push(files[i]);
    }
    setForm((f) => ({ ...f, gallery: [...f.gallery, ...files] }));
    setGalleryPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeExistingGallery = (idx) => {
    setForm((f) => ({
      ...f,
      existingGallery: f.existingGallery.filter((_, i) => i !== idx),
    }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewGallery = (idx) => {
    const existingCount = form.existingGallery.length;
    const newIdx = idx - existingCount;
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== newIdx) }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setSaveProgress(Math.round(progress));
    }, 150);

    try {
      const fd = new FormData();
      if (form._id) fd.append("activityId", form._id);
      fd.append("name", form.name);
      fd.append("tagline", form.tagline);
      fd.append("description", form.description);
      fd.append("highlights", JSON.stringify(form.highlights.filter((h) => h.trim())));
      fd.append("status", form.status);
      fd.append("order", form.order);

      if (form.imageSrc) fd.append("imageSrc", form.imageSrc);
      if (form._id)      fd.append("existingImageSrc", form.existingImageSrc);

      fd.append("existingGallery", JSON.stringify(form.existingGallery));
      for (const file of form.gallery) fd.append("gallery", file);

      const url = form._id ? "/api/activities/update" : "/api/activities/add";
      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        clearInterval(interval);
        setSaveProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 400));
        toast.success(data.message);
        setIsModalOpen(false);
        setSaving(false);
        setSaveProgress(0);
        fetchActivities();
      } else {
        clearInterval(interval);
        setSaving(false);
        setSaveProgress(0);
        toast.error(data.message || "Something went wrong");
      }
    } catch {
      clearInterval(interval);
      setSaving(false);
      setSaveProgress(0);
      toast.error("Failed to save activity");
    }
  };

  // ---------- delete ----------
  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/activities/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: deleteId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Activity deleted successfully");
        setShowDeleteModal(false);
        fetchActivities();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <ToastContainer />

      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Activities</h2>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          {/* Search + Add */}
          <div className="flex justify-between mb-5 gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
              className="border px-3 py-2 rounded-md w-64"
            />
            <button onClick={openAdd} className="bg-red-500 text-white px-4 py-2 rounded-md">
              + Add Activity
            </button>
          </div>

          {/* Table */}
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Name</th>
                {/* <th className="p-3 text-left">Slug</th> */}
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((a) => (
                  <tr key={a._id} className="border-t">
                    <td className="p-3">
                      {a.imageSrc ? (
                        <img src={a.imageSrc} alt={a.name} className="w-32  object-contain rounded" />
                      ) : (
                        <div className="w-14 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No img</div>
                      )}
                    </td>
                    <td className="p-3 font-medium">{a.name}</td>
                    {/* <td className="p-3 text-gray-500">{a.slug}</td> */}
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3">{a.order}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(a)} className="w-7 h-7 bg-red-100 text-red-500 rounded-full inline-flex items-center justify-center hover:bg-red-200 transition">
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(a._id)} className="w-7 h-7 bg-pink-100 text-red-500 rounded-full inline-flex items-center justify-center hover:bg-pink-200 transition font-bold">
                          <Icon icon="mingcute:delete-2-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-400">No activities found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-end mt-4">
              <ReactPaginate
                previousLabel={"«"}
                nextLabel={"»"}
                breakLabel={"..."}
                pageCount={pageCount}
                onPageChange={({ selected }) => setCurrentPage(selected)}
                forcePage={currentPage}
                containerClassName={"flex items-center space-x-1"}
                pageClassName="border border-gray-300 px-3 py-1.5 rounded-md text-sm"
                activeClassName="bg-red-500 text-white"
                previousLinkClassName="border border-gray-300 px-3 py-1.5 rounded-md"
                nextLinkClassName="border border-gray-300 px-3 py-1.5 rounded-md"
              />
            </div>
          )}
        </div>
      )}

      {/* ===== ADD / EDIT MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-10 px-4">
          <div className="bg-white rounded-xl w-full max-w-2xl relative shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>

            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{form._id ? "Edit Activity" : "Add Activity"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* ---- Progress loader ---- */}
              {saving && (
                <div className="py-10">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    {saveProgress < 100
                      ? (form._id ? "Updating activity..." : "Saving activity...")
                      : "Saved successfully!"}
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
              )}

              {/* ---- Form fields (hidden while saving) ---- */}
              {!saving && (
              <>
              {/* Name + Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Name *</label>
                  <input
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                    placeholder="e.g. Karate"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Tagline</label>
                  <input
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                    placeholder="e.g. Discipline & Focus"
                    value={form.tagline}
                    onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Description *</label>
                <textarea
                  className="border rounded-lg px-3 py-2 w-full text-sm"
                  rows={4}
                  placeholder="Write a detailed description..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              {/* Highlights */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Key Highlights</label>
                <div className="space-y-2">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        className="border rounded-lg px-3 py-2 w-full text-sm"
                        placeholder={`Highlight ${i + 1}`}
                        value={h}
                        onChange={(e) => updateHighlight(i, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(i)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                        disabled={form.highlights.length === 1}
                      >
                        <FaMinus />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="mt-2 text-sm text-red-600 hover:underline flex items-center gap-1"
                >
                  <FaPlus size={10} /> Add Highlight
                </button>
              </div>

              {/* Banner Image */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Banner Image</label>
                <input type="file" accept="image/*" onChange={handleBannerChange} className="text-sm" />
                {bannerPreview && (
                  <img src={bannerPreview} alt="banner" className="mt-2 object-contain rounded-lg w-full max-h-48" />
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Gallery Images</label>
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="text-sm" />
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {galleryPreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt={`gallery-${i}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() =>
                            i < form.existingGallery.length
                              ? removeExistingGallery(i)
                              : removeNewGallery(i)
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status + Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
                  <select
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Display Order</label>
                  <input
                    type="number"
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                    min={0}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
              >
                {form._id ? "Update Activity" : "Add Activity"}
              </button>
              </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 relative">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <FaTimes size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-2">Delete Activity?</h2>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
