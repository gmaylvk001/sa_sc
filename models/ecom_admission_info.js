import mongoose from "mongoose";

const AdmissionSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      
    },
	stud_class: { 
      type: String, 
	  enum: ["PreKG", "LKG","UKG", "1st Std","2nd Std", "3rd Std","4th Std", "5th Std"],
      required: true 
    },
	gender: { 
      type: String, 
	  enum: ["Male", "Female"],
      required: true 
    },
	date_of_birth: { 
      type: Date, 
      required: true 
    },
	parent_guardian: { 
      type: String, 
      required: true 
    },
    phone_number: { 
      type: String, 
      required: true,
      match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number'] // Assuming a 10-digit mobile number
    },
    
    address: { 
      type: String, 
      required: true 
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default  mongoose.models.ecom_register_info || mongoose.model("ecom_register_info", AdmissionSchema);
