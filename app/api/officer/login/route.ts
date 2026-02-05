import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; 
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

/* =========================
   ENV VALIDATION
========================= */
// FIX: Add 'as string' to force TypeScript to treat these as strings, not undefined
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// This runtime check is still good to keep
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are missing from environment variables");
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { forceNumber, password } = await request.json();

    if (!forceNumber || !password) {
      return NextResponse.json(
        { message: "Force Number and Password are required" },
        { status: 400 }
      );
    }

    /* =========================
       FIND OFFICER
    ========================== */
    const officer = await Officer.findOne({ forceNumber }).select("+password");

    if (!officer) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* =========================
       COMPARE PASSWORD
    ========================== */
    const isMatch = await bcrypt.compare(password, officer.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* =========================
       TOKEN GENERATION
    ========================== */
    // Now TypeScript knows JWT_ACCESS_SECRET is definitely a string
    const accessToken = jwt.sign(
      { officerId: officer._id, appRole: officer.appRole },
      JWT_ACCESS_SECRET, 
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { officerId: officer._id },
      JWT_REFRESH_SECRET, 
      { expiresIn: "7d" }
    );

    /* =========================
       UPDATE & RESPOND
    ========================== */
    officer.refreshToken = refreshToken;
    officer.lastLoginAt = new Date();
    await officer.save();

    return NextResponse.json(
      {
        message: "Login successful",
        accessToken,
        refreshToken,
        officer: {
          id: officer._id,
          forceNumber: officer.forceNumber,
          name: officer.name,
          rank: officer.rank,
          appRole: officer.appRole,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}