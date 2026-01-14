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
import {FaBicycle,FaPhoneAlt,FaShieldAlt,FaHeadset,FaCreditCard,FaUsers,FaChild,FaFistRaised,FaLaptop,FaSnowflake,FaAward,FaFutbol,FaRunning,FaTheaterMasks,FaMusic,FaPaintBrush,FaGuitar,FaDrum,FaUtensils,FaSchool, FaProjectDiagram, FaUserCheck,FaInstagram, FaYoutube,FaFacebook,FaCheckCircle,FaHandshake,FaStar,FaHeart } from "react-icons/fa";
import { Heart, ShoppingCart } from "lucide-react";
import Addtocart from "@/components/AddToCart";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { v4 as uuidv4 } from "uuid";
import ProductCard from "@/components/ProductCard";

export default function HomeComponent() {

  const reels = [
    "https://www.instagram.com/p/DSmwY8UCP5d/",
    "https://www.instagram.com/p/DSgqFNtgSJ3/",
    "https://www.instagram.com/p/DOni5vJjeCM/",
    "https://www.instagram.com/p/DNH9wCcsA0y/",
    "https://www.instagram.com/p/DRBLoV-ATRF/",
    "https://www.instagram.com/p/DNm8vtpO5Gy/"
  ];

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

  return (
    <>
      {navigating && (
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
      )}
      <main className="w-full overflow-hidden pt-16 mt-3">

        {/* HERO SECTION */}
        <section
        className="relative text-white bg-cover bg-center"
        style={{ backgroundImage: "url('/images/sathya-school-bg-scaled.png')" }}
      >
        {/* Darker Overlay */}
        <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Sathya School</h1>

          <p className="text-lg md:text-2xl mb-6">
            Nurturing Minds • Shaping Futures
          </p>

          <p className="max-w-2xl mx-auto mb-8 text-sm md:text-base">
            CBSE Pattern | Air Conditioned Campus | PreKG to 5th Standard
          </p>

          {/* Button */}
          <Link
            href="/admission"
            className="relative z-10 inline-block bg-white text-red-500 px-8 py-3 rounded-full font-semibold
                      transform hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            Admission Open
          </Link>
        </div>
      </section>



        {/* ABOUT SECTION */}
        <section id="about" className="py-20 bg-gradient-to-r from-pink-100 via-blue-100 to-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Right Image */}
                <div className="relative"> 
                <img
                    src="/images/about-imgs.png"
                    alt="About Sathya School"
                    className="rounded-2xl shadow-lg w-full"
                />
                </div>

                {/* Left Content */}
                <div>
                  <h2 className="text-4xl font-bold mb-4 text-gray-800">
                      About <span className="text-red-500">Sathya School</span>
                  </h2>

                  {/* Intro Paragraph */}
                  <p className="text-gray-600 mb-2 leading-relaxed">
                      Sathya School is a value-driven educational institution run by Sathya Agencies, a trusted name known for integrity, quality, and service excellence across South India. Inspired by the belief that strong values create strong futures, Sathya School is dedicated to providing a nurturing and inspiring environment where children feel safe, supported, and motivated to learn. We focus on developing not only academic excellence, but also character, confidence, and compassion in every child.
                  </p>

                  <p className="text-gray-600 mb-2 leading-relaxed">
                      Our learning approach combines structured academics with creative thinking, cultural awareness, and life skills. With caring teachers, modern teaching practices, and a student-centric environment, Sathya School helps children grow into responsible individuals who are prepared for both life and learning beyond the classroom. At Sathya School, education is a journey—guided by values, strengthened by knowledge, and shaped by care.
                  </p>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                       At Sathya School, education is a journey—guided by values, strengthened by knowledge, and shaped by care.
                  </p>
                </div>
            </div>
      
    
            {/* VISION & MISSION */}
            <div className="relative mb-10 max-w-7xl mx-auto px-6">

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
                  <div className="absolute -top-6 left-6 bg-red-500 text-white p-4 rounded-2xl shadow-lg">
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
        <section  id="grade" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
              <span className="text-red-500">Grades</span> We Offer
            </h2>
            <p className="text-center text-gray-600 mb-12">
              A joyful learning journey from foundation to primary education
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* Pre KG */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 text-2xl font-bold">
                  <FaChild />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pre KG</h3>
                <p className="text-sm text-gray-600">
                  Play-based learning to build curiosity and confidence.
                </p>
              </div>

              {/* LKG */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-2xl font-bold">
                  <FaShieldAlt />
                </div>
                <h3 className="text-xl font-semibold mb-2">LKG</h3>
                <p className="text-sm text-gray-600">
                  Early literacy and joyful classroom experiences.
                </p>
              </div>

              {/* UKG */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl font-bold">
                  <FaHeadset />
                </div>
                <h3 className="text-xl font-semibold mb-2">UKG</h3>
                <p className="text-sm text-gray-600">
                  Strong foundation in reading, writing, and numbers.
                </p>
              </div>

              {/* 1st – 5th Std */}
              <div className="group relative bg-white rounded-2xl shadow-lg p-8 text-center hover:-translate-y-2 transition">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold">
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
          className="py-16 bg-gradient-to-r from-pink-100 via-blue-100 to-white"
        >
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
               Why Parent Trust <span className="text-red-500">Sathya School?</span>
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

        {/* ACTIVITIES */}
        <section id="ACTIVITIES" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
              Sports & Activities
            </h2>
        
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
        
              {/* Card Array */}
              {[
                { name: "Karate", icon: FaRunning, bg: "bg-red-100", color: "text-red-600" },
                { name: "Silambam", icon: FaFistRaised, bg: "bg-yellow-100", color: "text-yellow-600" },
                { name: "Bharathanatyam", icon: FaUsers, bg: "bg-pink-100", color: "text-pink-600" },
                { name: "Western Dance", icon: FaMusic, bg: "bg-purple-100", color: "text-purple-600" },
                { name: "Art & Craft", icon: FaPaintBrush, bg: "bg-green-100", color: "text-green-600" },
                { name: "Singing", icon: FaGuitar, bg: "bg-blue-100", color: "text-blue-600" },
                { name: "Music", icon: FaDrum, bg: "bg-indigo-100", color: "text-indigo-600" },
                { name: "Cookery", icon: FaUtensils, bg: "bg-orange-100", color: "text-orange-600" },
              ].map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center p-6 rounded-2xl  transition cursor-pointer`}
                  >
                    <div className={`w-20 h-20 mb-4 flex items-center  shadow-lg border-2 border-red-500  hover:scale-105 justify-center rounded-full ${activity.bg} ${activity.color} text-3xl`}>
                      <Icon />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 text-center">
                      {activity.name}
                    </h3>
                  </div>
                );
              })}
        
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 bg-gradient-to-r from-pink-100 via-blue-100 to-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold mb-4 drop-shadow-md text-red-500">
              Admission Open Now
            </h2>
            <p className="text-lg mb-6 drop-shadow-sm">
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

        <section className=" bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center">
            {/* Heading */}
            <h2 className="text-3xl font-bold mb-6">Instagram Stories</h2>
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
      </main>
    </>
  );
}
