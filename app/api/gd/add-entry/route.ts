import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import mongoose from "mongoose";

/* =========================
   Helper: True IST Midnight
========================= */
function normalizeDiaryDate(date = new Date()) {
  const now = date.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now + istOffset);
  istTime.setUTCHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset);
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      division,
      post,
      abstract,
      details,
      officerId,
      officerName,
      rank,
      forceNumber,
      timeOfSubmission,
    } = await request.json();

    // 1. Validation
    if (
      !division ||
      !post ||
      !abstract ||
      !details ||
      !officerId ||
      !timeOfSubmission
    ) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 },
      );
    }

    const today = normalizeDiaryDate();

    // 2. Find Existing GD
    const gd = await GeneralDiary.findOne({ post, diaryDate: today });

    // 🛑 STOP: If GD doesn't exist, fail immediately.
    if (!gd) {
      return NextResponse.json(
        {
          message:
            "General Diary for today has not been opened yet. Please open the GD first.",
        },
        { status: 404 },
      );
    }

    // 3. Add Entry (Only if GD exists)
    const nextEntryNo = (gd.lastEntryNo || 0) + 1;

    const entry = {
      entryNo: nextEntryNo,
      entryTime: new Date(),
      timeOfSubmission: new Date(timeOfSubmission),
      abstract,
      details,
      signature: {
        officerId: new mongoose.Types.ObjectId(officerId),
        officerName,
        rank,
        forceNumber,
        post: post, // Saved correctly
        signedAt: new Date(),
      },
    };

    gd.entries.push(entry);
    gd.lastEntryNo = nextEntryNo;

    await gd.save();

    return NextResponse.json(
      { message: "GD entry added successfully", entryNo: nextEntryNo },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("GD Entry Error:", error);

    if (error.name === "VersionError") {
      return NextResponse.json(
        { message: "Concurrency conflict. Please try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
