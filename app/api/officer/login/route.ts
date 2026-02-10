import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { forceNumber, password } = await request.json();

    const officer = await Officer.findOne({ forceNumber }).select("+password");
    if (!officer) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, officer.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // ✅ FIX: Use 'id' instead of 'officerId' to match your /me route
    const accessToken = jwt.sign(
      { id: officer._id, role: officer.appRole },
      ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    // ✅ FIX: Consistency for refresh token too
    const refreshToken = jwt.sign({ id: officer._id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    officer.refreshToken = refreshToken;
    officer.lastLoginAt = new Date();
    await officer.save();

    const res = NextResponse.json({
      message: "Login successful",
      officer: {
        id: officer._id,
        name: officer.name,
        rank: officer.rank,
        appRole: officer.appRole,
        postName: officer.postName,
        division: officer.division,
      },
    });

    // 🔒 HTTP-ONLY COOKIES
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Safe for localhost
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
