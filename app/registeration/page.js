"use client";
import { useState, useEffect } from "react";

import RegistrationComponent from "@/components/registration/registration";


export default function Dashboard() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(Date.now());
  }, []);

  return (
    <div>
      
      <RegistrationComponent /> {/* Use the Home component here */}
    </div>
  );
}
