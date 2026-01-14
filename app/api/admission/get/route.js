import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdmissionModel from "@/models/ecom_admission_info";

export async function GET() {
  await dbConnect();

  try {
    const contacts = await AdmissionModel.find({});
    return NextResponse.json({ success: true, data: contacts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching contacts" }, { status: 500 });
  }
}
