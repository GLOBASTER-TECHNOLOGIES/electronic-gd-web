import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model"; // Ensure this is imported

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 🔐 1️⃣ Detect Token Type
    const postToken = request.cookies.get("postAccessToken")?.value;
    const officerToken = request.cookies.get("accessToken")?.value;

    let decoded: any;
    let userType: "POST" | "OFFICER";

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
    const searchParams = request.nextUrl.searchParams;
    const requestedFields = searchParams.get("fields");

    let selectString = "-password -refreshToken";

    if (requestedFields) {
      const fieldsArray = requestedFields.split(",");
      const safeFields = fieldsArray.filter(
        (field) => !["password", "refreshToken", "__v"].includes(field.trim()),
      );
      if (safeFields.length > 0) {
        selectString = safeFields.join(" ");
      }
    }

    let user;

    if (userType === "POST") {
      user = await Post.findById(decoded.id)
        .select(selectString)
        .populate("officerInCharge", "name rank forceNumber");
    } else {
      user = await Officer.findById(decoded.id).select(selectString);
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
