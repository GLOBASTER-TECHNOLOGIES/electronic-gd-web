import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const postToken = request.cookies.get("postAccessToken")?.value;
    const officerToken = request.cookies.get("officerAccessToken")?.value;
    const visitingToken = request.cookies.get("visitingAccessToken")?.value;

    let decoded: any;
    let userType: "POST" | "OFFICER" | "VISITING_OFFICER";

    // 🔐 Token Detection (unchanged priority)
    if (postToken) {
      decoded = jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
      userType = "POST";
    } else if (officerToken) {
      decoded = jwt.verify(officerToken, process.env.JWT_ACCESS_SECRET!);
      userType = "OFFICER";
    } else if (visitingToken) {
      decoded = jwt.verify(
        visitingToken,
        process.env.JWT_VISITING_SECRET!
      );
      userType = "VISITING_OFFICER";
    } else {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔎 Field Selection (unchanged)
    const searchParams = request.nextUrl.searchParams;
    const requestedFields = searchParams.get("fields");

    let selectString = "-password -refreshToken";

    if (requestedFields) {
      const fieldsArray = requestedFields.split(",");
      const safeFields = fieldsArray.filter(
        (field) => !["password", "refreshToken", "__v"].includes(field.trim())
      );

      if (safeFields.length > 0) {
        if (!safeFields.includes("postCode")) safeFields.push("postCode");
        if (!safeFields.includes("postId")) safeFields.push("postId");
        selectString = safeFields.join(" ");
      }
    }

    let user: any = null;

    /* =========================
       FETCH POST USER
    ========================= */
    if (userType === "POST") {
      user = await Post.findById(decoded.id)
        .select(selectString)
        .populate("officerInCharge", "name rank forceNumber");

      if (user) {
        user = user.toObject();
        user.postCode =
          user.postCode || user.koylaCode || user.code || "UNKNOWN-CODE";
      }

      // ✅ ADD VISITING OFFICER IF EXISTS (no structure change)
      if (visitingToken) {
        try {
          const visitingDecoded: any = jwt.verify(
            visitingToken,
            process.env.JWT_VISITING_SECRET!
          );

          const visitingOfficer = await Officer.findById(
            visitingDecoded.id
          ).select(selectString);

          if (visitingOfficer) {
            user.visitingOfficer = visitingOfficer;
          }
        } catch {}
      }
    }

    /* =========================
       FETCH NORMAL OFFICER
    ========================= */
    else if (userType === "OFFICER") {
      user = await Officer.findById(decoded.id).select(selectString);

      if (user && !user.postCode && user.postId) {
        const relatedPost = await Post.findById(user.postId).select("postCode");
        if (relatedPost) {
          user = user.toObject();
          user.postCode = relatedPost.postCode;
        }
      }
    }

    /* =========================
       FETCH VISITING OFFICER ONLY
    ========================= */
    else if (userType === "VISITING_OFFICER") {
      user = await Officer.findById(decoded.id).select(selectString);

      if (user && !user.postCode && user.postId) {
        const relatedPost = await Post.findById(user.postId).select("postCode");
        if (relatedPost) {
          user = user.toObject();
          user.postCode = relatedPost.postCode;
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: "User identity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user, userType });

  } catch (error: any) {
    console.error("Auth Me Error:", error.message);
    return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
  }
}