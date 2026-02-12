"use client";
import { useEffect, useState } from "react";

export default function GalleryManager() {
  const [categories, setCategories] = useState([]);
  const [gallery, setGallery] = useState([]);

  const [form, setForm] = useState({
    image: "",
    category: "",
    showOnHome: false,
  });

  const loadData = async () => {
    const catRes = await fetch("/api/admin/gallery-category");
    const galRes = await fetch("/api/admin/gallery");

    setCategories(await catRes.json());
    setGallery(await galRes.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const addGallery = async () => {
    if (!form.image || !form.category) {
      alert("All fields required");
      return;
    }

    await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ image: "", category: "", showOnHome: false });
    loadData();
  };

  const deleteGallery = async (id) => {
    await fetch(`/api/admin/gallery/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 20 }}>
      <h3>Gallery Manager</h3>

      <input
        placeholder="Image URL"
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
      />

      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={form.showOnHome}
          onChange={(e) =>
            setForm({ ...form, showOnHome: e.target.checked })
          }
        />
        Show on Home
      </label>

      <button onClick={addGallery}>Add Image</button>

      <ul>
        {gallery.map((g) => (
          <li key={g._id}>
            {g.image} — {g.category?.name}
            <button onClick={() => deleteGallery(g._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
