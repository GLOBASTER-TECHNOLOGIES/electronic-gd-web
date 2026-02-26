import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

const VISITING_SECRET = process.env.JWT_VISITING_SECRET!;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // 🔐 1️⃣ Check Post Session Exists
    const postToken = request.cookies.get("postAccessToken")?.value;

    if (!postToken) {
      return NextResponse.json(
        { message: "Post login required" },
        { status: 403 }
      );
    }

    try {
      jwt.verify(postToken, process.env.JWT_ACCESS_SECRET!);
    } catch {
      return NextResponse.json(
        { message: "Invalid post session" },
        { status: 403 }
      );
    }

    // 2️⃣ Get Force Number Only
    const { forceNumber } = await request.json();

    if (!forceNumber) {
      return NextResponse.json(
        { message: "Force number is required" },
        { status: 400 }
      );
    }

    // 3️⃣ Find Officer
    const officer = await Officer.findOne({ forceNumber });

    if (!officer) {
      return NextResponse.json(
        { message: "Officer not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Create Visiting Token (No Password Validation)
    const visitingToken = jwt.sign(
      {
        id: officer._id,
        role: "visiting_officer",
        officerName: officer.name,
        rank: officer.rank,
        forceNumber: officer.forceNumber,
        homePostId: officer.postId,
      },
      VISITING_SECRET,
      { expiresIn: "30m" }
    );

    // 5️⃣ Send Response
    const res = NextResponse.json({
      message: "Visiting officer identified",
      officer: {
        id: officer._id,
        name: officer.name,
        rank: officer.rank,
        forceNumber: officer.forceNumber,
      },
    });

    // 🍪 Set Visiting Cookie
    res.cookies.set("visitingAccessToken", visitingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 30,
    });

    return res;

  } catch (error) {
    console.error("Visiting Login Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}