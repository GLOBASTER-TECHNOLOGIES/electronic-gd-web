import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { post, pageSerialNo } = body;

    if (!post || pageSerialNo === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 1. Target Today's Date
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 2. First, check if a serial number already exists
    const existingGD = await GeneralDiary.findOne({ post, diaryDate: today });

    if (!existingGD) {
      return NextResponse.json(
        { success: false, message: "Today's register has not been initiated." },
        { status: 404 }
      );
    }

    // 3. One-Time Update Enforcement
    // Check if pageSerialNo is already set (assuming 0 is the default/empty state)
    if (existingGD.pageSerialNo !== 0 && existingGD.pageSerialNo !== undefined) {
      return NextResponse.json(
        { 
          success: false, 
          message: "The Serial Number has already been authenticated. Further updates are prohibited." 
        },
        { status: 403 }
      );
    }

    // 4. Perform the single-time update
    existingGD.pageSerialNo = pageSerialNo;
    await existingGD.save();

    return NextResponse.json(
      { 
        success: true, 
        message: "Official Serial Number locked successfully.", 
        data: { pageSerialNo: existingGD.pageSerialNo } 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Lock Serial Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}