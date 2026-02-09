import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET missing");
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, ACCESS_SECRET);

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
