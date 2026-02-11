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
        { success: false, message: "Missing Post name or Serial Number" },
        { status: 400 }
      );
    }

    // 1. Calculate Today's Date normalized to 00:00:00 UTC
    // This ensures we ONLY find the register created for the current day
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 2. Find and Update only if Post and Date match
    // This naturally prevents updating previous days because the Date wouldn't match
    const updatedGD = await GeneralDiary.findOneAndUpdate(
      { 
        post: post, 
        diaryDate: today 
      },
      { $set: { pageSerialNo: pageSerialNo } },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedGD) {
      return NextResponse.json(
        { 
          success: false, 
          message: "No active GD found for today. Previous records cannot be updated." 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Today's Serial Number updated successfully", 
        data: { pageSerialNo: updatedGD.pageSerialNo } 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Update Serial Error:", error);

    // Handle MongoDB unique index error if serial number is already taken
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This Serial Number is already in use by another register." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}