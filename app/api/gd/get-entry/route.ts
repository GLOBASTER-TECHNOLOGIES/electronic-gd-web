import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";

export const dynamic = 'force-dynamic'; // Prevent Vercel from caching this route

/* =========================
   Helper: Normalize Date
   (Matches the Logic used in Creation)
========================= */
function normalizeDiaryDate(dateInput: Date | string) {
  const date = new Date(dateInput);
  
  // 1. Convert to Milliseconds
  const now = date.getTime();
  
  // 2. Add IST Offset (+5.5h) to find "Local Day"
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now + istOffset);
  
  // 3. Set to Midnight
  istTime.setUTCHours(0, 0, 0, 0);
  
  // 4. Subtract Offset back to get the UTC stored value
  return new Date(istTime.getTime() - istOffset);
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Extract Parameters
    const { searchParams } = new URL(request.url);
    const post = searchParams.get("post");
    const dateParam = searchParams.get("date"); // Optional (YYYY-MM-DD)

    // 2. Validation
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post name is required" },
        { status: 400 }
      );
    }

    // 3. Determine the Date to Query
    // If frontend sends a date, use it. Otherwise, default to NOW.
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    // Normalize it to match the DB format (Midnight IST)
    const queryDate = normalizeDiaryDate(targetDate);

    // 4. Find the Document
    const gd = await GeneralDiary.findOne({
      post: post,
      diaryDate: queryDate
    }).lean(); // .lean() makes it a plain JS object (faster)

    // 5. Handle Not Found
    if (!gd) {
      return NextResponse.json(
        { 
          success: true, // Request succeeded, just no data found
          data: null, 
          message: "No General Diary opened for this date." 
        },
        { status: 200 } // Return 200 so frontend can handle "Empty State" gracefully
      );
    }

    // 6. Return Data
    return NextResponse.json(
      { 
        success: true, 
        data: gd 
      }, 
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