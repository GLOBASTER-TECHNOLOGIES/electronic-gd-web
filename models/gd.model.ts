// gd.model.js (Improved & Scalable)
import mongoose from "mongoose";
const { Schema } = mongoose;

/* =========================
   ENTRY SUB-DOCUMENT
========================= */
const EntrySchema = new Schema(
  {
    entryNo: {
      type: Number,
      required: true, // Serial number within the GD
    },

    entryTime: {
      type: Date,
      required: true, // Actual time of entry
      default: Date.now,
    },

    abstract: {
      type: String,
      required: true,
      trim: true,
    },

    details: {
      type: String,
      required: true,
      trim: true, // Current valid text only
    },

    /* ===== SIGNATURE SNAPSHOT ===== */
    signature: {
      officerId: {
        type: Schema.Types.ObjectId,
        ref: "Officer",
        required: true,
      },
      officerName: String,
      rank: String,
      forceNumber: String,
      signedAt: {
        type: Date,
        default: Date.now,
      },
    },

    /* ===== CORRECTION FLAG ===== */
    isCorrected: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true, // Needed to link with CorrectionLog
  },
);

/* =========================
   GENERAL DIARY
========================= */
const GeneralDiarySchema = new Schema(
  {
    /* ===== LOCATION ===== */
    division: {
      type: String,
      required: true,
      trim: true,
    },

    post: {
      type: String,
      required: true,
      trim: true,
    },

    /* ===== DATE CONTROL ===== */
    diaryDate: {
      type: Date,
      required: true, // Represents the GD day (00:00–23:59)
      index: true,
    },

    pageSerialNo: {
      type: Number,
      required: true, // Physical register continuity
    },

    /* ===== ENTRIES ===== */
    entries: {
      type: [EntrySchema],
      default: [],
    },

    /* ===== STATUS & FREEZE CONTROL ===== */
    status: {
      type: String,
      enum: ["ACTIVE", "CORRECTION_WINDOW", "FROZEN"],
      default: "ACTIVE",
      index: true,
    },

    frozenAt: {
      type: Date,
      default: null,
    },

    frozenBy: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },

    /* ===== AUDIT ===== */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
    },

    lastEntryNo: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================
   INDEXES (IMPORTANT)
========================= */
// One GD per post per day
GeneralDiarySchema.index({ post: 1, diaryDate: 1 }, { unique: true });

export default mongoose.models.GeneralDiary ||
  mongoose.model("GeneralDiary", GeneralDiarySchema);
