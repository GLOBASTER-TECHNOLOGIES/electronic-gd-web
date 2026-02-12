import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model"; // ✅ Import Post Model
import bcrypt from "bcryptjs";

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
      postCode, // ✅ We expect this from frontend now
      mobileNumber,
      password,
      createdBy,
    } = body;

    /* =========================
       1. BASIC VALIDATION
    ========================== */
    if (
      !forceNumber ||
      !name ||
      !rank ||
      !appRole ||
      !railwayZone ||
      !division ||
      !postCode || // Validating Code instead of Name
      !mobileNumber ||
      !password
    ) {
      return NextResponse.json(
        { message: "All required fields (including Post Code) must be provided" },
        { status: 400 }
      );
    }

    /* =========================
       2. RESOLVE POST NAME
    ========================== */
    // Find the post by the provided code
    const targetPost = await Post.findOne({ 
       // Search by postCode or generic code field to be safe
       $or: [{ postCode: postCode }, { code: postCode }] 
    });

    if (!targetPost) {
      return NextResponse.json(
        { message: `Invalid Post Code: '${postCode}'. Station not found.` },
        { status: 404 }
      );
    }

    // Extract the official name
    const resolvedPostName = targetPost.postName || targetPost.name || targetPost.stationName;

    /* =========================
       3. CHECK EXISTING OFFICER
    ========================== */
    const existingOfficer = await Officer.findOne({
      $or: [{ forceNumber }, { mobileNumber }],
    });

    if (existingOfficer) {
      return NextResponse.json(
        { message: "Officer already exists with this Force Number or Mobile" },
        { status: 409 }
      );
    }

    /* =========================
       4. HASH PASSWORD
    ========================== */
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* =========================
       5. CREATE OFFICER
    ========================== */
    const officer = await Officer.create({
      forceNumber,
      name,
      rank,
      appRole,
      railwayZone,
      division,
      
      // ✅ Save both Code (from input) and Name (from DB lookup)
      postCode: targetPost.postCode, 
      postName: resolvedPostName, 
      
      mobileNumber,
      password: hashedPassword,
      createdBy: createdBy || null,
    });

    return NextResponse.json(
      {
        message: "Officer registered successfully",
        officerId: officer._id,
        postName: resolvedPostName // Send back name for UI confirmation
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Officer Registration Error:", error);
    
    // Handle Duplicate Key Error (E11000) specifically
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return NextResponse.json(
            { message: `Duplicate entry detected: ${field} already exists.` },
            { status: 409 }
        );
    }

    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}