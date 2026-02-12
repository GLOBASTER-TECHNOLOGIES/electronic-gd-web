import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model"; 

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 🔐 1️⃣ Detect Token Type (Updated cookie names)
    const postToken = request.cookies.get("postAccessToken")?.value;
    const officerToken = request.cookies.get("officerAccessToken")?.value; // ✅ UPDATED

    let decoded: any;
    let userType: "POST" | "OFFICER"; 

    if (postToken) {
      decoded = jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
      userType = "POST";
    } else if (officerToken) {
      decoded = jwt.verify(officerToken, process.env.JWT_ACCESS_SECRET!); // ✅ Still uses same secret
      userType = "OFFICER";
    } else {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔎 Field Selection
    const searchParams = request.nextUrl.searchParams;
    const requestedFields = searchParams.get("fields");

    let selectString = "-password -refreshToken";

    if (requestedFields) {
      const fieldsArray = requestedFields.split(",");
      const safeFields = fieldsArray.filter(
        (field) => !["password", "refreshToken", "__v"].includes(field.trim())
      );
      if (safeFields.length > 0) {
        // ✅ Ensure both ID and Code are included for system logic
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
        user.postCode = user.postCode || user.koylaCode || user.code || "UNKNOWN-CODE";
      }
    } 
    /* =========================
       FETCH OFFICER USER
    ========================= */
    else {
      user = await Officer.findById(decoded.id).select(selectString);
      
      // ✅ Improved Fallback logic
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
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user, userType });

  } catch (error: any) {
    console.error("Auth Me Error:", error.message);
    return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
  }
}