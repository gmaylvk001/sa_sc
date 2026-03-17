"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import "../styles/slick-custom.css";
import { motion, useAnimation, useInView } from "framer-motion";
//import { ShoppingCartSimple, CaretDown } from "@phosphor-icons/react";
import { X } from "lucide-react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiArrowRight } from "react-icons/hi";
import { FiChevronLeft, FiChevronRight, FiShoppingCart } from "react-icons/fi";
import {FaPhoneAlt,FaShieldAlt,FaHeadset,FaUsers,FaChild,FaFistRaised,FaLaptop,FaSnowflake,FaAward,FaRunning,FaMusic,FaPaintBrush,FaGuitar,FaDrum,FaUtensils,FaSchool, FaUserCheck,FaCheckCircle,FaHandshake,FaStar,FaHeart, 
  FaUserGraduate,FaMapMarkerAlt,FaEnvelope,FaArrowLeft, FaArrowRight  } from "react-icons/fa";
import { Heart, ShoppingCart } from "lucide-react";
import Addtocart from "@/components/AddToCart";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { v4 as uuidv4 } from "uuid";
// import IndexGalleryPreview from "@/components/gallery/Indexgallery";

// Shuffle function
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function HomeComponent() {

  // Activities fetched from API

  const reels = [
    "https://www.instagram.com/p/DSmwY8UCP5d/",
    "https://www.instagram.com/p/DSgqFNtgSJ3/",
    "https://www.instagram.com/p/DOni5vJjeCM/",
    "https://www.instagram.com/p/DNH9wCcsA0y/",
    "https://www.instagram.com/p/DRBLoV-ATRF/",
    "https://www.instagram.com/p/DNm8vtpO5Gy/"
  ];

  function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
      >
        <span className="text-lg font-semibold text-gray-800">
          {question}
        </span>
        <span
          className={`transform transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      <div
        className={`px-6 overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 pb-6" : "max-h-0"
        }`}
      >
        <p className="text-gray-600 leading-relaxed text-sm">
          {answer}
        </p>
      </div>
    </div>
  );
}

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isSectionLoading, setIsSectionLoading] = useState(false);
  // const [blogs, setBlogs] = useState([]);
  // const [blogLoading, setBlogLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  useEffect(() => {
    if (!hasMounted) return;
    checkAuthStatus();
  }, [hasMounted]);
  const controls = useAnimation();

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/auth/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData(data.user);
      } else {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };
 
  useEffect(() => {
    const handleRouteChange = () => setNavigating(false);

    if (!router?.events?.on) return;

    router.events.on("routeChangeComplete", handleRouteChange);
    router.events.on("routeChangeError", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      router.events.off("routeChangeError", handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
        else setIsVisible(false);
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  const [activities, setActivities] = useState([]);
  const [activitiesVisible, setActivitiesVisible] = useState(false);

  useEffect(() => {
    fetch("/api/activities/get")
      .then((r) => r.json())
      .then((data) => { if (data.success) setActivities(data.data); })
      .catch(console.error);
  }, []);

  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setActivitiesVisible(entry.isIntersecting); },
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => { observer.disconnect(); };
  }, [activities.length]);
  //  re-run once activities load and section renders

// useEffect(() => {
//   const fetchBlogs = async () => {
//     try {
//       const res = await fetch("/api/blogs/get", {
//         cache: "no-store",
//       });

//       const data = await res.json();

//       if (data?.success && Array.isArray(data.data)) {
//         // ✅ Filter only Active blogs
//         const activeBlogs = data.data.filter(
//           (blog) => blog.status === "Active"
//         );

//         setBlogs(activeBlogs);
//       } else {
//         setBlogs([]);
//       }

//     } catch (err) {
//       console.error("Blog fetch error:", err);
//     } finally {
//       setBlogLoading(false);
//     }
//   };

//   fetchBlogs();
// }, []);
  
  return (
    <>
      {/* {navigating && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black bg-opacity-30">
          <div className="p-4  shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="preloader fixed inset-0 z-[9999] flex justify-center items-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )} */}
      <main className="w-full overflow-hidden ">

        {/* HERO SECTION */}
        <section
            ref={containerRef}
            className="relative h-screen w-full overflow-hidden"
          >
          {/* BACKGROUND VIDEO */}
          <video
            className="absolute inset-0 w-full h-full object-cover filter contrast-125"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            loading="lazy"
              webkit-playsinline="true"  // iOS specific
              disablePictureInPicture
          >
            <source src="/videos/Img 9014 (3).mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/70 z-10"></div>

          {/* CONTENT */}
          <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center text-white">
            <h1
              className={`text-5xl md:text-7xl mb-4 fade-up font-serif
              ${
                isVisible ? "show" : ""
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Sathya School
            </h1>

            <p
              className={`text-xl md:text-2xl mb-6 font-extralight fade-up font-sans ${
                isVisible ? "show" : ""
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              Nurturing Minds • Shaping Futures
            </p>

            <p
              className={`max-w-2xl mx-auto mb-8 text-sm md:text-base fade-up font-extralight font-sans  ${
                isVisible ? "show" : ""
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              CBSE Pattern | Air Conditioned Campus | PreKG to 5th Standard
            </p>

            <Link
              href="/admission"
              className={`inline-block bg-red-600 hover:bg-red-400 text-white px-8 py-3 rounded-full font-semibold
                          transform hover:scale-105 transition-transform duration-300 ease-in-out fade-up ${
                            isVisible ? "show" : ""
                          }`}
              style={{ transitionDelay: "700ms" }}
            >
              Admission Open
            </Link>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-16 bg-gradient-to-r from-pink-100 via-blue-100 to-white shadow">

            {/* heading */}
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-4 text-gray-800">
                    About <span className="text-red-600">Sathya School</span>
                </h2>
            </div>

            {/* about first content */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Right Image */}
                 <div className="relative p-3">
                  <img
                    src="/images/home-page-img/about-img-one.png"
                    alt="School Campus"
                    className="rounded-3xl shadow-xl w-full border-4 border-white"
                  />

                  {/* FLOATING IMAGE */}
                  <img
                    src="/images/home-page-img/about-img-two.png"
                    alt="Classroom Learning"
                    className="absolute -bottom-12 -right-6 w-48 md:w-64 rounded-2xl shadow-2xl border-4 border-white hidden sm:block"
                  />
                </div>

                {/* Left Content */}
                <div>

                  {/* Small Heading */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-red-600">
                    Values That Inspire
                  </h3>
                  {/* Intro Paragraph */}
                  <p className="text-gray-600 mb-2 leading-relaxed">
                      Sathya School is a value-driven educational institution run by Sathya Agencies, a trusted name known for integrity, quality, and service excellence across South India. Inspired by the belief that strong values create strong futures, Sathya School is dedicated to providing a nurturing and inspiring environment where children feel safe, supported, and motivated to learn. We focus on developing not only academic excellence, but also character, confidence, and compassion in every child.
                  </p>
                </div>
            </div>

            {/* about second content */}
             <div className="mt-16 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content (Images) */}
                <div className="flex flex-col lg:grid lg:grid-cols-1 gap-4 order-1 lg:order-2">

                  {/* For mobile: show all 3 images in column */}
                  <div className="flex flex-col gap-4 lg:hidden">
                    <img
                      src="/images/home-page-img/about-vertical-img.jpg"
                      className="w-full rounded-3xl shadow-xl border-4 border-white lg:block hidden"
                      alt=""
                    />
                    <img
                      src="/images/home-page-img/about-img-four.png"
                      className="w-full rounded-2xl shadow-lg border-4 border-white lg:block hidden"
                      alt=""
                    />
                    <img
                      src="/images/home-page-img/about-img-five.jpg"
                      className="w-full rounded-2xl shadow-lg border-4 border-white"
                      alt=""
                    />
                  </div>

                  {/* For desktop: show grid with row-span */}
                  <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
                    <div className="row-span-2">
                      <img
                        src="/images/home-page-img/about-vertical-img.jpg"
                        className="w-full rounded-3xl shadow-xl border-4 border-white"
                        alt=""
                      />
                    </div>
                    <div>
                      <img
                        src="/images/home-page-img/about-img-four.png"
                        className="w-full rounded-2xl shadow-lg border-4 border-white"
                        alt=""
                      />
                    </div>
                    <div>
                      <img
                        src="/images/home-page-img/about-img-five.jpg"
                        className="w-full rounded-2xl shadow-lg border-4 border-white"
                        alt=""
                      />
                    </div>
                  </div>

                </div>

                {/* Right Contect (Text) */}
                <div className="order-2 lg:order-1">

                  {/* Small Heading */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-red-600">
                    Learning Beyond Books
                  </h3>

                  <p className="text-gray-600 mb-2 leading-relaxed">
                    Our learning approach combines structured academics with creative thinking, cultural awareness, and life skills. With caring teachers, modern teaching practices, and a student-centric environment, Sathya School helps children grow into responsible individuals who are prepared for both life and learning beyond the classroom. At Sathya School, education is a journey—guided by values, strengthened by knowledge, and shaped by care.
                  </p>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                    At Sathya School, education is a journey—guided by values, strengthened by knowledge, and shaped by care.
                  </p>
                </div>
            </div>
            {/* VISION & MISSION */}
            <div className="mt-16 relative mb-10 max-w-7xl mx-auto px-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                
                {/* Vision */}
                <div className="group relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="absolute -top-6 left-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg">
                    <FaStar className="text-xl" />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-gray-800 mb-3">
                    Our Vision
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    To nurture confident, responsible, and value-based individuals through quality education that
                    encourages curiosity, critical thinking, and lifelong learning, while shaping future leaders
                    who act with integrity, empathy, discipline, and a strong sense of social responsibility.
                  </p>
                </div>

                {/* Mission */}
                <div className="group relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="absolute -top-6 left-6 bg-red-600 text-white p-4 rounded-2xl shadow-lg">
                    <FaCheckCircle className="text-xl" />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-gray-800 mb-4">
                    Our Mission
                  </h3>

                  <ul className="space-y-2 text-gray-600">
                    {[
                      "To provide a safe, inclusive, and supportive learning environment",
                      "To deliver strong academic foundations through effective and engaging teaching",
                      "To instil moral values, discipline, and respect alongside education",
                      "To encourage curiosity, creativity, and independent thinking",
                      "To partner with parents in shaping well-rounded, future-ready students",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* CORE VALUES */}
            <div className="relative max-w-7xl mx-auto px-6">

              {/* Title */}
              <div className="mb-10">
                <h3 className="text-3xl font-extrabold text-gray-800">
                  Our Core Values
                </h3>
                <p className="text-gray-600 mt-2 max-w-xl">
                  The principles that guide our teaching, culture, and every child’s journey.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { icon: <FaCheckCircle />, title: "Integrity", text: "We believe in honesty, ethics, and doing the right thing—always." },
                  { icon: <FaHandshake />, title: "Respect", text: "We foster respect for teachers, peers, parents, and the wider community." },
                  { icon: <FaStar />, title: "Excellence", text: "We strive for high standards in academics, behaviour, and personal growth." },
                  { icon: <FaHeart />, title: "Care & Compassion", text: "Every child matters. We nurture with empathy, patience, and understanding." },
                   { icon: <FaUserCheck />, title: "Responsibility", text: "We encourage students to be accountable, disciplined, and socially aware." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group p-6 rounded-3xl bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-2"
                  >
                    <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-2xl group-hover:scale-110 transition">
                      {item.icon}
                    </div>

                    <h4 className="font-bold text-gray-800 mb-2">
                      {item.title}
                    </h4>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>


        </section>

        {/* GRADES OFFERED */}
        <section id="grade" className="relative bg-center bg-cover bg-scroll md:bg-fixed
                      min-h-[70vh] md:min-h-[70vh]
                      flex items-center shadow"
            style={{ backgroundImage: "url('/images/home-page-img/grade-bg.jpeg')" }}
          >
            {/* Black overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 w-full py-16">
            <h2 className="text-5xl text-center mb-4 text-white font-serif">
              <span className="text-white">Grades</span> We Offer
            </h2>

            <p className="text-center text-gray-200 mb-12 font-sans text-lg">
              A joyful learning journey from foundation to primary education
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* Pre KG */}
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 text-2xl">
                  <FaChild />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pre KG</h3>
                <p className="text-sm text-gray-600">
                  Play-based learning to build curiosity and confidence.
                </p>
              </div>

              {/* LKG */}
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-2xl">
                  <FaShieldAlt />
                </div>
                <h3 className="text-xl font-semibold mb-2">LKG</h3>
                <p className="text-sm text-gray-600">
                  Early literacy and joyful classroom experiences.
                </p>
              </div>

              {/* UKG */}
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
                  <FaHeadset />
                </div>
                <h3 className="text-xl font-semibold mb-2">UKG</h3>
                <p className="text-sm text-gray-600">
                  Strong foundation in reading, writing, and numbers.
                </p>
              </div>

              {/* 1st – 5th Std */}
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-2xl">
                  <FaAward />
                </div>
                <h3 className="text-xl font-semibold mb-2">1st – 5th Std</h3>
                <p className="text-sm text-gray-600">
                  Academic excellence with creativity and discipline.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* why choose section */}
        <section
          id="Why"
          className="py-14 bg-gradient-to-r from-pink-100 via-blue-100 to-white shadow"
        >
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
               Why Parent Trust <span className="text-red-600">Sathya School?</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: <FaAward className="text-indigo-600" />,
                  title: "Quality Education",
                  description:
                    "Experienced teachers deliver the best academic learning with innovative teaching methods.",
                  bg: "bg-indigo-100",
                  iconColor: "text-indigo-600",
                },
                {
                  icon: <FaUsers className="text-yellow-600" />,
                  title: "Interactive Atmosphere",
                  description:
                    "Students learn in a collaborative, fun, and creative environment that encourages curiosity.",
                  bg: "bg-yellow-100",
                  iconColor: "text-yellow-600",
                },
                {
                  icon: <FaShieldAlt className="text-green-600" />,
                  title: "Individual Attention",
                  description:
                    "Small class sizes ensure each child receives personal guidance and support.",
                  bg: "bg-green-100",
                  iconColor: "text-green-600",
                },
                {
                  icon: <FaHeadset className="text-pink-600" />,
                  title: "Activity Based Learning",
                  description:
                    "Hands-on learning, creative projects, and games to make education fun.",
                  bg: "bg-pink-100",
                  iconColor: "text-pink-600",
                },
                {
                  icon: <FaLaptop className="text-blue-600" />,
                  title: "Computer Lab",
                  description:
                    "Modern lab facilities help students explore technology and coding.",
                  bg: "bg-blue-100",
                  iconColor: "text-blue-600",
                },
                {
                  icon: <FaSnowflake className="text-indigo-700" />,
                  title: "Air Conditioned Campus",
                  description:
                    "Comfortable learning environment for students throughout the year.",
                  bg: "bg-indigo-200",
                  iconColor: "text-indigo-700",
                },
              ].map(({ icon, title, description, bg, iconColor }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-6 bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-default"
                >
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-full ${bg} ${iconColor} text-2xl flex-shrink-0`}
                  >
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1 text-gray-800">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACTIVITIES — only shown when at least one Active activity exists */}
        {activities.length > 0 && (
        <section ref={sectionRef} className="py-14 bg-white shadow" id="ACTIVITIES">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-2 text-gray-800">
              Sports <span className="text-red-600">&</span> Activities
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Our diverse sports and co-curricular programs help children develop confidence, creativity, and teamwork.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
              {activities.map((activity, index) => {
                const animClass = index % 3 === 0
                  ? "activity-animate-left"
                  : index % 3 === 1
                  ? "activity-animate-up"
                  : "activity-animate-right";
                return (
                <Link
                  key={activity.name}
                  href={`/activities/${activity.slug}`}
                  data-key={activity.name}
                  className={`activity-card group bg-white rounded-3xl shadow-md overflow-hidden cursor-pointer border-2 border-red-600 hover:shadow-xl transition-shadow block ${activitiesVisible ? animClass : "opacity-0"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img src={activity.imageSrc} alt={activity.name} className="w-full transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    </div>
                  </div>

                  <div className="px-5 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.name}</h3>
                    <p className="text-gray-600 text-sm">{activity.tagline}</p>
                  </div>
                </Link>
              )})}
            </div>
          </div>
        </section>
        )}

        {/* gallery section  */}
        {/* <IndexGalleryPreview /> */}
        {/*end gallery section */}

        {/* CTA SECTION */}
        <section className="relative bg-center bg-cover bg-scroll md:bg-fixed
             min-h-[60vh] sm:min-h-[40vh] md:min-h-[60vh] lg:min-h-[80vh]
             flex items-center shadow"
            style={{ backgroundImage: "url('/images/home-page-img/admission-bg.jpeg')" }}
          >
          {/* Black overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="md:text-5xl text-4xl mb-4 drop-shadow-md font-serif">
              Admission Open Now
            </h2>

            <p className="md:text-xl text-lg mb-6 drop-shadow-sm font-sans">
              Rajapalayam, Melalangarathattu, Thoothukudi <br />
              Air Conditioned Campus | Quality Education
            </p>

            <div className="flex justify-center gap-6 flex-wrap">
              <Link
                href="/admission"
                className="bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none rounded-md px-8 py-3 font-semibold shadow-lg transition transform hover:scale-105 text-white"
              >
                Apply for Admission
              </Link>
            </div>
          </div>
        </section>

         {/* blog section */}
        {/* {!blogLoading && blogs.length > 0 && (
          <section className="py-14 bg-gradient-to-r from-pink-100 via-blue-100 to-white shadow">
            <div className="relative max-w-7xl mx-auto px-6">

 
                <h2 className="text-4xl font-bold text-center mb-2 text-gray-800">
                  Latest <span className="text-red-600">Blogs</span>
                </h2>
                <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                  Insights, updates, and stories from Sathya School
                </p>
              

 
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="select-none"
              >
                {blogs.slice(0, 10).map((blog) => (
                  <SwiperSlide key={blog._id}>
                    <div className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition-all h-full">

                      <Link href={`/blog/${blog.blog_slug}`}>
                        <img
                          src={blog.image || "/images/placeholder.jpg"}
                          alt={blog.blog_name}
                          className="w-full h-56 object-cover"
                        />
                      </Link>

                      <div className="p-4">
                        <div className="mb-3">
                          <span className="text-red-500 text-xs bg-red-100 px-3 py-1 rounded-full w-max">
                            {new Date(blog.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>

                
                        <Link href={`/blog/${blog.blog_slug}`} className="group-hover:text-red-500 transition-colors">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:underline hover:text-red-500">
                            {blog.blog_name}
                          </h3>
                        </Link>

                        <p className="text-gray-600 flex-1 mb-4 text-sm">
                          {stripHtml(blog.description).slice(0, 100)}...
                        </p>

 
                        <div className="mt-auto">
                          <Link
                            href={`/blog/${blog.blog_slug}`}
                            className="relative inline-block overflow-hidden text-red-500 text-sm font-medium py-2 px-3 rounded-lg underline
                                      transition-colors duration-300
                                      before:absolute before:inset-0 before:bg-red-600
                                      before:origin-left before:scale-x-0 before:transition-transform before:duration-300
                                      hover:text-white hover:before:scale-x-100"
                          >
                            <span className="relative z-10">Read More</span>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </SwiperSlide>
                ))}

              </Swiper>

      
                <button
                  ref={prevRef}
                  className="absolute left-0 top-1/2 -translate-y-1/2 
                            bg-red-500 text-white p-2 rounded-full shadow-lg 
                            hover:bg-white hover:text-red-500 transition z-50"
                >
                  <FiChevronLeft size={22} />
                </button>

                <button
                  ref={nextRef}
                  className="absolute right-0 top-1/2 -translate-y-1/2 
                            bg-red-500 text-white p-2 rounded-full shadow-lg 
                            hover:bg-white hover:text-red-500 transition z-50"
                >
                  <FiChevronRight size={22} />
                </button>

              <div className="pt-6 text-center">
                 <Link
                  href="/blog"
                  className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-400 text-white font-semibold hover:gap-3 transition-all border border-red-500 rounded-full py-2 px-3 transition transform hover:scale-105"
                >
                  View All Blogs 
                </Link>
              </div>
            </div>
          </section>
        )} */}

        {/*insta stories */}
        <section className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-14 text-center">
            {/* Heading */}
            <h2 className="text-3xl font-bold mb-6"><span className="text-red-600">Instagram</span> Stories</h2>
           <div className="insta-swiper pb-[40px] mx-2 relative">
              {/* Navigation & Pagination wrapper above slides */}
              <div className="flex justify-between items-center mb-4">
                <div className="swiper-pagination" />
              </div>

              <Swiper
                modules={[Navigation, Autoplay, Pagination]}
                navigation={{
                  prevEl: ".insta-swiper .swiper-prev",
                  nextEl: ".insta-swiper .swiper-next",
                }}
                pagination={{
                  el: ".insta-swiper .swiper-pagination",
                  clickable: true,
                }}
                spaceBetween={20} // spacing between slides
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 20 }, // 4 slides on desktop
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false, // continue autoplay even if user hovers/plays
                }}
                loop={true} // loop infinitely
                preventClicks={false}
                preventClicksPropagation={false}
                onSwiper={() => window.instgrm?.Embeds.process()} // render Instagram embeds
              >
                {reels.map((url, i) => (
                  <SwiperSlide key={i} className="flex justify-center">
                    <blockquote
                      className="instagram-media max-w-[300px] w-full"
                      data-instgrm-permalink={url}
                      data-instgrm-version="14"
                      style={{ margin: "0 auto" }} strategy="lazyOnload"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

            </div>

          </div>
        </section>

        {/* faq section */}
        <section id="faq" className="py-14 bg-gradient-to-r from-pink-100 via-blue-100 to-white shadow">
          <div className="max-w-5xl mx-auto px-6">

            {/* Heading */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-3">
                Frequently Asked <span className="text-red-600">Questions</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about admissions, curriculum, and campus facilities.
              </p>
            </div>


            <div className="space-y-6">
              {[
                {
                  q: "What curriculum does Sathya School follow?",
                  a: "Sathya School follows the CBSE pattern, focusing on strong academics, values, and holistic development.",
                },
                {
                  q: "Which grades are offered at Sathya School?",
                  a: "We offer classes from Pre KG to 5th Standard with age-appropriate learning approaches.",
                },
                {
                  q: "Is the campus fully air-conditioned?",
                  a: "Yes, our entire campus is fully air-conditioned to ensure a comfortable learning environment for students.",
                },
                {
                  q: "What facilities are available for students?",
                  a: "We provide modern classrooms, computer lab, activity-based learning spaces, sports facilities, and a safe campus.",
                },
                {
                  q: "How can I apply for admission?",
                  a: "You can apply online through our Admission page or visit the school campus for direct assistance.",
                },
              ].map((item, index) => (
                <FaqItem key={index} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* contact section */}
        <section className="py-14 bg-white shadow">
          <div className="max-w-7xl mx-auto px-6">
            {/* Heading */}
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-gray-900">
                Contact <span className="text-red-600">Us</span>
              </h2>
              <p className="text-gray-600 mt-2">10am – 7pm weekdays</p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Admission Enquiry */}
              <div className="flex items-center justify-between bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Admission Enquiry
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    (Admissions & general enquiries)
                  </p>

                  <div className="flex items-center gap-3 text-green-600 font-medium mb-2">
                    <FaPhoneAlt />
                    <Link href="tel:+919944899771" className="hover:underline">
                      +91 99448 99771
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 text-green-600 font-medium">
                    <FaEnvelope  />
                    <Link href="mailto:info@sathya.school" className="hover:underline">
                      info@sathya.school
                    </Link>
                  </div>

                </div>
                
                {/* Right FA Icon */}
                <div className="ml-6 flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl">
                  <FaUserGraduate />
                </div>
              </div>

              {/* School Office */}
              <div className="flex items-center justify-between bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    School Office
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    (Office & academic support)
                  </p>

                  <div className="flex items-center gap-3 text-green-600 font-medium mb-2">
                    <FaPhoneAlt />
                    <a href="tel:+919597701985" className="hover:underline">
                      +91 95977 01985
                    </a>
                  </div>

                  <div className="flex items-center gap-3 text-green-600 font-medium mb-2">
                    <FaEnvelope  />
                    <a href="mailto:info@sathya.school" className="hover:underline">
                      info@sathya.school
                    </a>
                  </div>

                 <div className="flex items-center gap-3 text-green-600 font-medium flex-wrap">
                    <FaMapMarkerAlt />
                    <span className="break-words">
                      Rajapalayam, Melalangaarathattu, Thoothukudi
                    </span>
                  </div>


                </div>

                {/* Right FA Icon */}
                <div className="ml-6 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-3xl">
                  <FaSchool />
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </>
  );
}
