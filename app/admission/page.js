"use client";
import { useState, useEffect } from "react";

import AdmissionComponent from "@/components/admission/admission";


export default function Dashboard() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(Date.now());
  }, []);

  return (
    <div>
      
      <AdmissionComponent /> {/* Use the Home component here */}
    </div>
  );
}
