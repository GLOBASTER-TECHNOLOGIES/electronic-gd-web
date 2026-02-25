import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Use the EXACT same secret used in your login routes
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 🔐 Extract Tokens (Matching the names set in your login routes)
    const officerToken = request.cookies.get("officerAccessToken")?.value;
    const postToken = request.cookies.get("postAccessToken")?.value;

    if (!officerToken && !postToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token found" },
        { status: 401 }
      );
    }

    let userId: string | null = null;
    let userType: "OFFICER" | "POST" | null = null;

    // 🔍 Verify Token using the correct Access Secret
    try {
      if (officerToken) {
        const decoded: any = jwt.verify(officerToken, ACCESS_SECRET);
        userId = decoded.id;
        userType = "OFFICER";
      } else if (postToken) {
        const decoded: any = jwt.verify(postToken, ACCESS_SECRET);
        userId = decoded.id;
        userType = "POST";
      }
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 }
      );
    }

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, message: "Invalid session data" },
        { status: 401 }
      );
    }

    // 🔎 Fetch User
    const user =
      userType === "OFFICER"
        ? await Officer.findById(userId).select("+password +mustChangePassword")
        : await Post.findById(userId).select("+password +mustChangePassword");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🚨 Security Check
    if (!user.mustChangePassword) {
      return NextResponse.json(
        { success: false, message: "Password change not required" },
        { status: 403 }
      );
    }

    // 🔐 Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔄 Update User directly on the instance
    user.password = hashedPassword;
    user.mustChangePassword = false;
    user.lastPasswordChange = new Date();
    user.passwordResetByAdminAt = null;
    user.refreshToken = null; // Invalidate refresh token for security
    
    await user.save();

    // 🔐 Clear ALL possible session cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Password updated successfully. Please login again.",
      },
      { status: 200 }
    );

    const cookiesToClear = [
      "officerAccessToken", 
      "officerRefreshToken", 
      "postAccessToken", 
      "postRefreshToken"
    ];

    cookiesToClear.forEach(cookie => {
      response.cookies.set(cookie, "", { 
        httpOnly: true, 
        expires: new Date(0),
        path: '/' 
      });
    });

    return response;

  } catch (error: any) {
    console.error("Update Password Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update password",
      },
      { status: 500 }
    );
  }
}