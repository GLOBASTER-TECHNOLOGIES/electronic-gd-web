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

  // Approval Status
  status: "PENDING" | "APPROVED" | "REJECTED";

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

  approvedBy?: {
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
    originalEntryId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    dailyGDId: {
      type: Schema.Types.ObjectId,
      ref: "GeneralDiary",
      required: true,
    },

    /* ===== SNAPSHOT CONTEXT ===== */
    entryNo: { type: Number, required: true },
    postCode: { type: String, required: true },
    diaryDate: { type: Date, required: true },

    /* ===== CORRECTION META ===== */
    correctedAt: { type: Date, default: Date.now },

    correctionType: {
      type: String,
      enum: ["EDIT", "DELETE", "LATE_ENTRY"],
      default: "EDIT",
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    /* ===== 1. BEFORE (History Snapshot) ===== */
    previousData: {
      abstract: String,
      details: String,
      signature: {
        officerId: { type: Schema.Types.ObjectId, ref: "Officer" },
        officerName: String,
        rank: String,
        forceNumber: String,
        postCode: String,
        signedAt: Date,
      },
    },

    /* ===== 2. AFTER (Requested Change) ===== */
    newData: {
      abstract: String,
      details: String,
    },

    /* ===== 3. APPROVAL CHAIN ===== */

    reason: {
      type: String,
      required: true,
      minlength: 5,
    },

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

    // Optional until admin processes request
    approvedBy: {
      forceNumber: { type: String },
      name: { type: String },
      rank: { type: String },
      officerId: {
        type: Schema.Types.ObjectId,
        ref: "Officer",
      },
      approvedAt: { type: Date },
    },
  },
  { timestamps: true }
);

/* =======================================
   3. INDEXES (Performance Critical)
======================================= */

// 1️⃣ Dashboard Search (Post + Date)
GdCorrectionSchema.index({ postCode: 1, diaryDate: -1 });

// 2️⃣ Entry History Lookup
GdCorrectionSchema.index({ dailyGDId: 1, entryNo: 1 });

// 3️⃣ Officer Audit Trail
GdCorrectionSchema.index({ "requestedBy.forceNumber": 1 });

// 4️⃣ Direct Entry Link Lookup
GdCorrectionSchema.index({ originalEntryId: 1 });

// 5️⃣ Status Filter (Admin Panel)
GdCorrectionSchema.index({ status: 1 });

/* =======================================
   4. MODEL EXPORT
======================================= */

const GdCorrection: Model<ICorrectionLog> =
  mongoose.models.GdCorrection ||
  mongoose.model<ICorrectionLog>("GdCorrection", GdCorrectionSchema);

export default GdCorrection;