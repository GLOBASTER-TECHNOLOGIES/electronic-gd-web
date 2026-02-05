import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      forceNumber,
      name,
      rank,
      appRole,
      railwayZone,
      division,
      postName,
      mobileNumber,
      password,
      createdBy,
    } = body;

    /* =========================
       BASIC VALIDATION
    ========================== */
    if (
      !forceNumber ||
      !name ||
      !rank ||
      !appRole ||
      !railwayZone ||
      !division ||
      !postName ||
      !mobileNumber ||
      !password
    ) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 },
      );
    }

    /* =========================
       CHECK EXISTING OFFICER
    ========================== */
    const existingOfficer = await Officer.findOne({
      $or: [{ forceNumber }, { mobileNumber }],
    });

    if (existingOfficer) {
      return NextResponse.json(
        { message: "Officer already exists with this Force Number or Mobile" },
        { status: 409 },
      );
    }

    /* =========================
       CREATE OFFICER
    ========================== */
    const officer = await Officer.create({
      forceNumber,
      name,
      rank,
      appRole,
      railwayZone,
      division,
      postName,
      mobileNumber,
      password, // hashing happens later via schema
      createdBy: createdBy || null,
    });

    return NextResponse.json(
      {
        message: "Officer registered successfully",
        officerId: officer._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Officer Registration Error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
