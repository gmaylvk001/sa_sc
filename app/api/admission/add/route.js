import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContactModel from "@/models/ecom_admission_info";

export async function POST(request) {
  try {
    await dbConnect(); // Ensure DB connection

    const body = await request.json();
    const { name, stud_class, gender, date_of_birth, parent_guardian, phone_number, address, status } = body;

    // Validate fields
    if (!name || !stud_class || !gender || !date_of_birth || !parent_guardian || !phone_number || !address) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check for existing contact (optional — usually check email instead of name)
    const existingContact = await ContactModel.findOne({ phone_number });
    if (existingContact) {
      return NextResponse.json(
        { success: false, message: "Contact already exists" },
        { status: 400 }
      );
    }

    // Create new contact
    const newContact = new ContactModel({
      name,
	  stud_class,
	  gender,
      date_of_birth,
      parent_guardian,
      phone_number,
      address,
      status,
    });

    await newContact.save();

    return NextResponse.json(
      { success: true, message: "Contact added successfully", data: newContact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding contact:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
