import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContactModel from "@/models/ecom_admission_info";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      name,
      stud_class,
      gender,
      date_of_birth,
      parent_guardian,
      phone_number,
      address,
      status,
      branch, // ✅ NEW
    } = body;

    // ✅ Validation
    if (
      !name ||
      !stud_class ||
      !gender ||
      !date_of_birth ||
      !parent_guardian ||
      !phone_number ||
      !address ||
      !branch // ✅ REQUIRED
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ Check duplicate (based on phone)
    const existing = await ContactModel.findOne({ phone_number });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Contact already exists" },
        { status: 400 }
      );
    }

    // ✅ Save
    const newAdmission = await ContactModel.create({
      name,
      stud_class,
      gender,
      date_of_birth,
      parent_guardian,
      phone_number,
      address,
      status,
      branch, // ✅ SAVE
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admission added successfully",
        data: newAdmission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
