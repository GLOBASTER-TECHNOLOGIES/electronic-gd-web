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

    /* ===============================
       2️⃣ FETCH GD + ENTRY
    =============================== */

    const gd = await GeneralDiary.findById(dailyGDId);
    if (!gd) throw new Error("General Diary not found.");

    const entry = gd.entries.id(originalEntryId);
    if (!entry) throw new Error("Entry not found.");

    /* ===============================
       3️⃣ PREVENT MULTIPLE PENDING REQUESTS
    =============================== */

    const existingPending = await GdCorrection.findOne({
      originalEntryId,
      status: "PENDING",
    });

    if (existingPending) {
      throw new Error("A pending correction request already exists.");
    }

    /* ===============================
       4️⃣ CREATE CORRECTION REQUEST
    =============================== */

    const correction = await GdCorrection.create({
      originalEntryId: entry._id,
      dailyGDId: gd._id,
      entryNo: entry.entryNo,
      postCode: gd.postCode,
      diaryDate: gd.diaryDate,

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
        officerId: new mongoose.Types.ObjectId(), // replace with real logged-in ID later
      },
    });

    return NextResponse.json({
      success: true,
      message: "Correction request submitted for admin approval.",
      correctionId: correction._id,
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