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
        "Inspector",
        "IPF",
        "DSC",
        "Sr.DSC",
      ],
    },

    /* =========================
       APPLICATION ROLE
    ========================== */
    appRole: {
      type: String,
      required: true,
      enum: ["ADMIN", "STAFF", "SO", "IPF", "DSC"],
      index: true,
    },

    /* =========================
       POSTING DETAILS
    ========================== */
    railwayZone: {
      type: String,
      required: true,
      trim: true,
    },

    division: {
      type: String,
      required: true,
      trim: true,
    },

    postName: {
      type: String,
      required: true,
      trim: true,
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

    lastPasswordChange: {
      type: Date,
      default: null,
    },

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
  {
    timestamps: true,
  },
);

export default mongoose.models.Officer ||
  mongoose.model("Officer", officerSchema);
