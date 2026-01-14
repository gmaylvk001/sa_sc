import dbConnect from "@/lib/db";
import Contact from "@/models/ecom_registration_info";
import { NextResponse } from "next/server";
export  async function PUT(req) {  // Fix: Added 'res' parameter
  await dbConnect(); // Fix: Ensure database connection


    try {
      const { id, name, classnew,date_of_birth,gender, mobile_number,address,parent_or_guardian } = req.body;

      if (!id || !name || !classnew || !mobile_number || !date_of_birth || !parent_or_guardian) {
        return NextResponse.json({ success: false, message: "Missing fields" });
      }

      const updatedContact = await Contact.findByIdAndUpdate(  // Fix: Used correct model
        id,
        { name, classnew, mobile_number, date_of_birth, parent_or_guardian },
        { new: true }
      );

      if (!updatedContact) {
        return NextResponse.json({ success: false, message: "Your Registration not found" });
      }

      return NextResponse.json({ success: true, data: updatedContact });
    } catch (error) {
      console.error("Update error:", error);
      return NextResponse.json({ success: false, message: "Server error" });
    }
  
}
