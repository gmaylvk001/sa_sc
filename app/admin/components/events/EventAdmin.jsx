// components/admin/EventAdmin.jsx
"use client";
import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function EventAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    title: "",
    date: "",
    status: true,
  });

  const formatForInput = (date) => {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().split("T")[0];
  };

  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch("/api/events/get");
    const data = await res.json();
    if (data.success) setEvents(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (item = null) => {
    if (item) {
      setEditingEvent(item);
      setForm({
        title: item.title || "",
        date: item.date ? formatForInput(item.date) : "",
        status: item.status ?? true,
      });
    } else {
      setEditingEvent(null);
      setForm({ title: "", date: "", status: true });
    }
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const payload = {
      title: form.title,
      date: new Date(form.date).toISOString(),
      status: form.status,
    };
    const url = editingEvent
      ? `/api/events/update/${editingEvent._id}`
      : `/api/events/create`;
    const method = editingEvent ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) { alert(data.message); return; }
    setModalOpen(false);
    fetchEvents();
    setToast(editingEvent ? "Updated successfully!" : "Event added!");
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    await fetch(`/api/events/delete/${eventToDelete._id}`, { method: "DELETE" });
    setDeleteModalOpen(false);
    setEventToDelete(null);
    fetchEvents();
    setToast("Deleted successfully!");
    setTimeout(() => setToast(""), 3000);
  };

  const getDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today ? (
      <span className="text-xs text-gray-400 ml-1">(past)</span>
    ) : null;
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-5 mt-5">Event Calendar</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search events..."
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
              Add Event
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border rounded p-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <p>{search ? "No results found" : "No events found"}</p>
              </div>
            ) : (
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-center">Title</th>
                    <th className="p-2 text-center">Date</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-center">Created</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((item) => (
                    <tr key={item._id} className="border-b text-center">
                      <td className="p-2 font-medium">{item.title}</td>
                      <td className="p-2">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Kolkata",
                        })}
                        {getDateLabel(item.date)}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(item.createdAt).toISOString().split("T")[0]}
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="bg-red-100 text-red-500 p-2 rounded-full"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => { setEventToDelete(item); setDeleteModalOpen(true); }}
                            className="bg-red-100 text-red-500 p-2 rounded-full"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingEvent ? "Edit Event" : "Add Event"}
            </h2>

            <label className="block text-sm font-medium mb-1">Event Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`border px-3 py-2 w-full mb-1 rounded ${errors.title ? "border-red-500" : ""}`}
              placeholder="e.g. Bagless Day"
            />
            {errors.title && <p className="text-red-500 text-xs mb-2">{errors.title}</p>}

            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={`border px-3 py-2 w-full mb-1 rounded ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && <p className="text-red-500 text-xs mb-2">{errors.date}</p>}

            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value === "true" })}
              className="border px-3 py-2 w-full mb-4 rounded"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-red-500 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96 text-center">
            <h2 className="text-lg font-semibold mb-2">Delete Event</h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">{eventToDelete?.title}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
