import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model"; 

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 🔐 1️⃣ Detect Token Type
    const postToken = request.cookies.get("postAccessToken")?.value;
    const officerToken = request.cookies.get("accessToken")?.value;

    let decoded: any;
    let userType: "POST" | "OFFICER"; // Explicit type

    if (postToken) {
      decoded = jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
      userType = "POST";
    } else if (officerToken) {
      decoded = jwt.verify(officerToken, process.env.JWT_ACCESS_SECRET!);
      userType = "OFFICER";
    } else {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔎 Field Selection
    // We default to selecting everything except secrets
    // We explicitly FORCE 'postCode' to be selected if it exists
    const searchParams = request.nextUrl.searchParams;
    const requestedFields = searchParams.get("fields");

    let selectString = "-password -refreshToken";

    if (requestedFields) {
      const fieldsArray = requestedFields.split(",");
      const safeFields = fieldsArray.filter(
        (field) => !["password", "refreshToken", "__v"].includes(field.trim())
      );
      if (safeFields.length > 0) {
        // Ensure postCode is always included if specific fields are requested
        if (!safeFields.includes("postCode")) safeFields.push("postCode");
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
      
      // normalization: ensure 'postCode' exists even if DB uses 'koylaCode'
      if (user) {
        user = user.toObject(); // Convert to JS object to modify
        user.postCode = user.postCode || user.koylaCode || user.code || "UNKNOWN-CODE";
      }
    } 
    /* =========================
       FETCH OFFICER USER
    ========================= */
    else {
      user = await Officer.findById(decoded.id).select(selectString);
      
      // Fallback: If officer has no postCode but has a postId, fetch the code
      if (user && !user.postCode && user.postName) {
         // (Optional) If you really need to ensure code exists for legacy users
         // mostly strict schema handles this, but this is a safety net
         const relatedPost = await Post.findOne({ postName: user.postName }).select("postCode");
         if (relatedPost) {
             user = user.toObject();
             user.postCode = relatedPost.postCode;
         }
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: "User identity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user, userType });

  } catch (error: any) {
    console.error("Auth Me Error:", error.message);
    return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
  }
}