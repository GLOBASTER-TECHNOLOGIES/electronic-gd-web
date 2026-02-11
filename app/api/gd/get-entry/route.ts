import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

function normalizeDiaryDate(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = date.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now + istOffset);
  istTime.setUTCHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset);
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const post = searchParams.get("post");
    const dateParam = searchParams.get("date");
    const id = searchParams.get("id"); // New Param for specific fetching

    // ==========================================
    // CASE 1: FETCH BY ID (Full Details)
    // Used when clicking "Show More"
    // ==========================================
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
      }
      const gd = await GeneralDiary.findById(id).lean();
      return NextResponse.json({ success: true, data: gd }, { status: 200 });
    }

    // ==========================================
    // CASE 2: SPECIFIC FILTER (Post + Date)
    // Used by Officer View
    // ==========================================
    if (post) {
      const targetDate = dateParam ? new Date(dateParam) : new Date();
      const queryDate = normalizeDiaryDate(targetDate);

      const gd = await GeneralDiary.findOne({
        post: post,
        diaryDate: queryDate
      }).lean();

      return NextResponse.json(
        { success: true, data: gd || null }, 
        { status: 200 }
      );
    }

    // ==========================================
    // CASE 3: ADMIN OVERVIEW (Summary Only)
    // Returns metadata + count. NO text details.
    // ==========================================
    const summaries = await GeneralDiary.aggregate([
      {
        $sort: { diaryDate: -1, updatedAt: -1 } 
      },
      {
        $project: {
          _id: 1,
          division: 1,
          post: 1,
          diaryDate: 1,
          pageSerialNo: 1,
          status: 1,
          updatedAt: 1,
          // Efficiently count the array without loading it
          entryCount: { $size: "$entries" } 
        }
      }
    ]);

    return NextResponse.json(
      { success: true, data: summaries },
      { status: 200 }
    );

  } catch (error) {
    console.error("Fetch GD Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}