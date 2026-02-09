import mongoose from 'mongoose';
const { Schema } = mongoose;

const GdCorrectionSchema = new Schema({
  // Link to the exact entry being fixed
  originalEntryId: { type: Schema.Types.ObjectId, required: true, index: true }, 
  dailyGDId: { type: Schema.Types.ObjectId, ref: 'GeneralDiary', required: true },

  // When did this happen?
  correctedAt: { type: Date, default: Date.now },

  // 1. The "Before" Snapshot (What was erased?)
  previousData: {
    abstract: String,
    details: String,
    signature: Object // Who signed the *old* version
  },

  // 2. The "After" Snapshot (What replaced it?)
  newData: {
    abstract: String,
    details: String
  },

  // 3. The Approval Chain (Strict Monitoring)
  reason: { type: String, required: true },
  
  requestedBy: {
    forceNumber: String, // e.g. IPF 
    name: String,
    rank: String
  },
  
  approvedBy: {
    forceNumber: String, // e.g. DSC
    name: String,
    rank: String,
    approvedAt: { type: Date, default: Date.now }
  }
});

export default mongoose.models.CorrectionLog || mongoose.model('GdCorrection', GdCorrectionSchema);