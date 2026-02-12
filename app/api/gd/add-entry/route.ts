import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Token Extraction
    const postToken = request.cookies.get("postAccessToken")?.value;
    const postRefresh = request.cookies.get("postRefreshToken")?.value;
    const officerToken = request.cookies.get("officerAccessToken")?.value;
    const visitingToken = request.cookies.get("visitingAccessToken")?.value;

    let signaturePayload: any = null;
    let actorType: "POST" | "OFFICER" = "OFFICER";
    let primaryPayload: any = null;
    let signerPostCode = "";
    let signerPostName = "";

    // 2. Dual-Case Logic (Visiting vs Native)
    if (postToken && postRefresh && visitingToken) {
      // CASE A: Visiting Officer
      try {
        primaryPayload = jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
        actorType = "POST";
        const visitingPayload: any = jwt.verify(
          visitingToken,
          process.env.JWT_VISITING_SECRET!,
        );

        const visitingOfficerDoc = await Officer.findById(visitingPayload.id);
        if (!visitingOfficerDoc) throw new Error("Visiting Officer not found");

        signaturePayload = {
          id: visitingOfficerDoc._id,
          officerName: visitingOfficerDoc.name,
          rank: visitingOfficerDoc.rank,
          forceNumber: visitingOfficerDoc.forceNumber,
        };
        signerPostCode = visitingOfficerDoc.postCode;
        signerPostName = "Visiting from " + visitingOfficerDoc.postCode;
      } catch (err) {
        return NextResponse.json(
          { message: "Session expired." },
          { status: 401 },
        );
      }
    } else if (officerToken && !visitingToken) {
      // CASE B: Native Officer
      try {
        primaryPayload = jwt.verify(
          officerToken,
          process.env.JWT_ACCESS_SECRET!,
        );
        const officerDoc = await Officer.findById(primaryPayload.id);
        if (!officerDoc) throw new Error("Officer not found");

        signaturePayload = {
          id: officerDoc._id,
          officerName: officerDoc.name,
          rank: officerDoc.rank,
          forceNumber: officerDoc.forceNumber,
        };
        actorType = "OFFICER";
        signerPostCode = officerDoc.postCode;
      } catch (err) {
        return NextResponse.json(
          { message: "Officer session expired." },
          { status: 401 },
        );
      }
    } else {
      return NextResponse.json({ message: "Access Denied." }, { status: 403 });
    }

    // 3. Fetch Station Context
    let postDoc = null;
    if (actorType === "POST") {
      postDoc = await Post.findById(primaryPayload.id);
    } else {
      postDoc = await Post.findOne({ postCode: signerPostCode });
    }

    if (!postDoc)
      return NextResponse.json(
        { message: "Station not found." },
        { status: 400 },
      );

    const targetPostCode = postDoc.postCode;
    const targetPostName = postDoc.postName;

    if (actorType === "OFFICER" || signerPostCode === targetPostCode) {
      signerPostName = targetPostName;
    }

    // 4. Prepare Entry
    const body = await request.json();
    const { abstract, details, timeOfSubmission, division } = body;

    const signature = {
      officerId: signaturePayload.id,
      officerName: signaturePayload.officerName,
      rank: signaturePayload.rank,
      forceNumber: signaturePayload.forceNumber,
      postCode: signerPostCode, // ✅ Correctly stores signer's home post
      postName: signerPostName,
      signedAt: new Date(),
    };

    // 5. Calculate Date Boundaries
    const istDate = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
    istDate.setUTCHours(0, 0, 0, 0);
    const startOfDay = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);

    // 6. DB Operation (Fixed Query)
    const gd = await GeneralDiary.findOneAndUpdate(
      {
        postCode: targetPostCode, // ✅ STRICTLY using postCode
        diaryDate: startOfDay,
      },
      {
        $inc: { lastEntryNo: 1 },
        $setOnInsert: {
          postName: targetPostName,
          division: division || postDoc.division || "N/A",
          createdBy: primaryPayload.id,
          status: "ACTIVE",
          // Mongoose defaults will handle pageSerialNo
        },
      },
      { upsert: true, new: true },
    );

    const entry = {
      entryNo: gd.lastEntryNo,
      entryTime: new Date(),
      timeOfSubmission: new Date(timeOfSubmission),
      abstract,
      details,
      signature,
    };

    gd.entries.push(entry);
    await gd.save();

    // 7. Cleanup & Response
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
    // Handle specific duplicate key errors gracefully if they ever happen again
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Concurrency Error: Please try again." },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
