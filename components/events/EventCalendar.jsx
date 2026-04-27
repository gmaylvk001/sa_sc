"use client";
import { useEffect, useState } from "react";

export default function EventCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/events/get")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const filtered = data.data.filter(
            (e) => e.status === true && new Date(e.date) >= today
          );
          setEvents(filtered);
        }
      })
      .catch(console.error);
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Event <span className="text-red-600">Calendar</span>
        </h2>
        <div className="w-10 h-1 bg-gray-800 mb-8" />

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* RIGHT — Info */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">

            {/* Upcoming count (COMPACT) */}
            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 border border-red-200">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xl font-bold flex-shrink-0">
                {events.length}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Upcoming Events
                </h3>
              </div>
            </div>

            {/* Next event (HIGHLIGHT CARD) */}
            {events[0] && (() => {
              const d = new Date(events[0].date);
              const day = d.getDate().toString().padStart(2, "0");
              const month = d
                .toLocaleString("en", { month: "short" })
                .toUpperCase();
              const year = d.getFullYear();

              return (
                <div
                  className="
                  bg-red-600 text-white rounded-2xl shadow-md p-6
                  transform transition-all duration-500 ease-out
                  hover:scale-[1.04] hover:shadow-2xl
                  animate-fadeInUp
                "
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-80">
                    Next Event
                  </p>

                  <h3 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-wide">
                    {events[0].title}
                  </h3>

                  <p className="text-4xl font-extrabold leading-none">
                    {day}{" "}
                    <span className="text-xl font-semibold">{month}</span>{" "}
                    <span className="text-xl font-semibold">{year}</span>
                  </p>
                </div>
              );
            })()}

          </div>

          {/* LEFT — Event list */}
          <div className="order-2 lg:order-1">
            <div className="flex flex-col">
              {events.map((event, i) => {
                const d = new Date(event.date);
                const day = d.getDate().toString().padStart(2, "0");
                const month = d
                  .toLocaleString("en", { month: "short" })
                  .toUpperCase();

                return (
                  <div
                    key={event._id}
                    className={`flex items-center py-5 ${
                      i !== events.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    {/* Red line */}
                    <div className="w-1 h-12 bg-red-600 rounded-sm mr-5 flex-shrink-0" />

                    {/* Date */}
                    <div className="min-w-[64px] mr-5">
                      <div className="text-2xl md:text-3xl font-bold text-gray-800 leading-none">
                        {day}
                      </div>
                      <div className="text-xs font-semibold text-red-600 tracking-widest mt-1">
                        {month}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-wide">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
