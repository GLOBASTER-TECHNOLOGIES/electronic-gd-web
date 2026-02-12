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

    // We need to store the Signer's Home Info specifically
    let signerPostCode = "";
    let signerPostName = "";

    /* ==========================================
       🛡️ 2. Dual-Case Logic Enforcement
    ========================================== */

    // CASE A: VISITING OFFICER (Station Context)
    if (postToken && postRefresh && visitingToken) {
      try {
        // 1. Identify the Station (Where the entry is happening)
        primaryPayload = jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
        actorType = "POST";

        // 2. Identify the Visiting Officer (Who is signing)
        const visitingPayload: any = jwt.verify(
          visitingToken,
          process.env.JWT_VISITING_SECRET!,
        );

        // FETCH VISITING OFFICER DETAILS
        // (Crucial: To get their home post code, not the station's code)
        const visitingOfficerDoc = await Officer.findById(visitingPayload.id);
        if (!visitingOfficerDoc)
          return NextResponse.json(
            { message: "Visiting Officer not found" },
            { status: 404 },
          );

        signaturePayload = {
          id: visitingOfficerDoc._id,
          officerName: visitingOfficerDoc.name,
          rank: visitingOfficerDoc.rank,
          forceNumber: visitingOfficerDoc.forceNumber,
        };

        // ✅ Set Signer's Home Post Code
        signerPostCode = visitingOfficerDoc.postCode;
        // Optional: You might need to fetch the postName for the officer's home code if not stored in Officer model
        // Assuming Officer model might not have postName, or we leave it blank/fetch it separately.
        // For now, let's use the code.
        signerPostName = "Visiting from " + visitingOfficerDoc.postCode;
      } catch (err) {
        return NextResponse.json(
          { message: "Station or Visiting session expired." },
          { status: 401 },
        );
      }
    }
    // CASE B: NATIVE OFFICER (Individual Context)
    else if (officerToken && !visitingToken) {
      try {
        primaryPayload = jwt.verify(
          officerToken,
          process.env.JWT_ACCESS_SECRET!,
        );

        const officerDoc = await Officer.findById(primaryPayload.id);
        if (!officerDoc)
          return NextResponse.json(
            { message: "Officer not found" },
            { status: 404 },
          );

        signaturePayload = {
          id: officerDoc._id,
          officerName: officerDoc.name,
          rank: officerDoc.rank,
          forceNumber: officerDoc.forceNumber,
        };
        actorType = "OFFICER";

        // ✅ Set Signer's Home Post Code (Same as current location for native)
        signerPostCode = officerDoc.postCode;
        // We can fill postName later from the station doc if it matches
      } catch (err) {
        return NextResponse.json(
          { message: "Officer session expired." },
          { status: 401 },
        );
      }
    } else {
      return NextResponse.json(
        { message: "Access Denied: Invalid token combination." },
        { status: 403 },
      );
    }

    /* ==========================================
       🏢 3. Fetch Post Context (Where entry is saved)
    ========================================== */
    let postDoc = null;
    if (actorType === "POST") {
      postDoc = await Post.findById(primaryPayload.id);
    } else {
      // For Native Officer, find the post they belong to
      postDoc = await Post.findOne({ postCode: signerPostCode });
    }

    if (!postDoc)
      return NextResponse.json(
        { message: "Station terminal not found." },
        { status: 400 },
      );

    const targetPostCode = postDoc.postCode; // The Station we are physically at
    const targetPostName = postDoc.postName;

    // For Native officers, update the signerPostName now that we have the Post Doc
    if (actorType === "OFFICER" || signerPostCode === targetPostCode) {
      signerPostName = targetPostName;
    }

    /* ==========================================
       📦 4. Save Entry
    ========================================== */
    const body = await request.json();
    const { abstract, details, timeOfSubmission, division } = body;

    const signature = {
      officerId: signaturePayload.id,
      officerName: signaturePayload.officerName,
      rank: signaturePayload.rank,
      forceNumber: signaturePayload.forceNumber,

      // ✅ CHANGED: Now using the Officer's Home Post Code
      postCode: signerPostCode,
      postName: signerPostName, // e.g. "Visiting from [Code]" or Actual Name

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

    // 🔴 IMPORTANT: We still query using targetPostCode (Current Station)
    // because the entry must live in THIS station's diary.
    const gd = await GeneralDiary.findOneAndUpdate(
      { postCode: targetPostCode, diaryDate: startOfDay },
      {
        $inc: { lastEntryNo: 1 },
        $setOnInsert: {
          postName: targetPostName,
          division: division || postDoc.division || "N/A",
          createdBy: primaryPayload.id,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true },
    );

    entry.entryNo = gd.lastEntryNo;
    gd.entries.push(entry);
    await gd.save();

    const response = NextResponse.json({
      success: true,
      message: "Entry recorded",
      entryNo: entry.entryNo,
    });

    if (visitingToken) {
      response.cookies.set("visitingAccessToken", "", { maxAge: 0, path: "/" });
    }

    return response;
  } catch (error: any) {
    console.error("GD Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
