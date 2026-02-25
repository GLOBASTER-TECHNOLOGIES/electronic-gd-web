import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;

    // ✅ Get query param safely
    const query = searchParams.get("query")?.trim();

    console.log("Query received:", query);

    let filter: any = {};

    // ✅ If query exists and is not empty → build search filter
    if (query && query.length > 0) {
      filter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { forceNumber: { $regex: query, $options: "i" } },
          { postCode: { $regex: query, $options: "i" } },
          { postName: { $regex: query, $options: "i" } },
          { division: { $regex: query, $options: "i" } },
          { railwayZone: { $regex: query, $options: "i" } },
        ],
      };
    }

    // ✅ If no query → filter remains {}
    const officers = await Officer.find(filter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: officers.length,
        data: officers,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error fetching officers:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch officer records",
        error: error.message,
      },
      { status: 500 }
    );
  }
}