import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postName: {
      type: String,
      required: [true, "Post Name is required"],
      unique: true,
      trim: true,
      uppercase: true, // Stores "TRICHY JUNCTION" automatically
    },
    
    postCode: {
      type: String,
      required: [true, "Station Code is required"],
      unique: true,
      trim: true,
      uppercase: true, // e.g., "TPJ"
    },

    division: {
      type: String,
      required: true,
      uppercase: true, // e.g., "TRICHY"
    },

    zone: {
      type: String,
      required: true,
      default: "SOUTHERN RAILWAY", 
      uppercase: true,
    },

    /* --- Contact & Location --- */
    contactNumber: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    /* --- Administrative --- */
    officerInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer", // Reference to the User/Officer model
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);