import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import GdCorrection from "@/models/gdCorrection.model"; // Update this path to your actual model file
import dbConnect from "@/config/dbConnect";

export async function GET(req: NextRequest) {
  console.log("req  came")
  try {
    // 1. Ensure database connection
    await dbConnect();

    // 2. Extract the query parameter
    const searchParams = req.nextUrl.searchParams;
    const dailyGDId = searchParams.get("dailyGDId");

    // 3. Validate the parameter
    if (!dailyGDId) {
      return NextResponse.json(
        { success: false, message: "Missing dailyGDId parameter" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(dailyGDId)) {
      return NextResponse.json(
        { success: false, message: "Invalid dailyGDId format" },
        { status: 400 },
      );
    }

    // 4. Query the database
    // We sort by 'correctedAt' descending to show the newest edits first
    const corrections = await GdCorrection.find({ dailyGDId: dailyGDId })
      .sort({ correctedAt: -1 })
      .lean(); // .lean() improves performance for read-only operations

    // 5. Return the data
    return NextResponse.json(
      {
        success: true,
        data: corrections,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching GD corrections:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching correction logs.",
      },
      { status: 500 },
    );
  }
}
