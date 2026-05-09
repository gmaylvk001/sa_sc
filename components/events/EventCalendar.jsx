"use client";

import { useEffect, useState, useRef } from "react";
import { FaChevronDown, FaRegCalendarAlt } from "react-icons/fa";

const M = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MF = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(null);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch("/api/events/get")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const filtered = data.data
            .filter((e) => e.status === true && new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          setEvents(filtered);
        }
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  const scrollToNext = () => {
    if (!scrollRef.current || events.length <= 1) return;
    const otherEvents = events.slice(1);
    currentIndexRef.current = (currentIndexRef.current + 1) % otherEvents.length;
    scrollRef.current.scrollTo({
      top: currentIndexRef.current * 88,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (events.length <= 1) return;
    intervalRef.current = setInterval(() => {
      scrollToNext();
    }, 2500);
    return () => clearInterval(intervalRef.current);
  }, [events]);

  const handleNext = () => {
    scrollToNext();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      scrollToNext();
    }, 2500);
  };

  const fmt = (dateStr) => {
    const d = new Date(dateStr);
    return {
      dd: String(d.getDate()).padStart(2, "0"),
      mm: M[d.getMonth()],
      mf: MF[d.getMonth()],
      yyyy: d.getFullYear(),
    };
  };

  // Events இல்லன்னா அல்லது load ஆகலன்னா — section hide
  if (!loaded || events.length === 0) return null;

  return (
    <section className="relative pb-8 pt-14 bg-white overflow-hidden">

      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/images/bg/events_bg.png')" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-15 items-center">

          <div className="hidden lg:block absolute left-[-70px] bottom-[-30px] z-10 animate-float">
            <img
              src="/images/bg/events_balloon.png"
              alt="floating"
              className="w-[200px] xl:w-[240px] opacity-90 pointer-events-none select-none"
            />
          </div>

          {/* LEFT SIDE */}
          <div className="flex items-center justify-center h-full min-h-[320px]">
            <div className="text-center relative">

              <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-40" />

              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-[2px] uppercase text-red-500">Stay Connected</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-[2px] uppercase text-red-500">Stay Informed</span>
              </div>

              <p
                className="text-[42px] md:text-[72px] font-black uppercase leading-none tracking-tight bg-gradient-to-r from-[#2EC4B6] via-[#1FA2FF] to-[#0061FF] bg-clip-text text-transparent"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Upcoming
              </p>

              <h2
                className="text-[42px] md:text-[62px] font-light leading-none mt-2 bg-gradient-to-r from-[#FF4F7B] via-[#FF6A88] to-[#D72663] bg-clip-text text-transparent"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}
              >
                Events
              </h2>

              <div className="flex items-center justify-center gap-3 mt-5">
                <div className="w-10 h-[1.5px] bg-gradient-to-r from-transparent to-gray-300" />
                <span className="text-[12px] text-gray-600 font-bold tracking-wide uppercase whitespace-nowrap">
                  Stay Updated with School Activities
                </span>
                <div className="w-10 h-[1.5px] bg-gradient-to-l from-transparent to-gray-300" />
              </div>

              <div className="mt-6 inline-flex items-center gap-3 bg-white border border-red-200 shadow-sm rounded-full px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-[#E03030] text-white flex items-center justify-center text-sm font-bold">
                  {events.length}
                </div>
                <span className="text-sm font-semibold text-[#c0392b] tracking-wide">Upcoming Events</span>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="rounded-3xl border-0 shadow-2xl bg-gradient-to-br from-[#fdfbff] via-[#f4f6ff] to-[#eef1ff] overflow-hidden">

            <div className="px-5 py-4 bg-white/70 backdrop-blur border-b flex items-center justify-between">
              <p className="text-xs font-bold tracking-[0.18em] uppercase bg-gradient-to-r from-[#ff4f7b] via-[#ff7eb3] to-[#d72663] bg-clip-text text-transparent">
                Events Calendar
              </p>
              {events.length > 1 && (
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff4f7b] to-[#d72663] flex items-center justify-center shadow-md hover:scale-110 transition duration-300"
                >
                  <FaChevronDown className="text-[11px] text-white" />
                </button>
              )}
            </div>

            <div>
              {/* FIRST EVENT - STATIC */}
              <div
                className="relative px-6 py-7 text-white"
                style={{
                  background: "linear-gradient(135deg,#1FA2FF 0%,#6A11CB 100%)",
                  overflow: "hidden",
                }}
              >
                <div className="absolute top-[-40px] right-[-40px] w-[160px] h-[160px] bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-30px] left-[40%] w-[120px] h-[120px] bg-white/10 rounded-full blur-2xl" />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 opacity-20">
                  <FaRegCalendarAlt className="text-[80px] text-white" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-2 relative z-10">
                  Next Event
                </p>
                <h3 className="text-lg font-bold mb-4 relative z-10">{events[0]?.title}</h3>
                <div className="flex items-end gap-3 relative z-10">
                  <span className="text-5xl font-extrabold drop-shadow-lg">{fmt(events[0]?.date).dd}</span>
                  <div>
                    <p className="text-sm font-bold">{fmt(events[0]?.date).mm}</p>
                    <p className="text-xs text-white/70">{fmt(events[0]?.date).yyyy}</p>
                  </div>
                </div>
              </div>

              {/* OTHER EVENTS - AUTO SCROLL */}
              {events.length > 1 && (
                <div
                  ref={scrollRef}
                  className="overflow-hidden"
                  style={{ height: "88px" }}
                >
                  {events.slice(1).map((ev) => {
                    const f = fmt(ev.date);
                    return (
                      <div
                        key={ev._id}
                        className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 bg-white"
                        style={{ height: "88px" }}
                      >
                        <div className="w-[55px] h-[60px] rounded-xl bg-gradient-to-br from-[#ff4f7b] to-[#d72663] text-white flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
                          <p className="text-xl font-extrabold leading-none">{f.dd}</p>
                          <p className="text-[10px] uppercase tracking-wider mt-1">{f.mm}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{ev.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{f.mf} {f.yyyy}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
