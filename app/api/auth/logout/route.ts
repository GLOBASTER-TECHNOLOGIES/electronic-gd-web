import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. (Optional) DB Invalidations
    // We try to grab the main officer token just for DB cleanup
    const token = request.cookies.get("accessToken")?.value;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        await Officer.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch (err) {
        // Ignore invalid tokens
      }
    }

    // 2. Create the Response
    const response = NextResponse.json(
      { message: "Logout successful. All sessions cleared.", success: true },
      { status: 200 }
    );

    // 3. DYNAMICALLY DELETE ALL COOKIES
    // specific logic: Get every cookie the browser sent, and kill it.
    request.cookies.getAll().forEach((cookie) => {
      response.cookies.delete(cookie.name);
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}