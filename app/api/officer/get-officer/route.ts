import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Connect to Database
    await dbConnect();

    // 2. Extract Query Parameters (for search/filtering)
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query"); // e.g., ?query=RPF-8821 or ?query=Rajesh

    let officers;

    if (query) {
      // SCENARIO A: Search Mode
      // Finds officers where Name OR ForceNumber matches the query (case-insensitive)
      officers = await Officer.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { forceNumber: { $regex: query, $options: "i" } },
        ],
      })
        .select("-password -refreshToken") // Explicitly exclude sensitive data
        .sort({ createdAt: -1 }); // Newest first
    } else {
      // SCENARIO B: Fetch All Mode
      officers = await Officer.find({})
        .select("-password -refreshToken") // Explicitly exclude sensitive data
        .sort({ createdAt: -1 });
    }

    // 3. Return Response
    return NextResponse.json(
      {
        success: true,
        count: officers.length,
        data: officers,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching officers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch officer records",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
