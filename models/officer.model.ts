import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    forceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true, // RPF Force No / Belt No
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

    appRole: {
      type: String,
      required: true,
      enum: ["STAFF", "SO", "IPF", "DSC"],
      index: true,
    },

    railwayZone: {
      type: String,
      required: true,
      trim: true, // eg: SR, ER, CR
    },

    division: {
      type: String,
      required: true,
      trim: true, // eg: TVC Division
    },

    postName: {
      type: String,
      required: true,
      trim: true, // RPF Post / Outpost
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // never return password
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null, // IPF / DSC who created this officer
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

export default mongoose.model("Officer", officerSchema);
