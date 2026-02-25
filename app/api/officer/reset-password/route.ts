import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // 1. 🛡️ CHECK BOTH POSSIBLE TOKENS
    const officerToken = request.cookies.get("officerAccessToken")?.value;
    const postToken = request.cookies.get("postAccessToken")?.value;

    const activeToken = officerToken || postToken;

    if (!activeToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No session found" },
        { status: 401 },
      );
    }

    // 2. VERIFY THE ACTIVE TOKEN
    let decoded: any;
    try {
      decoded = jwt.verify(activeToken, ACCESS_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    // 3. OPTIONAL: ROLE CHECK
    // If your "Post" users also have roles, verify they have permission
    // if (decoded.role !== "ADMIN" && decoded.role !== "POST_ADMIN") { ... }

    // 4. PARSE DATA FROM FRONTEND
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Officer ID is required" },
        { status: 400 },
      );
    }

    // 5. BCRYPT HASHING
    const hashedDefaultPassword = await bcrypt.hash("0000000", 10);

    // 6. UPDATE DATABASE
    const updatedOfficer = await Officer.findByIdAndUpdate(
      id,
      {
        $set: {
          password: hashedDefaultPassword,
          mustChangePassword: true,
          passwordResetByAdminAt: new Date(),
          refreshToken: null, // Force logout
        },
      },
      { new: true },
    );

    if (!updatedOfficer) {
      return NextResponse.json(
        { success: false, message: "Officer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset to 0000000 successfully",
    });
  } catch (error: any) {
    console.error("Reset Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
