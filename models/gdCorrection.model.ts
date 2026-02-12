// gdCorrection.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/* =======================================
   1. INTERFACES (Type Definitions)
======================================= */

// A snapshot of the officer's details at the moment of action
interface ISignatureSnapshot {
  officerId: mongoose.Types.ObjectId;
  officerName: string;
  rank: string;
  forceNumber: string;
  postCode: string;
  postName: string;
  signedAt: Date;
}

// The main Correction Log Document interface
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

  // 1. BEFORE (History)
  previousData: {
    abstract?: string;
    details?: string;
    signature?: ISignatureSnapshot; // <--- NOW CORRECTLY LINKED
  };

  // 2. AFTER (Current)
  newData: {
    abstract?: string;
    details?: string;
  };

  // 3. APPROVAL CHAIN
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

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/* =======================================
   2. SCHEMA DEFINITION
======================================= */

const GdCorrectionSchema = new Schema<ICorrectionLog>(
  {
    /* ===== LINKS ===== */
    originalEntryId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    dailyGDId: {
      type: Schema.Types.ObjectId,
      ref: "GeneralDiary",
      required: true,
    },

    /* ===== SNAPSHOT CONTEXT ===== */
    entryNo: { type: Number, required: true },
    postCode: { type: String, required: true, index: true },
    diaryDate: { type: Date, required: true },

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
   3. INDEXES & EXPORT
======================================= */

// Timeline Index: "Show history for Entry #5 in GD A100"
GdCorrectionSchema.index({ dailyGDId: 1, entryNo: 1 });

// Audit Index: "Show all corrections by Officer X"
GdCorrectionSchema.index({ "requestedBy.forceNumber": 1 });

// Prevent recompilation error in Next.js/Serverless
const GdCorrection: Model<ICorrectionLog> =
  mongoose.models.GdCorrection ||
  mongoose.model<ICorrectionLog>("GdCorrection", GdCorrectionSchema);

export default GdCorrection;
