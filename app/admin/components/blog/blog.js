import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaEdit } from "react-icons/fa";
import { Icon } from '@iconify/react';
import DateRangePicker from '@/components/DateRangePicker';
import CustomQuill from './CustomQuill';

export default function BlogComponent() {
  // State declarations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogData, setBlogData] = useState({
    name: "",
    image: null,
    description: "",
    status: "Active",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null
  });
  
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBlogData, setEditBlogData] = useState({
    id: "",
    name: "",
    image: null,
    existingImage: "",
    description: "",
    status: "Active",
  });
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Fetch categories and blogs on component mount
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs/get");
      const text = await response.text();
      if (!text) {
        console.error("Empty response from API");
        return;
      }
      const result = JSON.parse(text);
      if (result.success) {
        setBlogs(result.data);
      } else {
        console.error("API Error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
  try {
    const res = await fetch("/api/blogs/categories");
    const data = await res.json();

    const activeCategories = Array.isArray(data)
      ? data.filter(c => c.status === true)
      : [];
    setCategories(activeCategories);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

  // Filter blogs based on search, status, and date
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.blog_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || blog.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter.startDate && dateFilter.endDate && blog.createdAt) {
      const blogDate = new Date(blog.createdAt);
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      matchesDate = blogDate >= startDate && blogDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination variables
  const totalEntries = filteredBlogs.length;
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);
  const totalPages = Math.ceil(totalEntries / itemsPerPage);

  const clearDateFilter = () => {
    setDateFilter({ startDate: null, endDate: null });
    setCurrentPage(1);
  };

  const handleDateChange = ({ startDate, endDate }) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    setBlogData({ ...blogData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogData({ ...blogData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Edit functions
  const handleEdit = (blog) => {
    setEditBlogData({
      id: blog._id,
      name: blog.blog_name,
      description: blog.description,
      status: blog.status,
      existingImage: blog.image || ""
    });
    
    // Set selected categories for edit
    setCategory(blog.category?._id || "");
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    setEditBlogData({ ...editBlogData, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditBlogData({ 
        ...editBlogData, 
        image: file,
        existingImage: "" 
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", editBlogData.id);
    formData.append("name", editBlogData.name);
    formData.append("description", editBlogData.description);
    formData.append("category", category);
    formData.append("status", editBlogData.status);
    if (editBlogData.image) {
      formData.append("image", editBlogData.image);
    }
    formData.append("existingImage", editBlogData.existingImage);

    setSaving(true);
    setSaveProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setSaveProgress(Math.round(progress));
    }, 150);

    try {
      const response = await fetch("/api/blogs/update", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        clearInterval(interval);
        setSaveProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 400));

        setSaving(false);
        setSaveProgress(0);
        setIsEditModalOpen(false);
        setEditBlogData({
          id: "",
          name: "",
          image: null,
          existingImage: "",
          description: "",
          status: "Active"
        });
        fetchBlogs();

        setAlertMessage("Blog updated successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        clearInterval(interval);
        setSaving(false);
        setSaveProgress(0);
        setAlertMessage("Error: " + result.error);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      clearInterval(interval);
      setSaving(false);
      setSaveProgress(0);
      console.error("Error submitting form:", error);
      setAlertMessage("Failed to update blog.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", blogData.name);
    formData.append("description", blogData.description);
    formData.append("category", category);
    formData.append("status", blogData.status);
    if (blogData.image) {
      formData.append("image", blogData.image);
    }

    setSaving(true);
    setSaveProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setSaveProgress(Math.round(progress));
    }, 150);

    // Option 1 — easiest, see all key/value pairs
    console.log('test form', Object.fromEntries(formData));

    try {
      const response = await fetch("/api/blogs/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        clearInterval(interval);
        setSaveProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 400));

        setSaving(false);
        setSaveProgress(0);
        setIsModalOpen(false);
        setBlogData({ name: "", image: null, description: "", status: "Active" });
        setImagePreview(null);
        fetchBlogs();

        setAlertMessage("Blog added successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        clearInterval(interval);
        setSaving(false);
        setSaveProgress(0);
        setAlertMessage("Error: " + result.error);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      clearInterval(interval);
      setSaving(false);
      setSaveProgress(0);
      console.error("Error submitting form:", error);
      setAlertMessage("Failed to add blog.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/blogs/delete?id=${blogToDelete}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setAlertMessage('Blog deleted successfully!');
        fetchBlogs();
      } else {
        setAlertMessage('Error: ' + result.error);
      }

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setShowConfirmationModal(false);
      setBlogToDelete(null);
      setDeleting(false);
    } catch (error) {
      console.error('Error updating blog status:', error);
      setAlertMessage('Failed to delete blog.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setDeleting(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) return null;

    return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </div>

        <ul className="pagination flex items-center space-x-1" role="navigation" aria-label="Pagination">
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
              aria-label="Previous page"
            >
              «
            </button>
          </li>
          
          {pageNumbers.map((number) => (
            <li key={number} className={`page-item ${currentPage === number ? 'bg-red-500 text-white' : ''}`}>
              <button
                onClick={() => paginate(number)}
                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
                aria-label={`Page ${number}`}
              >
                {number}
              </button>
            </li>
          ))}
          
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === pageNumbers.length}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-black hover:bg-gray-100"
              aria-label="Next page"
            >
              »
            </button>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Blog List</h2>
      </div>
      
      {showAlert && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
          alertMessage.includes("Error") || alertMessage.includes("Failed") 
            ? "bg-red-500 text-white" 
            : "bg-green-500 text-white"
        }`}>
          {alertMessage}
        </div>
      )}

      {isLoading ? (
         <p className="text-sm text-gray-500 mb-3">
           Loading Blog Posts...
        </p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 mb-5 overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-5">
            {/* Search Input */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Icon icon="ic:baseline-search" className="w-4 h-4 text-gray-500" />
                </span>
                <input
                  type="text"
                  placeholder="Search Blog..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Date Range Picker */}
            <div className="w-full col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <DateRangePicker onDateChange={handleDateChange} />
                </div>
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <button
                    onClick={clearDateFilter}
                    className="p-2 text-sm text-red-600 hover:text-red-800 bg-red-50 rounded-md"
                    title="Clear date filter"
                  >
                    <Icon icon="mdi:close-circle-outline" className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150"
              >
                + Add Blog
              </button>
            </div>
          </div>
          <hr className="border-t border-gray-200 mb-4" />
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-8">
              <p>No blogs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Image</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((blog) => (
                        <tr key={blog._id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-bold">{blog.blog_name}</td>
                          <td className="p-2" title={stripHtml(blog.description)}>
                            {stripHtml(blog.description).length > 50
                              ? `${stripHtml(blog.description).substring(0, 50)}...`
                              : stripHtml(blog.description)}
                          </td>
                          <td className="p-2">
                            {blog.category ? blog.category.name : "No Category"}
                          </td>
                          <td className="p-2 font-semibold">
                            <span className={blog.status === "Active" ? "text-green-500" : "text-red-500"}>
                              {blog.status}
                            </span>
                          </td>
                          <td className="p-2">
                            {blog.image && (
                              <img 
                                src={blog.image} 
                                alt="Blog" 
                                className="h-8 object-contain" 
                              />
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(blog)}
                                className="w-7 h-7 bg-red-100 text-red-500 rounded-full inline-flex items-center justify-center hover:bg-red-200 transition"
                                title="Edit"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setBlogToDelete(blog._id);
                                  setShowConfirmationModal(true);
                                }}
                                className="w-7 h-7 bg-pink-100 text-red-500 rounded-full inline-flex items-center justify-center hover:bg-pink-200 transition"
                                title="Delete"
                              >
                                <Icon icon="mingcute:delete-2-line" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      )}

      {/* Add Blog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b-2 border-gray-300 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Blog</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 focus:outline-none"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto flex-grow">
              {saving ? (
                <div className="py-10">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    {saveProgress < 100 ? "Saving blog..." : "Saved successfully!"}
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
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="blog_name" className="block mb-1 text-sm font-semibold text-gray-700">
                    Blog Name
                  </label>
                  <input
                    name="name"
                    value={blogData.name}
                    onChange={handleInputChange}
                    id="blog_name"
                    className="w-full rounded-md border p-2 focus:ring-2 focus:ring-red-400"
                    placeholder="Enter Blog Name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Upload Image</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-600
                      file:mr-3 file:py-1 file:px-3
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-red-50 file:text-red-700
                      hover:file:bg-red-100"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 h-16 rounded-md object-contain mx-auto"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block mb-1 text-sm font-semibold text-gray-700">
                    Blog Description
                  </label>
                  <CustomQuill
                    value={blogData.description}
                    onChange={(content) => {
                      setBlogData((prev) => ({ ...prev, description: content }))
                    }}
                  />
                </div>

                 <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <select
                    className="border w-full p-2 rounded-md"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block mb-1 text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={blogData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="inline-block bg-red-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
                >
                  Add Blog
                </button>
              </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b-2 border-gray-300 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Update Blog</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 focus:outline-none"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto flex-grow">
              {saving ? (
                <div className="py-10">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    {saveProgress < 100 ? "Updating blog..." : "Updated successfully!"}
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
              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label htmlFor="edit_blog_name" className="block mb-1 text-sm font-semibold text-gray-700">
                    Blog Name
                  </label>
                  <input
                    name="name"
                    value={editBlogData.name}
                    onChange={handleEditInputChange}
                    id="edit_blog_name"
                    className="w-full rounded-md border p-2 focus:ring-2 focus:ring-red-400"
                    placeholder="Enter Blog Name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Upload Image</label>
                  <input
                    type="file"
                    onChange={handleEditImageChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-600
                      file:mr-3 file:py-1 file:px-3
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-red-50 file:text-red-700
                      hover:file:bg-red-100"
                  />
                  {editBlogData.existingImage && !editBlogData.image && (
                    <img
                      src={editBlogData.existingImage}
                      alt="Current"
                      className="mt-3 h-16 rounded-md object-contain mx-auto"
                    />
                  )}
                  {editBlogData.image && (
                    <img
                      src={URL.createObjectURL(editBlogData.image)}
                      alt="New"
                      className="mt-3 h-16 rounded-md object-contain mx-auto"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="edit_description" className="block mb-1 text-sm font-semibold text-gray-700">
                    Blog Description
                  </label>
                  <CustomQuill
                    value={editBlogData.description}
                    onChange={(content) => setEditBlogData((prev) => ({ ...prev, description: content }))}
                  />
                </div>

                <select
                  className="border w-full p-2 rounded-md"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>


                <div>
                  <label htmlFor="edit_status" className="block mb-1 text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    id="edit_status"
                    value={editBlogData.status}
                    onChange={handleEditInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-red-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="inline-block bg-red-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
                >
                  Update Blog
                </button>
              </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this blog?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`px-4 py-2 rounded-md text-white ${
                  deleting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                }`}
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
