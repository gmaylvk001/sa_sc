import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdmissionModel from "@/models/ecom_admission_info";

export async function GET() {
  await dbConnect();

  try {
    const data = await AdmissionModel.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching admissions" },
      { status: 500 }
    );
  }
}
