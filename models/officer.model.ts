// models/officer.model.ts
import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    /* =========================
       OFFICIAL IDENTITY
    ========================== */
    forceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    rank: {
      type: String,
      required: true,
      enum: [
        "ADMIN",
        "Constable",
        "Head Constable",
        "ASI",
        "SI",
        "IPF",
        "ASC",
        "Sr.DSC",
      ],
    },

    /* =========================
       POSTING DETAILS (LINKED)
    ========================== */
    railwayZone: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    postCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    /* =========================
       CONTACT & AUTH
    ========================== */
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
      default: null,
    },

    /* =========================
       PASSWORD SECURITY CONTROL
    ========================== */

    // 🔐 Force officer to change password on next login
    mustChangePassword: {
      type: Boolean,
      default: true, // ✅ New officers must change password
    },

    // 🕒 Track when password last changed
    lastPasswordChange: {
      type: Date,
      default: null,
    },

    // 🛠 Track admin reset event
    passwordResetByAdminAt: {
      type: Date,
      default: null,
    },

    // 📅 Track login activity
    lastLoginAt: {
      type: Date,
      default: null,
    },

    /* =========================
       AUDIT
    ========================== */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Officer ||
  mongoose.model("Officer", officerSchema);
