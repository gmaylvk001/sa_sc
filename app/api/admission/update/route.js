import dbConnect from "@/lib/db";
import Contact from "@/models/ecom_contact_info";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await dbConnect();

  try {
    const body = await req.json(); // ✅ FIX
    const { id, name, email_address, mobile_number } = body;

    if (!id || !name || !email_address || !mobile_number) {
      return NextResponse.json({
        success: false,
        message: "Missing fields",
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { name, email_address, mobile_number },
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json({
        success: false,
        message: "Contact not found",
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
