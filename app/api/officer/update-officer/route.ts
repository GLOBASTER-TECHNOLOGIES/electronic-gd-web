import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      id, 
      name, 
      rank, 
      mobileNumber, 
      appRole, 
      postName,
      division,
      railwayZone,
      password 
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Officer ID required" }, { status: 400 });
    }

    const officer = await Officer.findById(id);
    if (!officer) {
      return NextResponse.json({ success: false, message: "Officer not found" }, { status: 404 });
    }

    // Update fields if provided
    if (name) officer.name = name;
    if (rank) officer.rank = rank;
    if (mobileNumber) officer.mobileNumber = mobileNumber;
    if (appRole) officer.appRole = appRole;
    if (postName) officer.postName = postName;
    if (division) officer.division = division;
    if (railwayZone) officer.railwayZone = railwayZone;

    // Handle Password Reset
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      officer.password = await bcrypt.hash(password, salt);
    }

    await officer.save();

    return NextResponse.json({ success: true, message: "Officer updated successfully" });
  } catch (error: any) {
    console.error("Update Officer Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}