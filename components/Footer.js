
"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { IoReload, IoStorefront, IoCardOutline, IoShieldCheckmark } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import Image from "next/image";
import { MdAccountCircle } from "react-icons/md";
import { FaInstagram, FaYoutube,FaFacebook } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({ main: [], subs: {} });
    const [stores, setStores] = useState([]);
  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  const getCached = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.__ts) return null;
      if (Date.now() - parsed.__ts > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch (e) {
      return null;
    }
  };

  const setCached = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({ __ts: Date.now(), data }));
    } catch (e) {
      // ignore
    }
  };

  const makeGrouped = (data) => {
    const activeCategories = Array.isArray(data) ? data.filter(cat => cat.status === 'Active') : [];
    const main = activeCategories.filter(cat => cat.parentid === 'none');
    const subs = {};
    activeCategories.forEach(cat => {
      if (cat.parentid !== 'none') {
        if (!subs[cat.parentid]) subs[cat.parentid] = [];
        subs[cat.parentid].push(cat);
      }
    });
    return { main, subs };
  };

  const fetchCategories = async () => {
    const key = 'cache_footer_categories_v1';
    const cached = getCached(key);
    if (cached) {
      setGroupedCategories(makeGrouped(cached));
      return;
    }

    try {
      const res = await fetch('/api/categories/get');
      const data = await res.json();
      if (data) {
        setGroupedCategories(makeGrouped(data));
        setCached(key, data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchStores = async () => {
    const key = 'cache_footer_stores_v1';
    const cached = getCached(key);
    if (cached) {
      setStores(cached);
      return;
    }

    try {
      const res = await fetch('/api/store/get');
      const data = await res.json();
      if (data && data.success) {
        setStores(data.data);
        setCached(key, data.data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  fetchCategories();
  fetchStores();
}, []);


  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData(data.user);
      } else {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setLoadingAuth(true);

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      setUserData(data.user);
      setShowAuthModal(false);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
  };
  /* const groupedStores = stores.reduce((acc, store) => {
  const city = store.city; // or store.store_city based on your API
  if (!acc[city]) {
    acc[city] = [];
  }
  acc[city].push(store.organisation_name);
  return acc;
}, {}); */

const groupedStores = stores.reduce((acc, store) => {
  // ✅ status Active check
  if (store.status !== "Active") return acc;

  const city = store.city; // or store.store_city

  if (!acc[city]) {
    acc[city] = [];
  }

  acc[city].push(store.organisation_name);
  return acc;
}, {});


const capitalizeFirstLetter = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);
  // Case-insensitive membership helper
  const inSetCI = (name, arr) => arr.includes(String(name || '').toLowerCase());

  const groupCategories = (categories) => {
    const grouped = { main: [], subs: {} };
    
    const mainCats = categories.filter(cat => cat.parentid === "none");
    
    mainCats.forEach(mainCat => {
      const subs = categories.filter(cat => cat.parentid === mainCat._id.toString());
      grouped.main.push(mainCat);
      grouped.subs[mainCat._id] = subs;
    });
    
    return grouped;
  };

  // Prepare normalized sections for rendering:
  // - For Large Appliances: one block per ["Dishwasher","Air Conditioner","Washing Machine","Refrigerator"]
  //   with order: title -> all subcategories -> single Brands list.
  // - For others: keep existing brand logic (subcategories + nested + one Brands list).
  const prepareFooterSections = (grouped) => {
    const sections = [];
    if (!grouped || !Array.isArray(grouped.main)) return sections;

    // Use lowercase for consistent matching
    const LARGE_SET = new Set([
      "dishwasher",
      "air conditioner",
      "washing machine",
      "refrigerator",
    ]);

    grouped.main.forEach((mainCat) => {
      const subs = grouped.subs[mainCat._id] || [];
      if (mainCat.category_name?.toLowerCase() === "large appliances") {
        subs.forEach((subcat) => {
          const subName = subcat.category_name?.toLowerCase();
          if (LARGE_SET.has(subName)) {
            const children = grouped.subs[subcat._id] || [];
            const brands =
              (Array.isArray(subcat.brands) && subcat.brands.length
                ? subcat.brands
                : mainCat.brands) || [];
            sections.push({
              type: "la",
              key: `la-${subcat._id}`,
              main: mainCat,
              la: subcat,
              children,
              brands,
            });
          }
        });
      } else {
        sections.push({
          type: "default",
          key: `def-${mainCat._id}`,
          main: mainCat,
          subs,
          brands: mainCat.brands || [],
        });
      }
    });

    return sections;
  };

  const preparedSections = useMemo(
    () => prepareFooterSections(groupedCategories),
    [groupedCategories]
  );

  return (
    <>
     <footer className="bg-slate-700 border-t">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 border-b ">

        {/* School Info */}
        <div>
         <img
                  src="/user/sathya-school-logo.png"
                  alt="Logo"
                  style={{ imageRendering: 'auto' }}  // Optional, keeps smooth rendering
                  className="object-contain mb-3"
                />
          <p className="text-sm text-white">
            CBSE Pattern School focused on quality education and holistic
            development from Pre KG to 5th Standard.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-white">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-white">
            <li><a href="#about" className="text-white hover:text-red-800">About Us</a></li>
            <li><a href="#grade" className="text-white hover:text-red-800">Grade</a></li>
            <li><a href="#why" className="text-white hover:text-red-800">Why Choose Us</a></li>
            <li><a href="#ACTIVITIES" className="text-white hover:text-red-800">Activities</a></li>
          </ul>
        </div>

        {/* Activities */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-white">
            Activities
          </h4>
          <ul className="space-y-2 text-sm text-white">
            <li>Karate</li>
            <li>Silambam</li>
            <li>Dance & Music</li>
            <li>Art & Craft</li>
            <li>Cookery</li>
          </ul>
        </div> 

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="text-md font-semibold mb-3 text-white">
            Contact Us
          </h4>

          {/* Address */}
          <p className="text-sm text-white flex items-start gap-2">
            <FaMapMarkerAlt className="mt-1 text-white" />
            Rajapalayam,<br />
            Melalangaarathattu,<br />
            Thoothukudi
          </p>

          {/* Phone */}
          <p className="text-sm text-white flex items-center gap-2">
            <FaPhoneAlt className="text-white" />
            <a href="tel:+919597701985" className="hover:text-red-500 transition">
              95977 01985
            </a>
          </p>

          {/* Email */}
          <p className="text-sm text-white flex items-center gap-2">
            <FaEnvelope className="text-white" />
            <a
              href="mailto:info@sathya.school"
              className="hover:text-red-500 transition"
            >
              info@sathya.school
            </a>
          </p>
          <div className="py-3 flex items-center gap-3">
            <p className="font-medium text-white">Follow Us :</p>

            <Link
              href="https://www.instagram.com/sathyaschooltuty?igsh=MXhibWQ2eGh5cTdhMw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full shadow flex items-center justify-center"
            >
              <FaInstagram size={22} className="text-red-500" />
            </Link>

            <Link
              href="https://www.youtube.com/@sathyaschooltuty"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full shadow flex items-center justify-center"
            >
              <FaYoutube size={22} className="text-red-500" />
            </Link>
            <Link
              href="https://www.facebook.com/sathyaschooltuty/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full shadow flex items-center justify-center"
            >
              <FaFacebook size={22} className="text-red-500" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-700 text-center text-sm text-white py-4">
        © {new Date().getFullYear()} Sathya School. All rights reserved.
      </div>
    </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 max-w-full relative">
            <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setFormError('');
                  setError('');
                }}
              className="absolute top-4 right-4 text-white hover:text-gray-700 text-2xl">
              &times;
            </button>
            <div className="flex gap-4 mb-6 border-b">
              <button
                className={`pb-2 px-1 ${
                  activeTab === 'login' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button
                className={`pb-2 px-1 ${
                  activeTab === 'register'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {activeTab === 'register' && (
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              
              {(formError || error) && (
                <div className="text-red-500 text-sm">
                  {formError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingAuth}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-200"
              >
                {loadingAuth ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default Footer;
