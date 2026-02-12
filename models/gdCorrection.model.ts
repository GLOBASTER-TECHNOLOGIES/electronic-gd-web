// gdCorrection.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/* =======================================
   1. INTERFACES (Type Definitions)
======================================= */
interface ISignatureSnapshot {
  officerId: mongoose.Types.ObjectId;
  officerName: string;
  rank: string;
  forceNumber: string;
  postCode: string;
  postName: string;
  signedAt: Date;
}

export interface ICorrectionLog extends Document {
  originalEntryId: mongoose.Types.ObjectId;
  dailyGDId: mongoose.Types.ObjectId;

  // Snapshot Context
  entryNo: number;
  postCode: string;
  diaryDate: Date;

  // Correction Meta
  correctedAt: Date;
  correctionType: "EDIT" | "DELETE" | "LATE_ENTRY";

  // History & Current Data
  previousData: {
    abstract?: string;
    details?: string;
    signature?: ISignatureSnapshot;
  };
  newData: {
    abstract?: string;
    details?: string;
  };

  // Approval Chain
  reason: string;
  requestedBy: {
    forceNumber: string;
    name: string;
    rank: string;
    officerId: mongoose.Types.ObjectId;
  };
  approvedBy: {
    forceNumber: string;
    name: string;
    rank: string;
    officerId: mongoose.Types.ObjectId;
    approvedAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

/* =======================================
   2. SCHEMA DEFINITION
======================================= */
const GdCorrectionSchema = new Schema<ICorrectionLog>(
  {
    /* ===== LINKS ===== */
    originalEntryId: { type: Schema.Types.ObjectId, required: true }, // Index removed here, handled manually below if needed, or kept simple
    dailyGDId: {
      type: Schema.Types.ObjectId,
      ref: "GeneralDiary",
      required: true,
    },

    /* ===== SNAPSHOT CONTEXT ===== */
    entryNo: { type: Number, required: true },
    postCode: { type: String, required: true }, // Index handled in compound index below
    diaryDate: { type: Date, required: true }, // Index handled in compound index below

    /* ===== CORRECTION META ===== */
    correctedAt: { type: Date, default: Date.now },
    correctionType: {
      type: String,
      enum: ["EDIT", "DELETE", "LATE_ENTRY"],
      default: "EDIT",
    },

    /* ===== 1. BEFORE (History) ===== */
    previousData: {
      abstract: String,
      details: String,
      signature: {
        officerId: { type: Schema.Types.ObjectId, ref: "Officer" },
        officerName: String,
        rank: String,
        forceNumber: String,
        postCode: String,
        postName: String,
        signedAt: Date,
      },
    },

    /* ===== 2. AFTER (Current) ===== */
    newData: {
      abstract: String,
      details: String,
    },

    /* ===== 3. APPROVAL CHAIN ===== */
    reason: { type: String, required: true, minlength: 5 },

    requestedBy: {
      forceNumber: { type: String, required: true },
      name: { type: String, required: true },
      rank: { type: String, required: true },
      officerId: {
        type: Schema.Types.ObjectId,
        ref: "Officer",
        required: true,
      },
    },

    approvedBy: {
      forceNumber: { type: String, required: true },
      name: { type: String, required: true },
      rank: { type: String, required: true },
      officerId: {
        type: Schema.Types.ObjectId,
        ref: "Officer",
        required: true,
      },
      approvedAt: { type: Date, required: true },
    },
  },
  { timestamps: true },
);

/* =======================================
   3. INDEXES (Critical for Performance)
======================================= */

// 1. DASHBOARD SEARCH (Most Common)
// "Show me all corrections for Post NDLS-MAIN on Feb 12th"
// This is the compound index you asked for.
GdCorrectionSchema.index({ postCode: 1, diaryDate: -1 });
// Note: -1 on date sorts by "Newest First" which is usually what you want in a log.

// 2. ENTRY HISTORY
// "Show me the history of Entry #5"
GdCorrectionSchema.index({ dailyGDId: 1, entryNo: 1 });

// 3. OFFICER AUDIT
// "Show me all corrections requested by Officer X"
GdCorrectionSchema.index({ "requestedBy.forceNumber": 1 });

// 4. LINK LOOKUP
// "Find the log for this specific original entry ID"
GdCorrectionSchema.index({ originalEntryId: 1 });

const GdCorrection: Model<ICorrectionLog> =
  mongoose.models.GdCorrection ||
  mongoose.model<ICorrectionLog>("GdCorrection", GdCorrectionSchema);

export default GdCorrection;
