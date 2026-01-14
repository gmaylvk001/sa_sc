"use client";

import { useEffect, useState } from "react";
import { FaPhoneAlt, FaEnvelope ,FaFacebookF,FaInstagram,FaYoutube,FaLinkedinIn,FaTwitter} from "react-icons/fa";

export default function RegistrationForm() {
	const [form, setForm] = useState({
		name: "",
		stud_class: "",
		date_of_birth: "",
		gender: "",
		parent_or_guardian: "",
		address: "",
		mobile_number: "",
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
		if (!form.parent_or_guardian.trim()) newErrors.parent_or_guardian = "Parent/Guardian is required";
		if (!form.gender.trim()) newErrors.gender = "Gender is required";
		if (!form.mobile_number.trim()) {
		  newErrors.mobile_number = "Phone number is required";
		} else if (!/^\d{10,15}$/.test(form.mobile_number)) {
		  newErrors.mobile_number = "Enter a valid phone number";
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

		setLoading(true);
		setResponseMsg("");

		try {
			const res = await fetch("/api/registration/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});

			const data = await res.json();

			if (res.ok) {
				setResponseMsg("Message sent successfully!");
				setForm({ name: "", stud_class: "", date_of_birth: "", gender: "", parent_or_guardian: "", mobile_number: "", address: "" });

				// Clear message after 2 seconds
				setTimeout(() => {
				  setResponseMsg("");
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
	const inputClass = "w-full border rounded-md px-3 py-2 focus:outline-none";

	return (
		<>
			<div className="max-w-4xl mx-auto py-16 mt-2">
				<div className="p-10 py-5">
					<div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
						<div className="bg-red-600 py-3 text-center">
							<h2 className="text-3xl font-bold text-white">Registration</h2>
							<p className="text-white text-sm mt-1">Use the form below to register</p>
						</div>
						<div className="px-10 py-2">
							<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
								{/* Student Name */}
								<div>
									<label className="block font-medium mb-1">
									Student Name<span className="text-red-600">*</span>
									</label>
									<input type="text" name="name" value={form.name} onChange={handleChange} className={`${inputClass} ${errors.name && (touched.name || submitted) ? "border-red-500" : "border-gray-300"}`}/>
								</div>

								{/* Class */}
								<div>
									<label className="block font-medium mb-1">Class<span className="text-red-600">*</span></label>
									<select name="stud_class" value={form.stud_class} onChange={handleChange} className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									errors.stud_class && (touched.stud_class || submitted)
									? "border-red-500"
									: "border-gray-300"
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
									<label className="block font-medium mb-1">Gender<span className="text-red-600">*</span></label>
									<select name="gender" value={form.gender} onChange={handleChange} className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									errors.gender && (touched.gender || submitted)
									? "border-red-500"
									: "border-gray-300"
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
									<div className="relative">
										<input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} max={new Date().toISOString().split("T")[0]} className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date_of_birth && (touched.date_of_birth || submitted)? "border-red-500": "border-gray-300"}`}/>
									</div>
								</div>

								{/* Parent or Guardian Name */}
								<div className="md:col-span-2">
									<label className="block font-medium mb-1">
									Parent / Guardian Name<span className="text-red-600">*</span>
									</label>
									<input type="text" name="parent_or_guardian" value={form.parent_or_guardian} onChange={handleChange} className={`${inputClass} ${errors.parent_or_guardian && (touched.parent_or_guardian || submitted) ? "border-red-500" : "border-gray-300"}`}/>
								</div>

								{/* Phone Number*/}
								<div>
									<label className="block font-medium mb-1">
									Phone Number<span className="text-red-600">*</span>
									</label>
									<input type="text" name="mobile_number" value={form.mobile_number} onChange={handleChange} className={`${inputClass} ${errors.mobile_number && (touched.mobile_number || submitted) ? "border-red-500" : "border-gray-300"}`} />
								</div>

								{/* Address */}
								<div>
									<label className="block font-medium mb-1">
									Address <span className="text-red-600"></span>
									</label>
									<input type="text" name="address" value={form.address} onChange={handleChange} className={`${inputClass} ${errors.address && (touched.address || submitted) ? "border-red-500" : "border-gray-300"}`} />
								</div>
								{/* Submit Button - Full Width */}
								<div className="md:col-span-2">
									<button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-md">
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
