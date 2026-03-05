"use client";
import ActivityDetail from "@/components/activities/ActivityDetail";
import { useParams } from "next/navigation";

export default function ActivityPage() {
  const { slug } = useParams();
  return <ActivityDetail slug={slug} />;
}
