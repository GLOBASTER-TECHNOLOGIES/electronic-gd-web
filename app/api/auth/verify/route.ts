import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { valid: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    return NextResponse.json(
      {
        valid: true,
        decoded,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { valid: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
