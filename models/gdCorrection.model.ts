import mongoose, { Schema, Document, Model } from "mongoose";

/* =======================================
   1. INTERFACES (Type Definitions)
======================================= */

export interface ISignatureSnapshot {
  officerId: mongoose.Types.ObjectId;
  officerName: string;
  rank: string;
  forceNumber: string;
  postCode: string;
  signedAt: Date;
}

// Interface for a single correction request/log
export interface ICorrectionLogEntry {
  _id?: mongoose.Types.ObjectId;
  originalEntryId: mongoose.Types.ObjectId;
  entryNo: number;

  correctionType: "EDIT" | "DELETE" | "LATE_ENTRY";
  status: "PENDING" | "APPROVED" | "REJECTED";

  previousData: {
    abstract?: string;
    details?: string;
    signature?: ISignatureSnapshot;
  };

  newData: {
    abstract?: string;
    details?: string;
  };

  reason: string;

  requestedBy: {
    forceNumber: string;
    name: string;
    rank: string;
    officerId: mongoose.Types.ObjectId;
  };

  correctedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for the main document holding the array
export interface IGdCorrection extends Document {
  dailyGDId: mongoose.Types.ObjectId;
  postCode: string;
  diaryDate: Date;
  history: ICorrectionLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/* =======================================
   2. SUB-DOCUMENT SCHEMA (The Array Items)
======================================= */

const CorrectionLogEntrySchema = new Schema<ICorrectionLogEntry>(
  {
    originalEntryId: { type: Schema.Types.ObjectId, required: true },
    entryNo: { type: Number, required: true },

    correctionType: {
      type: String,
      enum: ["EDIT", "DELETE", "LATE_ENTRY"],
      default: "EDIT",
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

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

    newData: {
      abstract: String,
      details: String,
    },

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

    correctedAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: true }, // Keeps track of when the specific request was made/updated
);

/* =======================================
   3. MAIN DOCUMENT SCHEMA (The Container)
======================================= */

const GdCorrectionSchema = new Schema<IGdCorrection>(
  {
    dailyGDId: {
      type: Schema.Types.ObjectId,
      ref: "GeneralDiary",
      required: true,
      unique: true, // ✅ Ensures only ONE correction document per daily GD
    },

    postCode: { type: String, required: true },
    diaryDate: { type: Date, required: true },

    // ✅ THE ARRAY: Keeps all corrections for this GD in one place
    history: { type: [CorrectionLogEntrySchema], default: [] },
  },
  { timestamps: true },
);

/* =======================================
   4. INDEXES (Critical for nested arrays)
======================================= */

// 1️⃣ Find the correction container by post and date quickly
GdCorrectionSchema.index({ postCode: 1, diaryDate: -1 });

// 2️⃣ Quick lookup to see if a specific entry has a correction pending/approved
GdCorrectionSchema.index({ "history.originalEntryId": 1 });

// 3️⃣ Status Filter (Admin Panel) - Finds documents that contain pending corrections
GdCorrectionSchema.index({ "history.status": 1 });

// 4️⃣ Officer Audit Trail - Finds all corrections requested by a specific officer
GdCorrectionSchema.index({ "history.requestedBy.forceNumber": 1 });

/* =======================================
   5. MODEL EXPORT
======================================= */

const GdCorrection: Model<IGdCorrection> =
  mongoose.models.GdCorrection ||
  mongoose.model<IGdCorrection>("GdCorrection", GdCorrectionSchema);

export default GdCorrection;
