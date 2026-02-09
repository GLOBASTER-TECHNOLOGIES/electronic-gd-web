import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as JwtPayload;
    const officer = await Officer.findById(decoded.officerId).select("+refreshToken");

    if (!officer || officer.refreshToken !== refreshToken) {
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });
    }

    const newAccessToken = jwt.sign(
      { officerId: officer._id, role: officer.appRole },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const res = NextResponse.json({ message: "Token refreshed" });
    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });

    return res;
  } catch {
    return NextResponse.json({ message: "Refresh failed" }, { status: 403 });
  }
}
