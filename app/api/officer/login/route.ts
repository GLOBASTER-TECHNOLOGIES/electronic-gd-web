import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { forceNumber, password } = body;

    /* =========================
       BASIC VALIDATION
    ========================== */
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
       STATUS CHECKS
    ========================== */
    if (!officer.isActive) {
      return NextResponse.json(
        { message: "Officer account is inactive" },
        { status: 403 }
      );
    }

    if (officer.isSuspended) {
      return NextResponse.json(
        { message: "Officer account is suspended" },
        { status: 403 }
      );
    }

    /* =========================
       PASSWORD CHECK
    ========================== */
    const isMatch = await officer.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* =========================
       JWT GENERATION
    ========================== */
    const token = jwt.sign(
      {
        officerId: officer._id,
        forceNumber: officer.forceNumber,
        appRole: officer.appRole,
        postName: officer.postName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* =========================
       UPDATE LAST LOGIN
    ========================== */
    officer.lastLoginAt = new Date();
    await officer.save();

    /* =========================
       RESPONSE (NO PASSWORD)
    ========================== */
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        officer: {
          id: officer._id,
          forceNumber: officer.forceNumber,
          name: officer.name,
          rank: officer.rank,
          appRole: officer.appRole,
          railwayZone: officer.railwayZone,
          division: officer.division,
          postName: officer.postName,
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
