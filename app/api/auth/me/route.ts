import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

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
    // ... inside app/api/auth/me/route.ts

    // ADD THESE LOGS:
    // console.log("Token ID:", decoded.id);

    // 3. Handle Field Selection (e.g. ?fields=name,rank)
    const searchParams = request.nextUrl.searchParams;
    const requestedFields = searchParams.get("fields");

    // Default: Exclude sensitive data
    let selectString = "-password -refreshToken";

    if (requestedFields) {
      // Clean and Validate fields
      const fieldsArray = requestedFields.split(",");
      const safeFields = fieldsArray.filter(
        (field) => !["password", "refreshToken", "__v"].includes(field.trim()),
      );

      if (safeFields.length > 0) {
        selectString = safeFields.join(" "); // Join with spaces for Mongoose
      }
    }

    // 4. Fetch Officer Details
    const officer = await Officer.findById(decoded.id).select(selectString);
    // console.log("Officer Found:", officer); // This is likely null right now

    if (!officer) {
      return NextResponse.json(
        { message: "Officer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user: officer });
  } catch (error: any) {
    console.error("Auth Me Error:", error.message);
    return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
  }
}
