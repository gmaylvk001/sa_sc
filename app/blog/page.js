"use client";
import { useState, useEffect, Suspense } from "react";
import BlogComponent from "@/components/blog/blog";

export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <BlogComponent />
      </Suspense>
    </div>
  );
}
