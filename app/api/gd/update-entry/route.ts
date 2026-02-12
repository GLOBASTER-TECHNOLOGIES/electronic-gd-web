import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import GeneralDiary from "@/models/gd.model"; // Adjust path
import GdCorrection from "@/models/gdCorrection.model"; // Adjust path
import dbConnect from "@/config/dbConnect";

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();

    // 1. Parse Payload
    const body = await req.json();
    const {
      originalEntryId,
      dailyGDId,
      newData,
      reason,
      requestedBy, // From your Prototype Manual Input
      approvedBy, // From your Prototype Manual Input
    } = body;

    // 2. Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(originalEntryId) ||
      !mongoose.Types.ObjectId.isValid(dailyGDId)
    ) {
      throw new Error("Invalid ID format provided.");
    }

    // 3. Fetch the Original GD Document (Lock it for this transaction)
    const gd = await GeneralDiary.findOne({
      _id: dailyGDId,
      "entries._id": originalEntryId,
    }).session(session);

    if (!gd) {
      throw new Error("General Diary or Entry not found.");
    }

    // 4. Extract the Specific Entry (The "Before" State)
    const entry = gd.entries.id(originalEntryId);
    if (!entry) throw new Error("Entry sub-document not found.");

    // 5. Create the Correction Log (The Audit Trail)
    // We create this FIRST. If this fails, we don't touch the GD.
    const correctionLog = new GdCorrection({
      originalEntryId: entry._id,
      dailyGDId: gd._id,

      // Snapshot Context (Copied from parent GD)
      entryNo: entry.entryNo,
      postCode: gd.postCode, // Critical for indexing
      diaryDate: gd.diaryDate, // Critical for indexing

      correctionType: "EDIT",

      // 1. HISTORY (The Snapshot)
      previousData: {
        abstract: entry.abstract,
        details: entry.details,
        signature: {
          officerName: entry.signature.officerName,
          rank: entry.signature.rank,
          forceNumber: entry.signature.forceNumber,
          postCode: gd.postCode,
          postName: gd.postName,
          signedAt: entry.signature.signedAt || entry.entryTime,
        },
      },

      // 2. NEW DATA
      newData: {
        abstract: newData.abstract,
        details: newData.details,
      },

      // 3. APPROVAL CHAIN (Mapped from your Manual Prototype Inputs)
      reason: reason,

      requestedBy: {
        name: requestedBy.name,
        rank: requestedBy.rank,
        forceNumber: requestedBy.forceNumber,
        // In prototype, if officerId is "MOCK...", generate a real one to satisfy Schema
        officerId: mongoose.Types.ObjectId.isValid(requestedBy.officerId)
          ? requestedBy.officerId
          : new mongoose.Types.ObjectId(),
      },

      approvedBy: {
        name: approvedBy.name,
        rank: approvedBy.rank,
        forceNumber: approvedBy.forceNumber,
        // In prototype, generate real ID if needed
        officerId: mongoose.Types.ObjectId.isValid(approvedBy.officerId)
          ? approvedBy.officerId
          : new mongoose.Types.ObjectId(),
        approvedAt: new Date(),
      },
    });

    await correctionLog.save({ session });

    // 6. Update the Actual GD Entry (The Live Data)
    entry.abstract = newData.abstract;
    entry.details = newData.details;
    entry.isCorrected = true; // Flips the flag in UI to show [HISTORY] button

    // Optional: You might want to track who updated it in the entry itself,
    // but usually the Log is enough.

    await gd.save({ session });

    // 7. Commit the Transaction (Make it permanent)
    await session.commitTransaction();

    return NextResponse.json(
      {
        success: true,
        message: "GD Corrected and Audit Log Signed.",
        logId: correctionLog._id,
      },
      { status: 200 },
    );
  } catch (error: any) {
    // 8. Rollback (Undo everything if error)
    await session.abortTransaction();
    console.error("Correction Transaction Failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  } finally {
    session.endSession();
  }
}
