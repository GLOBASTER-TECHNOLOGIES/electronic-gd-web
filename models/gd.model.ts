// gd.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/* =========================
   ENTRY SUB-DOCUMENT
========================= */
const EntrySchema = new Schema(
  {
    entryNo: { type: Number, required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    timeOfSubmission: { type: Date, required: true },
    abstract: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },

    /* ===== SIGNATURE SNAPSHOT ===== */
    // Snapshots the officer AND the post details at the moment of signing
    signature: {
      officerId: {
        type: Schema.Types.ObjectId,
        ref: "Officer",
        required: true,
      },
      officerName: { type: String, required: true },
      rank: { type: String, required: true },
      forceNumber: { type: String, required: true },

      // ✅ STORE BOTH HERE TOO (For historical accuracy)
      postCode: { type: String, required: true },
      postName: { type: String, required: true },

      signedAt: { type: Date, default: Date.now },
    },

    isCorrected: { type: Boolean, default: false },
  },
  { _id: true },
);

/* =========================
   GENERAL DIARY
========================= */
const GeneralDiarySchema = new Schema(
  {
    /* ===== LOCATION IDENTIFIERS ===== */
    division: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ THE LOGICAL ID (Use this for searching)
    postCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // e.g., "NDLS-MAIN"
      index: true,
    },

    // ✅ THE DISPLAY NAME (Use this for UI)
    postName: {
      type: String,
      required: true,
      trim: true,
    },

    /* ===== DATE CONTROL ===== */
    diaryDate: {
      type: Date,
      required: true,
      index: true,
    },

    pageSerialNo: {
      type: Number,
      unique: true, // Enforces uniqueness for numbers like 101, 102...
      sparse: true, // ✅ ALLOWS multiple documents to be null/undefined
      default: undefined, // undefined is safer than null for sparse indexes
    },

    entries: { type: [EntrySchema], default: [] },

    status: {
      type: String,
      enum: ["ACTIVE", "CORRECTION_WINDOW", "FROZEN"],
      default: "ACTIVE",
      index: true,
    },

    hasCorrections: {
      type: Boolean,
      default: false,
    },

    // ✅ Tracks the total number of corrections made to this day's diary
    correctionCount: {
      type: Number,
      default: 0,
    },

    frozenAt: { type: Date, default: null },
    frozenBy: { type: Schema.Types.ObjectId, ref: "Officer", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Officer", required: true },
    lastEntryNo: { type: Number, default: 0 },
  },
  { timestamps: true },
);

/* =========================
   INDEXES (CRITICAL UPDATE)
========================= */
// ✅ Enforce uniqueness based on POST CODE + DATE
// This prevents two GDs for "NDLS-MAIN" on the same day.
GeneralDiarySchema.index({ postCode: 1, diaryDate: 1 }, { unique: true });

export default mongoose.models.GeneralDiary ||
  mongoose.model("GeneralDiary", GeneralDiarySchema);
