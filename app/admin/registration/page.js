"use client";
import React, { useEffect, useState } from "react";
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';

const DateRangePicker = dynamic(() => import('@/components/DateRangePicker'), {
  ssr: false,
  loading: () => <input disabled placeholder="Loading..." className="w-full p-2 border border-gray-300 rounded-md" />
});

export default function ContactComponent() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null
  });

  const contactsPerPage = 20;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admission/get");
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error("Error fetching datas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admission/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        setContacts(contacts.map((contact) =>
          contact._id === id ? { ...contact, status: "inactive" } : contact
        ));
        showAlert("Your Registration Details status updated to Inactive", "success");
      } else {
        showAlert(result.message || "Failed to update contact status", "error");
      }
    } catch (error) {
      console.error("Error updating registration status:", error);
      showAlert("Error updating registration status", "error");
    } finally {
      setShowConfirmationModal(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await fetch(`/api/admission/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactToEdit),
      });
      const result = await response.json();
      if (result.success) {
        setContacts(contacts.map((contact) =>
          contact._id === id ? contactToEdit : contact
        ));
        showAlert("registration successfully", "success");
      } else {
        showAlert(result.message || "Failed to update contact", "error");
      }
    } catch (error) {
      console.error("Error updating registration:", error);
      showAlert("Error updating contact", "error");
    } finally {
      setShowEditModal(false);
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 3000);
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      (contact.name && contact.name.toLowerCase().includes(searchLower)) ||
      (contact.mobile_number && contact.mobile_number.toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === "All" || contact.status === statusFilter;

    let matchesDate = true;
    if (dateFilter.startDate && dateFilter.endDate && contact.createdAt) {
      const contactDate = new Date(contact.createdAt);
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = contactDate >= startDate && contactDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = sortedContacts.slice(indexOfFirstContact, indexOfLastContact);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(sortedContacts.length / contactsPerPage);
  const startEntry = indexOfFirstContact + 1;
  const endEntry = Math.min(indexOfLastContact, sortedContacts.length);

  const handleDateChange = ({ startDate, endDate }) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDateFilter({ startDate: null, endDate: null });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-5 mt-5">
        <h2 className="text-2xl font-bold">Admission Registered Details</h2>
      </div>

      {alertMessage && (
        <div className={`mb-4 p-3 rounded-md ${alertType === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
          {alertMessage}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading contacts...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-5 mb-5 overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search Your Registered Name..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Date Range Picker */}
            <div className="w-full col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <DateRangePicker onDateChange={handleDateChange} />
                </div>
              </div>
            </div>

          </div>
          <hr className="border-t border-gray-200 mb-4" />

          {filteredContacts.length === 0 ? (
            <p className="text-center text-gray-500">No contacts found</p>
          ) : (
            <>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="p-2">Name</th>
                    <th className="p-2">Class</th>
                    <th className="p-2">School</th>
                    <th className="p-2">Parent/Guardian</th>
                    <th className="p-2">Mobile Number</th>
                    <th className="p-2">Address</th>
                    <th className="p-2">Date Of Birth</th>
                    <th className="p-2">Registered Date</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.map((contact) => (
                    <tr key={contact._id} className="text-center border-b">
                      <td className="p-2">{contact.name || '-'}</td>
                      <td className="p-2">{contact.stud_class || '-'}</td>
                      <td className="p-2">{contact.branch || '-'}</td>
                      <td className="p-2">{contact.parent_guardian || '-'}</td>
                      <td className="p-2">{contact.phone_number || '-'}</td>
                      <td className="p-2">{contact.address || '-'}</td>
                      <td className="p-2">
                        {contact.date_of_birth
                          ? new Date(contact.date_of_birth).toISOString().split("T")[0]
                          : '-'}
                      </td>
                      <td className="p-2">
                        {contact.createdAt
                          ? new Date(contact.createdAt).toISOString().split("T")[0]
                          : '-'}
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contact.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {contact.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
                <div className="text-sm text-gray-600">
                  Showing {startEntry} to {endEntry} of {sortedContacts.length} entries
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
                  >«</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1.5 border rounded-md ${
                        currentPage === i + 1
                          ? "bg-red-500 text-white"
                          : "text-black bg-white hover:bg-gray-100"
                      }`}
                    >{i + 1}</button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 border rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-black bg-white hover:bg-gray-100"
                    }`}
                  >»</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Contact</h2>
            <p className="mb-4">Are you sure you want to delete this contact?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowConfirmationModal(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              <button onClick={() => handleDelete(contactToDelete)} className="bg-red-500 px-4 py-2 rounded-md text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {contactToEdit?._id ? "Edit Contact" : "Add Contact"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); if (contactToEdit?._id) handleEdit(contactToEdit._id); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Class</label>
                <select
                  name="class"
                  value={contactToEdit?.class || ""}
                  onChange={(e) => setContactToEdit({ ...contactToEdit, class: e.target.value })}
                  className="border px-3 py-2 rounded-md w-full"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="PreKG">PreKG</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  <option value="1st Std">1st Std</option>
                  <option value="2nd Std">2nd Std</option>
                  <option value="3rd Std">3rd Std</option>
                  <option value="4th Std">4th Std</option>
                  <option value="5th Std">5th Std</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input type="text" value={contactToEdit?.name || ""} onChange={(e) => setContactToEdit({ ...contactToEdit, name: e.target.value })} className="border px-3 py-2 rounded-md w-full" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <input type="text" value={contactToEdit?.mobile_number || ""} onChange={(e) => setContactToEdit({ ...contactToEdit, mobile_number: e.target.value })} className="border px-3 py-2 rounded-md w-full" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Date Of Birth</label>
                <input type="date" value={contactToEdit?.date_of_birth || ""} onChange={(e) => setContactToEdit({ ...contactToEdit, date_of_birth: e.target.value })} className="border px-3 py-2 rounded-md w-full" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Parent Or Guardian</label>
                <input type="text" value={contactToEdit?.parent_or_guardian || ""} onChange={(e) => setContactToEdit({ ...contactToEdit, parent_or_guardian: e.target.value })} className="border px-3 py-2 rounded-md w-full" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select value={contactToEdit?.status || "active"} onChange={(e) => setContactToEdit({ ...contactToEdit, status: e.target.value })} className="border px-3 py-2 rounded-md w-full">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                <button type="submit" className="bg-red-500 px-4 py-2 rounded-md text-white">{contactToEdit?._id ? "Save" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
