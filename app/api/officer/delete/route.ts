import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // 🔹 Validate ID presence
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Officer ID is required." },
        { status: 400 }
      );
    }

    // 🔹 Validate Mongo ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Officer ID." },
        { status: 400 }
      );
    }

    // 🔹 Delete Officer
    const deletedOfficer = await Officer.findByIdAndDelete(id);

    if (!deletedOfficer) {
      return NextResponse.json(
        { success: false, message: "Officer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Officer deleted successfully.",
        data: deletedOfficer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Officer Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}