import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. (Optional but Recommended) Invalidate token in Database
    // We try to get the user ID from the cookie before we destroy it
    const token = request.cookies.get("accessToken")?.value;
    
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        
        // Find user and set refreshToken to null (Secure Logout)
        await Officer.findByIdAndUpdate(decoded.id, { 
            refreshToken: null 
        });
      } catch (err) {
        // Token might be expired already, which is fine, we just proceed to clear cookies
      }
    }

    const response = NextResponse.json(
      { message: "Logout successful", success: true },
      { status: 200 }
    );

    // 2. CLEAR BOTH COOKIES
    // Set Access Token to expire immediately
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), 
      path: "/",
    });

    // Set Refresh Token to expire immediately
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), 
      path: "/",
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}