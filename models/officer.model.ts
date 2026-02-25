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

    // ✅ THE RELATIONAL LINK
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Links to your 'Post' model
      required: true,
      index: true, // Speeds up queries like "Find all officers in this Post"
    },

    // We keep these for easy display without needing .populate() every time
    postCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // unique: false, // Explicitly false (Multiple officers can be at one post)
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

    password: { type: String, required: true, select: false },
    refreshToken: { type: String, select: false, default: null },

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
