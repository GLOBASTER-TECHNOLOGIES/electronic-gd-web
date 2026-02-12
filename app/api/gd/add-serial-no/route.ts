import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";

/* =========================
   Helper: True IST Midnight 
   (Copy-pasted from your POST route for perfect alignment)
========================= */
function normalizeDiaryDate(date = new Date()) {
  const now = date.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now + istOffset);
  istTime.setUTCHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset);
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { postCode, pageSerialNo } = body;

    // 1. Basic Validation
    if (!postCode || pageSerialNo === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 },
      );
    }

    // 2. Strict IST Date Check
    // This ensures 'today' in India is correctly calculated before querying UTC MongoDB
    const today = normalizeDiaryDate();

    // 3. Find today's register only
    const existingGD = await GeneralDiary.findOne({ postCode, diaryDate: today });

    if (!existingGD) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Today's General Diary has not been opened yet. Previous days cannot be updated.",
        },
        { status: 404 },
      );
    }

    // 4. One-Time Update Enforcement
    // Prevents overwriting once a serial number is already authenticated
    if (
      existingGD.pageSerialNo !== 0 &&
      existingGD.pageSerialNo !== undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The Serial Number has already been authenticated. Further updates are prohibited.",
        },
        { status: 403 },
      );
    }

    // 5. Apply the update
    existingGD.pageSerialNo = pageSerialNo;
    await existingGD.save();

    return NextResponse.json(
      {
        success: true,
        message: "Official Serial Number locked for today's register.",
        data: { pageSerialNo: existingGD.pageSerialNo },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Lock Serial Error:", error);

    // Handle Concurrency (VersionError) if two people try to update at the exact same time
    if (error.name === "VersionError") {
      return NextResponse.json(
        { message: "Concurrency conflict. Please try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
