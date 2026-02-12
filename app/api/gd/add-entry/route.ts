import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/* =========================
   Helper: Get Start/End of Day (IST)
========================= */
function getISTDayRange() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  istTime.setUTCHours(0, 0, 0, 0); 
  
  const startOfDay = new Date(istTime.getTime() - istOffset);
  const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);

  return { startOfDay, endOfDay };
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    /* ==========================================
       🔐 1. Authentication & Token Parsing
    ========================================== */
    const postToken = request.cookies.get("postAccessToken")?.value;
    const officerToken = request.cookies.get("accessToken")?.value;
    const visitingToken = request.cookies.get("visitingAccessToken")?.value;

    if (!postToken && !officerToken) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    let primaryPayload: any = null;
    let actorType = "OFFICER";

    if (postToken) {
      try {
        primaryPayload = jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
        actorType = "POST";
      } catch { return NextResponse.json({ message: "Invalid Post Token" }, { status: 401 }); }
    } else {
      try {
        primaryPayload = jwt.verify(officerToken!, process.env.JWT_ACCESS_SECRET!);
        actorType = "OFFICER";
      } catch { return NextResponse.json({ message: "Invalid Officer Token" }, { status: 401 }); }
    }

    let visitingPayload: any = null;
    if (visitingToken) {
      try {
        visitingPayload = jwt.verify(visitingToken, process.env.JWT_VISITING_SECRET!);
      } catch { /* Ignored */ }
    }

    /* ==========================================
       🏢 2. Fetch Post Context
    ========================================== */
    let postDoc = null;
    const targetObjectId = actorType === "POST" ? primaryPayload.id : null;

    if (targetObjectId) {
      postDoc = await Post.findById(targetObjectId);
    } else {
      const officerDoc = await Officer.findById(primaryPayload.id);
      if (!officerDoc) return NextResponse.json({ message: "Officer not found" }, { status: 404 });
      
      const postId = officerDoc.presentPosting || officerDoc.postId || officerDoc.post;
      if (postId) postDoc = await Post.findById(postId);
      else if (officerDoc.postCode) postDoc = await Post.findOne({ postCode: officerDoc.postCode });
    }

    if (!postDoc) return NextResponse.json({ message: "No Post assigned" }, { status: 400 });

    const targetPostCode = postDoc.postCode || postDoc.code;
    const targetPostName = postDoc.postName || postDoc.name;
    const targetPostId = postDoc._id;

    /* ==========================================
       📦 3. Prepare Entry Data
    ========================================== */
    const body = await request.json();
    const { division, abstract, details, timeOfSubmission } = body;

    let signature = {
      officerId: body.officerId || primaryPayload.id,
      officerName: body.officerName || primaryPayload.name,
      rank: body.rank || primaryPayload.rank,
      forceNumber: body.forceNumber || primaryPayload.forceNumber,
      postCode: targetPostCode,
      postName: targetPostName,
      signedAt: new Date(),
    };

    if (visitingPayload) {
      signature = {
        ...signature,
        officerId: visitingPayload.id,
        officerName: visitingPayload.officerName,
        rank: visitingPayload.rank,
        forceNumber: visitingPayload.forceNumber,
      };
    }

    /* ==========================================
       🔄 4. LOGIC: Find or Create
    ========================================== */
    const { startOfDay, endOfDay } = getISTDayRange();

    const createEntryObject = (entryNo: number) => ({
      entryNo,
      entryTime: new Date(),
      timeOfSubmission: new Date(timeOfSubmission),
      abstract,
      details,
      signature,
      isCorrected: false
    });

    let gd = await GeneralDiary.findOne({
      postCode: targetPostCode, 
      diaryDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (gd) {
      const nextEntryNo = (gd.lastEntryNo || 0) + 1;
      gd.entries.push(createEntryObject(nextEntryNo));
      gd.lastEntryNo = nextEntryNo;
      await gd.save();
      return NextResponse.json({ success: true, message: "Entry added", entryNo: nextEntryNo });
    }

    // STEP B: Create New GD (Serial No removed)
    try {
      gd = await GeneralDiary.create({
        postId: targetPostId,
        postCode: targetPostCode,
        postName: targetPostName,
        division: division || primaryPayload.division || postDoc.division || "N/A",
        diaryDate: startOfDay, 
        entries: [createEntryObject(1)],
        lastEntryNo: 1,
        createdBy: new mongoose.Types.ObjectId(primaryPayload.id),
        // ✅ pageSerialNo is omitted here so it defaults to undefined/null
      });

      return NextResponse.json({ success: true, message: "New GD Created", entryNo: 1 }, { status: 201 });

    } catch (createError: any) {
      if (createError.code === 11000) {
        gd = await GeneralDiary.findOne({
           postCode: targetPostCode,
           diaryDate: { $gte: startOfDay, $lte: endOfDay },
        });

        if (gd) {
           const nextEntryNo = (gd.lastEntryNo || 0) + 1;
           gd.entries.push(createEntryObject(nextEntryNo));
           gd.lastEntryNo = nextEntryNo;
           await gd.save();
           return NextResponse.json({ success: true, message: "Entry added (Recovered)", entryNo: nextEntryNo });
        }
      }
      throw createError;
    }

  } catch (error: any) {
    console.error("GD Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}