"use client";
import { useEffect, useState } from "react";

export default function GalleryCategory() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    const res = await fetch("/api/admin/gallery-category");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async () => {
    if (!name) {
      alert("Category name required");
      return;
    }

    await fetch("/api/admin/gallery-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setName("");
    loadCategories();
  };

  const deleteCategory = async (id) => {
    await fetch(`/api/admin/gallery-category/${id}`, {
      method: "DELETE",
    });
    loadCategories();
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16 }}>
      <h3>Gallery Categories</h3>

      <input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addCategory}>Add</button>

      <ul>
        {categories.map((cat) => (
          <li key={cat._id}>
            {cat.name}
            <button onClick={() => deleteCategory(cat._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
