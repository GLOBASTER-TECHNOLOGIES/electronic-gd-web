import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // 🔐 Get Access Token
    const officerToken = request.cookies.get("officerAccessToken")?.value;
    const postToken = request.cookies.get("postAccessToken")?.value;

    if (!officerToken && !postToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET!;
    let userId: string | null = null;
    let userType: "OFFICER" | "POST" | null = null;

    try {
      if (officerToken) {
        const decoded: any = jwt.verify(officerToken, JWT_SECRET);
        userId = decoded.id;
        userType = "OFFICER";
      } else if (postToken) {
        const decoded: any = jwt.verify(postToken, JWT_SECRET);
        userId = decoded.id;
        userType = "POST";
      }
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (userType === "OFFICER") {
      await Officer.findByIdAndUpdate(userId, {
        password: hashedPassword,
        mustChangePassword: false,
        lastPasswordChange: new Date(),
        refreshToken: null, // 🔥 optional: invalidate old refresh token
      });
    }

    if (userType === "POST") {
      await Post.findByIdAndUpdate(userId, {
        password: hashedPassword,
        mustChangePassword: false,
        lastPasswordChange: new Date(),
        refreshToken: null,
      });
    }

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update Password Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update password",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
