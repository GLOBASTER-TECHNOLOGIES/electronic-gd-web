import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GeneralDiary from "@/models/gd.model";
import mongoose from "mongoose";

/* =========================
   Helper: normalize date
========================= */
function normalizeDiaryDate(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      division,
      post,
      abstract,
      details,
      officerId,
      officerName,
      rank,
      forceNumber,
    } = await request.json();

    /* =========================
       BASIC VALIDATION
    ========================== */
    if (
      !division ||
      !post ||
      !abstract ||
      !details ||
      !officerId
    ) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    const today = normalizeDiaryDate();

    /* =========================
       FIND OR CREATE GD
    ========================== */
    let gd = await GeneralDiary.findOne({
      post,
      diaryDate: today,
      status: "ACTIVE",
    });

    if (!gd) {
      gd = await GeneralDiary.create({
        division,
        post,
        diaryDate: today,
        pageSerialNo: Date.now(), // simple running number, replace later if needed
        createdBy: officerId,
        lastEntryNo: 0,
        entries: [],
      });
    }

    /* =========================
       AUTO INCREMENT ENTRY NO
    ========================== */
    const nextEntryNo = gd.lastEntryNo + 1;

    const entry = {
      entryNo: nextEntryNo,
      entryTime: new Date(), // FULL timestamp
      abstract,
      details,
      signature: {
        officerId: new mongoose.Types.ObjectId(officerId),
        officerName,
        rank,
        forceNumber,
        signedAt: new Date(),
      },
    };

    gd.entries.push(entry);
    gd.lastEntryNo = nextEntryNo;

    await gd.save();

    return NextResponse.json(
      {
        message: "GD entry added successfully",
        entryNo: nextEntryNo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("GD Entry Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
