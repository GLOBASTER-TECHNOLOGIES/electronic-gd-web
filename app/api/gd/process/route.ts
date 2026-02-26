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
    
    // 1. Cleaned up destructuring
    const { action, containerId, logId, dailyGDId, originalEntryId } = body;

    // 2. Validate payload
    if (!["APPROVE", "REJECT"].includes(action)) {
      throw new Error("Invalid action. Must be APPROVE or REJECT.");
    }
    if (!containerId || !logId || !dailyGDId || !originalEntryId) {
      throw new Error("Missing required IDs to process request.");
    }

    // 3. Fetch the Correction Container
    const correctionDoc = await GdCorrection.findById(containerId).session(session);
    if (!correctionDoc) throw new Error("Correction document not found.");

    // ✅ 4. FIX: Use standard JavaScript .find() instead of Mongoose .id()
    const logEntry = correctionDoc.history.find(
      (entry: any) => entry._id.toString() === logId
    );
    
    if (!logEntry) throw new Error("Specific correction request not found.");

    if (logEntry.status !== "PENDING") {
      throw new Error(`This request has already been processed (${logEntry.status}).`);
    }

    // 5. Update the Audit Log Status ONLY
    logEntry.status = action === "APPROVE" ? "APPROVED" : "REJECTED";

    // Save the container update
    await correctionDoc.save({ session });

    // 6. IF APPROVED: Update the actual General Diary Document
    if (action === "APPROVE") {
      const gd = await GeneralDiary.findById(dailyGDId).session(session);
      if (!gd) throw new Error("General Diary not found.");

      // ✅ FIX: Use standard JavaScript .find() here as well
      const gdEntry = gd.entries.find(
        (entry: any) => entry._id.toString() === originalEntryId
      );
      
      if (!gdEntry) throw new Error("Original GD Entry not found.");

      // Overwrite the original text with the new data stored in the log
      gdEntry.abstract = logEntry.newData.abstract;
      gdEntry.details = logEntry.newData.details;
      gdEntry.isCorrected = true;

      // Flag the parent document
      gd.hasCorrections = true;
      gd.correctionCount = (typeof gd.correctionCount === "number" ? gd.correctionCount : 0) + 1;

      await gd.save({ session });
    }

    // 7. Commit Transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: `Correction successfully ${action.toLowerCase()}d.`,
    });

  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Processing Transaction Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process correction." },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}