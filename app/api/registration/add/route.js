import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import RegisterationModel from "@/models/ecom_registration_info";

export async function POST(request) {
  try {
	  alert("Welcome:)");
    await dbConnect(); // Ensure DB connection

    const body = await request.json();
    const { name, stud_class, date_of_birth, gender, parent_or_guardian, mobile_number, address, status } = body;

    // Validate fields
    if (!name || !stud_class || !date_of_birth || !gender || !parent_or_guardian || !mobile_number) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check for existing contact (optional — usually check email instead of name)
    const existingContact = await RegisterationModel.findOne({ mobile_number });
    if (existingContact) {
		alert("chcek");
      return NextResponse.json(
        { success: false, message: "Registration already exists" },
        { status: 400 }
      );
    }

    // Create new contact
    const newContact = new RegisterationModel({
      name,
      stud_class,
      date_of_birth,
      gender,
      parent_or_guardian,
	  mobile_number,
	  address,
      status,
    });

    await newContact.save();

    return NextResponse.json(
      { success: true, message: "Registered successfully", data: newContact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in adding admission:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
