"use client";

import { useEffect, useState, useRef } from "react";
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const schools = [
  {
    value: "Sathya Preparatory School - Muthu Krishnapuram, Tuticorin",
    line1: "Sathya Preparatory School",
    line2: "Muthu Krishnapuram, Tuticorin",
  },
  {
    value: "Sathya CBSE School - Rajapalayam, Melalangaarathattu, Thoothukudi",
    line1: "Sathya CBSE School",
    line2: "Rajapalayam, Melalangaarathattu, Thoothukudi",
  },
];

function SchoolDropdown({ value, onChange, onBlur, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selected = schools.find((s) => s.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onBlur={onBlur}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.line1 : "Select School"}
        </span>
        <span className="ml-2 text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md overflow-hidden">
          {schools.map((s) => (
            <div
              key={s.value}
              onClick={() => {
                onChange({ target: { name: "branch", value: s.value } });
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer ${
                value === s.value ? "bg-red-600 text-white" : ""
              }`}
            >
              <div className="text-md font-medium">{s.line1}</div>
              <div className={`text-sm ${value === s.value ? "text-blue-200" : "text-gray-400"}`}>
                {s.line2}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    stud_class: "",
    date_of_birth: "",
    gender: "",
    parent_guardian: "",
    address: "",
    phone_number: "",
    branch: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [touched, setTouched] = useState({});

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.stud_class.trim()) newErrors.stud_class = "Class is required";
    if (!form.date_of_birth.trim()) newErrors.date_of_birth = "DateOfBirth is required";
    if (!form.parent_guardian.trim()) newErrors.parent_guardian = "Parent/Guardian is required";
    if (!form.gender.trim()) newErrors.gender = "Gender is required";
    if (!form.branch.trim()) newErrors.branch = "Branch is required";
    if (!form.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(form.phone_number)) {
      newErrors.phone_number = "Enter a valid phone number";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Form Data Submitted:", form);
    setLoading(true);
    setResponseMsg("");
    try {
      const res = await fetch("/api/admission/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setResponseMsg("Message sent successfully!");
        setForm({ name: "", stud_class: "", date_of_birth: "", gender: "", parent_guardian: "", phone_number: "", address: "", branch: "" });
        setTimeout(() => {
          setResponseMsg("");
          window.location.href = "/";
        }, 2000);
      } else {
        setResponseMsg(data.message || "Something went wrong");
      }
    } catch (error) {
      setResponseMsg("Server error");
    } finally {
      setLoading(false);
    }
  };

  const [storeGroups, setStoreGroups] = useState([]);

  useEffect(() => {
    async function fetchStores() {
      const res = await fetch("api/admission/get/store/");
      const data = await res.json();
      if (data.success) {
        setStoreGroups(data.data);
      }
    }
    fetchStores();
  }, []);

  const inputClass = "w-full border rounded-md px-3 py-2 focus:outline-none";

  return (
    <>
      <section className="relative bg-cover bg-center py-16">
        <div className="absolute inset-0"></div>
      </section>

      <div className="max-w-4xl mx-auto pt-4 pb-8 mt-2">
        <div className="p-10 py-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-600 py-3 text-center">
              <h2 className="text-3xl font-bold text-white">Registration</h2>
              <p className="text-white text-sm mt-1">Use the form below to register</p>
            </div>
            <div className="px-10 py-2">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* Name */}
                <div>
                  <label className="block font-medium mb-1">
                    Name<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.name && touched.name ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block font-medium mb-1">
                    Class<span className="text-red-600">*</span>
                  </label>
                  <select
                    name="stud_class"
                    value={form.stud_class}
                    onChange={handleChange}
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.stud_class && touched.stud_class ? "border-red-500" : "border-gray-300"
                    }`}
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

                {/* Gender */}
                <div>
                  <label className="block font-medium mb-1">
                    Gender<span className="text-red-600">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.gender && touched.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Date Of Birth */}
                <div>
                  <label className="block font-medium mb-1">
                    Date Of Birth<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date_of_birth && touched.date_of_birth ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                {/* Parent / Guardian Name */}
                <div>
                  <label className="block font-medium mb-1">
                    Parent / Guardian Name<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="parent_guardian"
                    value={form.parent_guardian}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.parent_guardian && touched.parent_guardian ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>

                {/* School - Custom Dropdown */}
                <div>
                  <label className="block font-medium mb-1">
                    School<span className="text-red-600">*</span>
                  </label>
                  <SchoolDropdown
                    value={form.branch}
                    onChange={handleChange}
                    onBlur={() => setTouched({ ...touched, branch: true })}
                    error={errors.branch && touched.branch}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-medium mb-1">
                    Phone Number<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.phone_number && touched.phone_number ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block font-medium mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.address && touched.address ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>

                {/* Submit */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-md"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                  {responseMsg && (
                    <p className="text-green-600 font-medium mt-2">{responseMsg}</p>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
