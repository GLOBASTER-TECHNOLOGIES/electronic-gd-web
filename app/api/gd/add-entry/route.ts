import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

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

    /* =========================
       🔐 1️⃣ Validate Post Session (MANDATORY)
    ========================= */
    const postToken = request.cookies.get("postAccessToken")?.value;

    if (!postToken) {
      return NextResponse.json(
        { message: "Post session required" },
        { status: 401 }
      );
    }

    let postPayload: any;
    try {
      postPayload = jwt.verify(
        postToken,
        process.env.JWT_ACCESS_SECRET!
      );
    } catch {
      return NextResponse.json(
        { message: "Invalid post session" },
        { status: 401 }
      );
    }

    /* =========================
       🔐 2️⃣ Check Visiting Session (OPTIONAL)
    ========================= */
    const visitingToken =
      request.cookies.get("visitingAccessToken")?.value;

    let visitingPayload: any = null;

    if (visitingToken) {
      try {
        visitingPayload = jwt.verify(
          visitingToken,
          process.env.JWT_VISITING_SECRET!
        );
      } catch {
        return NextResponse.json(
          { message: "Invalid visiting session" },
          { status: 401 }
        );
      }
    }

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

    // 3. Validation
    if (
      !division ||
      !post ||
      !abstract ||
      !details ||
      !timeOfSubmission
    ) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    const today = normalizeDiaryDate();

    // 4. Find Existing GD
    const gd = await GeneralDiary.findOne({ post, diaryDate: today });

    if (!gd) {
      return NextResponse.json(
        {
          message:
            "General Diary for today has not been opened yet. Please open the GD first.",
        },
        { status: 404 }
      );
    }

    const nextEntryNo = (gd.lastEntryNo || 0) + 1;

    /* =========================
       🧠 5️⃣ Determine Signature Source
    ========================= */
    let finalOfficerId = officerId;
    let finalOfficerName = officerName;
    let finalRank = rank;
    let finalForceNumber = forceNumber;

    // 🔥 If visiting session exists → override everything
    if (visitingPayload) {
      finalOfficerId = visitingPayload.id;
      finalOfficerName = visitingPayload.officerName;
      finalRank = visitingPayload.rank;
      finalForceNumber = visitingPayload.forceNumber;
    }

    const entry = {
      entryNo: nextEntryNo,
      entryTime: new Date(),
      timeOfSubmission: new Date(timeOfSubmission),
      abstract,
      details,
      signature: {
        officerId: new mongoose.Types.ObjectId(finalOfficerId),
        officerName: finalOfficerName,
        rank: finalRank,
        forceNumber: finalForceNumber,
        post: post,
        signedAt: new Date(),
      },
    };

    gd.entries.push(entry);
    gd.lastEntryNo = nextEntryNo;

    await gd.save();

    return NextResponse.json(
      { message: "GD entry added successfully", entryNo: nextEntryNo },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("GD Entry Error:", error);

    if (error.name === "VersionError") {
      return NextResponse.json(
        { message: "Concurrency conflict. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
