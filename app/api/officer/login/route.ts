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

    // 1. Find officer and explicitly select password
    const officer = await Officer.findOne({ forceNumber }).select("+password");
    if (!officer) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 2. Compare Hash
    const isMatch = await bcrypt.compare(password, officer.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    /* ==========================================================
       ✨ UPDATED JWT PAYLOAD
       Including postCode and postId makes your app much faster.
    ========================================================== */
    const jwtPayload = {
      id: officer._id,
      role: officer.appRole,
      postCode: officer.postCode, // ✅ Included for context
      postId: officer.postId, // ✅ Included for database links
    };

    const officerAccessToken = jwt.sign(jwtPayload, ACCESS_SECRET, {
      expiresIn: "15m",
    });

    const officerRefreshToken = jwt.sign({ id: officer._id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 3. Update Database session
    officer.refreshToken = officerRefreshToken;
    officer.lastLoginAt = new Date();
    await officer.save();

    const res = NextResponse.json({
      success: true,
      message: "Officer login successful",
      officer: {
        id: officer._id,
        name: officer.name,
        rank: officer.rank,
        appRole: officer.appRole,
        postCode: officer.postCode,
        postName: officer.postName,
        division: officer.division,
        mustChangePassword: officer.mustChangePassword,
      },
    });
    // console.log(officer);
    /* ==========================================================
       🔒 UPDATED COOKIE NAMES
    ========================================================== */
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };

    // Rename accessToken -> officerAccessToken
    res.cookies.set("officerAccessToken", officerAccessToken, {
      ...cookieOptions,
      maxAge: 60 * 15, // 15 Minutes
    });

    // Rename refreshToken -> officerRefreshToken
    res.cookies.set("officerRefreshToken", officerRefreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return res;
  } catch (error) {
    console.error("Officer Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
