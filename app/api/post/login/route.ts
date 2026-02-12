import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/post.model";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { postCode, password } = await request.json();

    if (!postCode || !password) {
      return NextResponse.json(
        { message: "Post Code and Password are required" },
        { status: 400 }
      );
    }

    // 🔍 Find Post (include password manually because select:false)
    const post = await Post.findOne({ postCode: postCode.toUpperCase() }).select("+password +refreshToken");

    if (!post) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔑 Compare password
    const isMatch = await bcrypt.compare(password, post.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🎟️ Generate Access Token
    const accessToken = jwt.sign(
      { id: post._id, role: "POST" }, // role fixed for post login
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    // 🔄 Generate Refresh Token
    const refreshToken = jwt.sign(
      { id: post._id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // 💾 Save refresh token + login time
    post.refreshToken = refreshToken;
    post.lastLoginAt = new Date();
    await post.save();

    const res = NextResponse.json({
      message: "Post login successful",
      post: {
        id: post._id,
        postName: post.postName,
        postCode: post.postCode,
        division: post.division,
        zone: post.zone,
      },
    });

    // 🍪 HTTP-ONLY COOKIES
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
    console.error("Post Login Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
