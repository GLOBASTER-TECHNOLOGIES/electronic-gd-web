import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token required" },
        { status: 401 }
      );
    }

    
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = jwt.sign(
      {
        officerId: decoded.officerId,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json(
      {
        accessToken: newAccessToken,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Invalid or expired refresh token" },
      { status: 403 }
    );
  }
}
