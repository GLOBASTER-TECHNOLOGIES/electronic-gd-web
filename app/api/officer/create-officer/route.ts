import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/officer.model";
import Post from "@/models/post.model";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      forceNumber, name, rank, appRole,
      railwayZone, division, postCode, // We get Code from frontend
      mobileNumber, password, createdBy,
    } = body;

    // 1. Validation
    if (!forceNumber || !name || !postCode || !mobileNumber || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 2. FIND THE POST ID USING THE CODE
    const targetPost = await Post.findOne({ 
       $or: [{ postCode: postCode }, { code: postCode }] 
    });

    if (!targetPost) {
      return NextResponse.json(
        { message: `Invalid Post Code: '${postCode}'. Station not found.` },
        { status: 404 }
      );
    }

    // 3. Check for existing officer
    const existing = await Officer.findOne({ $or: [{ forceNumber }, { mobileNumber }] });
    if (existing) {
      return NextResponse.json({ message: "Officer already exists" }, { status: 409 });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. CREATE OFFICER (With postId)
    const officer = await Officer.create({
      forceNumber,
      name,
      rank,
      appRole,
      railwayZone,
      division,
      
      // ✅ LINKING THE ID
      postId: targetPost._id, 
      
      // Keeping these for quick access
      postCode: targetPost.postCode || postCode,
      postName: targetPost.postName || targetPost.name,
      
      mobileNumber,
      password: hashedPassword,
      createdBy: createdBy || null,
    });

    return NextResponse.json({ 
        message: "Officer registered successfully", 
        officerId: officer._id 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}