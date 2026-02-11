import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/post.model";
import Officer from "@/models/officer.model"; // Assuming your Officer/User model is here

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      postName,
      postCode,
      division,
      contactNumber,
      address,
      officerForceId, // <--- The Control Room inputs this (e.g., "98231")
    } = body;

    // 1. Basic Validation
    if (!postName || !postCode || !division) {
      return NextResponse.json(
        {
          success: false,
          message: "Post Name, Code, and Division are required.",
        },
        { status: 400 },
      );
    }

    // 2. Check for Duplicate Post
    const existingPost = await Post.findOne({
      $or: [{ postCode: postCode }, { postName: postName }],
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

    // 3. Resolve Force ID to Officer Object ID
    let officerObjectId = null;

    if (officerForceId) {
      // Find the officer by their visible Force ID
      const officer = await Officer.findOne({
        $or: [{ forceId: officerForceId }, { forceNumber: officerForceId }],
      });

      if (!officer) {
        return NextResponse.json(
          {
            success: false,
            message: `Officer with Force ID '${officerForceId}' not found. Please verify the ID.`,
          },
          { status: 404 },
        );
      }

      // If found, grab the internal _id
      officerObjectId = officer._id;
    }

    // 4. Create the Post with the resolved ID
    const newPost = await Post.create({
      postName,
      postCode,
      division,
      contactNumber,
      address,
      officerInCharge: officerObjectId, // Stores the MongoDB _id linked to that officer
    });

    return NextResponse.json(
      {
        success: true,
        message: "RPF Post created successfully.",
        data: newPost,
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
