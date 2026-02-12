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
    const { originalEntryId, dailyGDId, newData, reason, requestedBy, approvedBy } = body;

    // 1. Fetch GD with session
    const gd = await GeneralDiary.findById(dailyGDId).session(session);
    if (!gd) throw new Error("General Diary document not found.");

    const entry = gd.entries.id(originalEntryId);
    if (!entry) throw new Error("Specific entry not found.");

    // 2. Create Audit Log
    const correctionLog = new GdCorrection({
      originalEntryId: entry._id,
      dailyGDId: gd._id,
      entryNo: entry.entryNo,
      postCode: gd.postCode,
      diaryDate: gd.diaryDate,
      previousData: {
        abstract: entry.abstract,
        details: entry.details,
        signature: entry.signature // Snapshot of who signed the bad version
      },
      newData: {
        abstract: newData.abstract,
        details: newData.details
      },
      reason,
      requestedBy: { ...requestedBy, officerId: new mongoose.Types.ObjectId() },
      approvedBy: { ...approvedBy, officerId: new mongoose.Types.ObjectId(), approvedAt: new Date() }
    });

    await correctionLog.save({ session });

    // 3. Update the Actual Entry
    entry.abstract = newData.abstract;
    entry.details = newData.details;
    entry.isCorrected = true;

    await gd.save({ session });

    // 4. Finalize
    await session.commitTransaction();
    return NextResponse.json({ success: true, message: "Entry updated and logged." });

  } catch (error: any) {
    // ✅ Check if transaction is active before aborting
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Update Transaction Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await session.endSession();
  }
}