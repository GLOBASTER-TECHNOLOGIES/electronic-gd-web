import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import GdCorrection from "@/models/gdCorrection.model";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();

    const {
      originalEntryId,
      dailyGDId,
      newData,
      reason,
      requestedBy,
      correctionType = "EDIT",
    } = body;

    /* ===============================
       1️⃣ VALIDATION
    =============================== */
    if (!originalEntryId || !dailyGDId)
      throw new Error("Missing entry reference.");

    if (!newData?.abstract || !newData?.details)
      throw new Error("New data is incomplete.");

    if (!reason || reason.length < 5)
      throw new Error("Reason must be at least 5 characters.");

    if (!requestedBy) {
      throw new Error("Authorization details (Requested By) are missing.");
    }

    /* ===============================
       2️⃣ FETCH GD & ENFORCE 34-HOUR LOCK
    =============================== */

    const gd = await GeneralDiary.findById(dailyGDId);
    if (!gd) throw new Error("General Diary not found.");

    // ✅ ENFORCE 34-HOUR RULE
    const now = new Date();
    const gdCreationTime = new Date(gd.createdAt); 
    const hoursSinceCreation = (now.getTime() - gdCreationTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 34) {
      throw new Error(
        `Time limit exceeded. Correction requests cannot be made after 34 hours. (This diary is currently ${Math.floor(hoursSinceCreation)} hours old).`
      );
    }

    // Now find the specific entry
    const entry = gd.entries.id(originalEntryId);
    if (!entry) throw new Error("Entry not found.");

    /* ===============================
       3️⃣ PREVENT MULTIPLE PENDING REQUESTS
    =============================== */

    const existingPending = await GdCorrection.findOne({
      dailyGDId: gd._id,
      history: {
        $elemMatch: {
          originalEntryId: originalEntryId,
          status: "PENDING",
        },
      },
    });

    if (existingPending) {
      throw new Error(
        "A pending correction request already exists for this entry. Please wait for admin review.",
      );
    }

    /* ===============================
       4️⃣ UPSERT CORRECTION REQUEST
    =============================== */

    const newLogEntry = {
      originalEntryId: entry._id,
      entryNo: entry.entryNo,
      correctionType,
      status: "PENDING",

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

      requestedBy: {
        forceNumber: requestedBy.forceNumber,
        name: requestedBy.name,
        rank: requestedBy.rank,
        officerId: new mongoose.Types.ObjectId(), // TODO: Replace with logged-in user ID
      },
    };

    // Find the container for this GD, or create it, and push the new log
    const correctionDoc = await GdCorrection.findOneAndUpdate(
      { dailyGDId: gd._id }, 
      {
        $setOnInsert: {
          postCode: gd.postCode,
          diaryDate: gd.diaryDate,
        },
        $push: { history: newLogEntry },
      },
      {
        new: true, 
        upsert: true, 
        runValidators: true,
      }
    );

    // Safe extraction: Won't crash if history is undefined on first creation
    const newlyAddedCorrectionId =
      correctionDoc?.history && correctionDoc.history.length > 0
        ? correctionDoc.history[correctionDoc.history.length - 1]._id
        : null;

    return NextResponse.json({
      success: true,
      message: "Correction request submitted successfully for admin approval.",
      correctionDocId: correctionDoc._id, 
      correctionLogId: newlyAddedCorrectionId, 
    });
  } catch (error: any) {
    console.log("Correction Request Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create correction request.",
      },
      { status: 500 }
    );
  }
}