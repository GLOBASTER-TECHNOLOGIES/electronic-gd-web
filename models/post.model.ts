import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
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

    contactNumber: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    lastPasswordChange: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    // ✅ NEW SECURITY FIELDS
    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    passwordResetByAdminAt: {
      type: Date,
      default: null,
    },

    officerInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);