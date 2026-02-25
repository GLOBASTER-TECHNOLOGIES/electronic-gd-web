import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

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
    const post = searchParams.get("post"); // OLD compatibility
    const postCode = searchParams.get("postCode"); // NEW correct field
    const dateParam = searchParams.get("date");
    const id = searchParams.get("id");

    // ====================================================
    // CASE 1: FETCH FULL GD BY ID
    // ====================================================
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid ID" },
          { status: 400 },
        );
      }

      const gd = await GeneralDiary.findById(id).select("-__v").lean();

      if (!gd) {
        return NextResponse.json(
          { success: false, message: "GD Not Found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: gd }, { status: 200 });
    }

    // ====================================================
    // CASE 2: FETCH BY POSTCODE (WITH OR WITHOUT DATE)
    // ====================================================
    if (postCode || post) {
      const queryField = postCode
        ? { postCode: postCode.toUpperCase() }
        : { post: post };

      // 🔹 If DATE is provided → return single GD
      if (dateParam) {
        const targetDate = new Date(dateParam);
        const startOfDay = normalizeDiaryDate(targetDate);

        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const gd = await GeneralDiary.findOne({
          ...queryField,
          diaryDate: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        })
          .select("-__v")
          .lean();

        return NextResponse.json(
          { success: true, data: gd || null },
          { status: 200 },
        );
      }

      // 🔹 If ONLY postCode provided → return ALL GDs
      const allGDs = await GeneralDiary.find(queryField)
        .sort({ diaryDate: -1 })
        .select("-__v")
        .lean();

      return NextResponse.json(
        { success: true, data: allGDs },
        { status: 200 },
      );
    }

    // ====================================================
    // CASE 3: ADMIN OVERVIEW (Summary Only)
    // ====================================================
    const summaries = await GeneralDiary.aggregate([
      {
        $sort: { diaryDate: -1, updatedAt: -1 },
      },
      {
        $project: {
          _id: 1,
          division: 1,
          postCode: 1,
          diaryDate: 1,
          pageSerialNo: 1,
          hasCorrections: 1,
          status: 1,
          updatedAt: 1,
          entryCount: { $size: "$entries" },
        },
      },
    ]);

    return NextResponse.json(
      { success: true, data: summaries },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch GD Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
