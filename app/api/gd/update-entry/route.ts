import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import GdCorrection from "@/models/gdCorrection.model";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const body = await req.json();
    const {
      originalEntryId,
      dailyGDId,
      newData,
      reason,
      requestedBy,
      approvedBy,
    } = body;

    // 1. Fetch GD with session to lock the document
    const gd = await GeneralDiary.findById(dailyGDId).session(session);
    if (!gd) throw new Error("General Diary document not found.");

    // Find the specific entry sub-document
    const entry = gd.entries.id(originalEntryId);
    if (!entry) throw new Error("Specific entry not found.");

    // 2. Create Audit Log (Snapshotting the 'Before' state)
    const correctionLog = new GdCorrection({
      originalEntryId: entry._id,
      dailyGDId: gd._id,
      entryNo: entry.entryNo,
      postCode: gd.postCode,
      diaryDate: gd.diaryDate,
      previousData: {
        abstract: entry.abstract,
        details: entry.details,
        signature: entry.signature, // Capture historical signer
      },
      newData: {
        abstract: newData.abstract,
        details: newData.details,
      },
      reason,
      // Prototype logic: Assigning mock ObjectIds for manual inputs
      requestedBy: {
        ...requestedBy,
        officerId: new mongoose.Types.ObjectId(),
      },
      approvedBy: {
        ...approvedBy,
        officerId: new mongoose.Types.ObjectId(),
        approvedAt: new Date(),
      },
    });

    await correctionLog.save({ session });

    // 3. Update the Actual Entry AND the Parent Document
    // We update the entry text locally first
    entry.abstract = newData.abstract;
    entry.details = newData.details;
    entry.isCorrected = true; // Flag on the specific entry

    // ✅ NEW: Update the parent-level flags
    // hasCorrections: true tells us this day was modified
    // correctionCount: tracks how many times this day was edited
    gd.hasCorrections = true;
    if (typeof gd.correctionCount === "number") {
      gd.correctionCount += 1;
    } else {
      gd.correctionCount = 1;
    }

    // Save the parent GD (includes updated entry and flags)
    await gd.save({ session });

    // 4. Finalize Transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Entry updated, audit log created, and GD flagged.",
    });
  } catch (error: any) {
    // Abort only if the transaction is still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Update Transaction Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process correction.",
      },
      { status: 500 },
    );
  } finally {
    // End the session regardless of outcome
    await session.endSession();
  }
}
