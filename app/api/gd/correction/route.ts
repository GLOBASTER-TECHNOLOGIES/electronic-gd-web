import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import GdCorrection from "@/models/gdCorrection.model";
import dbConnect from "@/config/dbConnect";

export async function GET(req: NextRequest) {
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
    // Use findOne because there is only ONE container document per dailyGDId
    const correctionContainer = await GdCorrection.findOne({ dailyGDId: dailyGDId }).lean();

    // If no corrections exist for this day, return an empty array
    if (!correctionContainer || !correctionContainer.history) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    // 5. Extract and sort the array
    // We sort the history array in memory (newest first) based on correctedAt
    const sortedHistory = correctionContainer.history.sort((a: any, b: any) => {
      const dateA = new Date(a.correctedAt).getTime();
      const dateB = new Date(b.correctedAt).getTime();
      return dateB - dateA; // Descending order
    });

    // 6. Return the flattened, sorted array
    return NextResponse.json(
      {
        success: true,
        data: sortedHistory,
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