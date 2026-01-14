import mongoose from "mongoose";

const RegisterationSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      
    },
	
	stud_class: {
	  type: String,
	  required: true,
	  enum: ["PreKG", "LKG", "UKG", "1st Std", "2nd Std", "3rd Std", "4th Std", "5th Std"]
	},
	
	date_of_birth: {
	  type: Date,
	  required: [true, "Date of Birth is required"],

	},
	
	gender: {
	  type: String,
	  required: true,
	  enum: ["Male", "Female"]
	},
	
	parent_or_guardian: { 
      type: String, 
      required: true, 
      
    },

    mobile_number: { 
      type: String, 
      required: true,
      match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number'] // Assuming a 10-digit mobile number
    },
    address: { 
      type: String, 
      required: false 
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default  mongoose.models.ecom_registration_infos || mongoose.model("ecom_registration_infos", RegisterationSchema);
