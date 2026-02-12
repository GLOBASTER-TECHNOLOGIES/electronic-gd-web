import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model"; // Ensure this is imported

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Get Token
    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify Token
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);

    // 3. Handle Field Selection
    const searchParams = request.nextUrl.searchParams;
    const requestedFields = searchParams.get("fields");
    
    // Default: Exclude sensitive data
    let selectString = "-password -refreshToken";

    if (requestedFields) {
      const fieldsArray = requestedFields.split(",");
      const safeFields = fieldsArray.filter(
        (field) => !["password", "refreshToken", "__v"].includes(field.trim())
      );
      if (safeFields.length > 0) {
        selectString = safeFields.join(" ");
      }
    }

    // 4. Identify User Type
    // First, try to find an Officer
    let user = await Officer.findById(decoded.id).select(selectString);
    let userType = "OFFICER";

    // If not an officer, try to find a Post (Station Login)
    if (!user) {
      user = await Post.findById(decoded.id).select(selectString).populate("officerInCharge", "name rank forceNumber");
      userType = "POST";
    }

    // 5. Final Check
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