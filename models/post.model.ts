import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postName: {
      type: String,
      required: [true, "Post Name is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    postCode: {
      type: String,
      required: [true, "Station Code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    division: {
      type: String,
      required: true,
      uppercase: true,
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

    /* --- Authentication (NEW) --- */

    password: {
      type: String,
      required: true,
      select: false, // 🔐 never return password by default
    },

    refreshToken: {
      type: String,
      default: null,
      select: false, // 🔐 secure
    },

    lastPasswordChange: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    /* --- Administrative --- */
    officerInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
