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
    // Requirement: Must have Post Access Token AND Post Refresh Token AND Visiting Token
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
    // Requirement: Only Officer Access Token is required
    else if (officerToken && !visitingToken) {
      try {
        primaryPayload = jwt.verify(officerToken, process.env.JWT_ACCESS_SECRET!);
        signaturePayload = {
          id: primaryPayload.id,
          officerName: primaryPayload.name || (await Officer.findById(primaryPayload.id)).name,
          rank: primaryPayload.rank,
          forceNumber: primaryPayload.forceNumber,
        };
        actorType = "OFFICER";
      } catch (err) {
        return NextResponse.json({ message: "Officer session expired." }, { status: 401 });
      }
    }

    // 🛑 BLOCK: If neither case is satisfied
    else {
      let errorMessage = "Unauthorized access.";
      if (postToken && !visitingToken) errorMessage = "Visiting officer signature missing for station entry.";
      if (visitingToken && (!postToken || !postRefresh)) errorMessage = "Visiting officer can only mark entry on an active Station terminal.";
      
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }

    /* ==========================================
       🏢 3. Fetch Post/Station Context
    ========================================== */
    let postDoc = null;
    if (actorType === "POST") {
      postDoc = await Post.findById(primaryPayload.id);
    } else {
      const officerDoc = await Officer.findById(primaryPayload.id);
      if (!officerDoc) return NextResponse.json({ message: "Officer record not found" }, { status: 404 });
      
      const postId = officerDoc.postId || officerDoc.presentPosting || officerDoc.post;
      postDoc = postId ? await Post.findById(postId) : await Post.findOne({ postCode: officerDoc.postCode });
    }

    if (!postDoc) return NextResponse.json({ message: "Station context not found" }, { status: 400 });

    const targetPostCode = postDoc.postCode || postDoc.code;
    const targetPostName = postDoc.postName || postDoc.name;

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
      postCode: targetPostCode,
      postName: targetPostName,
      signedAt: new Date(),
    };

    const entry = {
      entryNo: 0, // Calculated below
      entryTime: new Date(),
      timeOfSubmission: new Date(timeOfSubmission),
      abstract,
      details,
      signature,
    };

    const istDate = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
    istDate.setUTCHours(0, 0, 0, 0);
    const startOfDay = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);

    const gd = await GeneralDiary.findOneAndUpdate(
      { postCode: targetPostCode, diaryDate: startOfDay },
      { 
        $inc: { lastEntryNo: 1 },
        $setOnInsert: { 
          postId: postDoc._id,
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

    // ✅ Automatically wipe the visiting signature after use
    if (visitingToken) {
      response.cookies.set("visitingAccessToken", "", { maxAge: 0, path: "/" });
    }

    return response;

  } catch (error: any) {
    console.error("Critical GD Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}