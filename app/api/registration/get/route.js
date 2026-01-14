// /app/api/Registeration/get

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import RegisterationModel from "@/models/ecom_registration_info";

export async function GET() {
  await dbConnect();

  try {
    const Registeration = await RegisterationModel.find({});
    return NextResponse.json({ success: true, data: Registeration }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching registeration" }, { status: 500 });
  }
}
