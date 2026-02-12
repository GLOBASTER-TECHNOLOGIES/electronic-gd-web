import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    let postPayload;
    try {
      postPayload = jwt.verify(
        postToken,
        process.env.JWT_ACCESS_SECRET!
      ) as any;
    } catch {
      return NextResponse.json(
        { message: "Invalid post session" },
        { status: 403 }
      );
    }

    // 2️⃣ Get Officer Credentials
    const { forceNumber, password } = await request.json();

    const officer = await Officer.findOne({ forceNumber }).select("+password");

    if (!officer) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, officer.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3️⃣ Create Visiting Token (Separate)
    const visitingToken = jwt.sign(
      {
        id: officer._id,
        role: "visiting_officer",
        officerName: officer.name,
        rank: officer.rank,
        forceNumber: officer.forceNumber,
        homePostId: officer.postId, // optional
      },
      VISITING_SECRET,
      { expiresIn: "30m" }
    );

    // 4️⃣ Send Response
    const res = NextResponse.json({
      message: "Visiting officer login successful",
      officer: {
        id: officer._id,
        name: officer.name,
        rank: officer.rank,
        forceNumber: officer.forceNumber,
      },
    });

    // 🍪 Set Separate Visiting Cookie
    res.cookies.set("visitingAccessToken", visitingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 30, // 30 minutes
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
