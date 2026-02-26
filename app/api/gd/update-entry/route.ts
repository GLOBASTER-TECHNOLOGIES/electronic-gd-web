import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import GdCorrection from "@/models/gdCorrection.model";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const body = await req.json();
    
    // ✅ 1. Cleaned up destructuring (removed forwardedBy/approvedBy)
    const {
      originalEntryId,
      dailyGDId,
      newData,
      reason,
      requestedBy,
      correctionType = "EDIT"
    } = body;

    // ✅ 2. Fixed Validation (No more ReferenceError crashes)
    if (!originalEntryId || !dailyGDId) {
      throw new Error("Missing entry or diary reference.");
    }
    if (!requestedBy) {
      throw new Error("Missing authorization details (Requested by).");
    }

    // 3. Fetch GD with session to lock the document
    const gd = await GeneralDiary.findById(dailyGDId).session(session);
    if (!gd) throw new Error("General Diary document not found.");

    // ✅ 4. Re-added the 34-Hour Time Lock Validation
    const now = new Date();
    const gdCreationTime = new Date(gd.createdAt); 
    const hoursSinceCreation = (now.getTime() - gdCreationTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 34) {
      throw new Error(
        `Time limit exceeded. Entries cannot be directly edited after 34 hours. (GD is currently ${Math.floor(hoursSinceCreation)} hours old).`
      );
    }

    // Find the specific entry sub-document
    const entry = gd.entries.id(originalEntryId);
    if (!entry) throw new Error("Specific entry not found.");

    // 5. Prepare the new Correction Log Array Item
    const newLogEntry = {
      originalEntryId: entry._id,
      entryNo: entry.entryNo,
      correctionType,
      status: "APPROVED", // Auto-approved for direct edits
      previousData: {
        abstract: entry.abstract,
        details: entry.details,
        signature: entry.signature, 
      },
      newData: {
        abstract: newData.abstract,
        details: newData.details,
      },
      reason,
      
      // ✅ 6. Cleaned up authorization (matches your updated schema)
      requestedBy: {
        ...requestedBy,
        officerId: new mongoose.Types.ObjectId(), // TODO: Replace with real ID
      }
    };

    // 7. Upsert the Audit Log (Push into the array)
    await GdCorrection.findOneAndUpdate(
      { dailyGDId: gd._id },
      {
        $setOnInsert: {
          postCode: gd.postCode,
          diaryDate: gd.diaryDate,
        },
        $push: { history: newLogEntry }
      },
      { 
        upsert: true, 
        session,       
        new: true, 
        runValidators: true 
      }
    );

    // 8. Update the Actual Entry AND the Parent Document
    entry.abstract = newData.abstract;
    entry.details = newData.details;
    entry.isCorrected = true; 

    // Update parent-level flags
    gd.hasCorrections = true;
    gd.correctionCount = (typeof gd.correctionCount === "number" ? gd.correctionCount : 0) + 1;

    // Save the parent GD (includes updated entry and flags)
    await gd.save({ session });

    // 9. Finalize Transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Entry updated, audit log saved, and GD flagged.",
    });
  } catch (error: any) {
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
    await session.endSession();
  }
}