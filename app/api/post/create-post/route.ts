import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/post.model";
import Officer from "@/models/officer.model";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      postCode,
      division,
      contactNumber,
      address,
      officerForceId,
      password, // ✅ NEW
    } = body;

    // 1️⃣ Basic Validation
    if (!postCode || !division || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Post Name, Code, Division and Password are required.",
        },
        { status: 400 },
      );
    }

    // 2️⃣ Check for Duplicate Post
    const existingPost = await Post.findOne({
      $or: [{ postCode: postCode.toUpperCase() }],
    });

    if (existingPost) {
      return NextResponse.json(
        {
          success: false,
          message: "A Post with this Name or Code already exists.",
        },
        { status: 409 },
      );
    }

    // 3️⃣ Resolve Officer Force ID → ObjectId
    let officerObjectId = null;

    if (officerForceId) {
      const officer = await Officer.findOne({
        $or: [{ forceId: officerForceId }, { forceNumber: officerForceId }],
      });

      if (!officer) {
        return NextResponse.json(
          {
            success: false,
            message: `Officer with Force ID '${officerForceId}' not found.`,
          },
          { status: 404 },
        );
      }

      officerObjectId = officer._id;
    }

    // 4️⃣ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create Post
    const newPost = await Post.create({
      postCode: postCode.toUpperCase(),
      division: division.toUpperCase(),
      contactNumber,
      address,
      officerInCharge: officerObjectId,
      password: hashedPassword, // 🔐 Saved securely
      lastPasswordChange: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "RPF Post created successfully.",
        data: {
          id: newPost._id,
          postCode: newPost.postCode,
          division: newPost.division,
          zone: newPost.zone,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create Post Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
