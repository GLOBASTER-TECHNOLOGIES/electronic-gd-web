import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    /* ==========================================
       🔐 1. Token Extraction
    ========================================== */
    const postToken = request.cookies.get("postAccessToken")?.value;
    const postRefresh = request.cookies.get("postRefreshToken")?.value;
    const officerToken = request.cookies.get("officerAccessToken")?.value;
    const visitingToken = request.cookies.get("visitingAccessToken")?.value;

    let signaturePayload: any = null;
    let actorType: "POST" | "OFFICER" = "OFFICER";
    let primaryPayload: any = null;

    /* ==========================================
       🛡️ 2. Dual-Case Logic Enforcement
    ========================================== */
    
    // CASE A: VISITING OFFICER (Station Context)
    if (postToken && postRefresh && visitingToken) {
      try {
        primaryPayload = jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
        signaturePayload = jwt.verify(visitingToken, process.env.JWT_VISITING_SECRET!);
        actorType = "POST";
      } catch (err) {
        return NextResponse.json({ message: "Station or Visiting session expired." }, { status: 401 });
      }
    } 
    // CASE B: NATIVE OFFICER (Individual Context)
    else if (officerToken && !visitingToken) {
      try {
        primaryPayload = jwt.verify(officerToken, process.env.JWT_ACCESS_SECRET!);
        
        // Fetch fresh details from DB to ensure Rank/Name are current
        const officerDoc = await Officer.findById(primaryPayload.id);
        if (!officerDoc) return NextResponse.json({ message: "Officer not found" }, { status: 404 });

        signaturePayload = {
          id: officerDoc._id,
          officerName: officerDoc.name,
          rank: officerDoc.rank,
          forceNumber: officerDoc.forceNumber,
        };
        actorType = "OFFICER";
      } catch (err) {
        return NextResponse.json({ message: "Officer session expired." }, { status: 401 });
      }
    }
    else {
      return NextResponse.json({ message: "Access Denied: Invalid token combination." }, { status: 403 });
    }

    /* ==========================================
       🏢 3. Fetch Post Context (Using postCode only)
    ========================================== */
    let postDoc = null;
    if (actorType === "POST") {
      postDoc = await Post.findById(primaryPayload.id);
    } else {
      const officerDoc = await Officer.findById(primaryPayload.id);
      // Fallback search: Link by postCode as primary identifier
      postDoc = await Post.findOne({ postCode: officerDoc.postCode });
    }

    if (!postDoc) return NextResponse.json({ message: "Station terminal not found." }, { status: 400 });

    const targetPostCode = postDoc.postCode; 
    const targetPostName = postDoc.postName;

    /* ==========================================
       📦 4. Save Entry
    ========================================== */
    const body = await request.json();
    const { abstract, details, timeOfSubmission, division } = body;

    const signature = {
      officerId: signaturePayload.id,
      officerName: signaturePayload.officerName || signaturePayload.name,
      rank: signaturePayload.rank,
      forceNumber: signaturePayload.forceNumber,
      postCode: targetPostCode, // Required by Schema
      postName: targetPostName, // Required by Schema
      signedAt: new Date(),
    };

    const entry = {
      entryNo: 0, 
      entryTime: new Date(),
      timeOfSubmission: new Date(timeOfSubmission),
      abstract,
      details,
      signature,
    };

    // IST Date snap to midnight
    const istDate = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
    istDate.setUTCHours(0, 0, 0, 0);
    const startOfDay = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);

    // ✅ FIXED: Removed postId from $setOnInsert
    const gd = await GeneralDiary.findOneAndUpdate(
      { postCode: targetPostCode, diaryDate: startOfDay },
      { 
        $inc: { lastEntryNo: 1 },
        $setOnInsert: { 
          postName: targetPostName,
          division: division || postDoc.division || "N/A",
          createdBy: primaryPayload.id,
          status: "ACTIVE"
        }
      },
      { upsert: true, new: true }
    );

    entry.entryNo = gd.lastEntryNo;
    gd.entries.push(entry);
    await gd.save();

    const response = NextResponse.json({ success: true, message: "Entry recorded", entryNo: entry.entryNo });

    if (visitingToken) {
      response.cookies.set("visitingAccessToken", "", { maxAge: 0, path: "/" });
    }

    return response;

  } catch (error: any) {
    console.error("GD Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  }