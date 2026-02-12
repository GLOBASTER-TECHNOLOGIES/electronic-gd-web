import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/post.model";
import Officer from "@/models/officer.model"; // Import Officer model to find by Force ID
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      id, 
      postName, 
      division, 
      contactNumber, 
      address, 
      officerForceId, 
      password 
    } = body;

    // 1. Validate ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Post ID is required for updates." },
        { status: 400 }
      );
    }

    // 2. Find the existing Post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Station/Post not found." },
        { status: 404 }
      );
    }

    // 3. Update Basic Fields
    if (postName) post.postName = postName;
    if (division) post.division = division;
    if (contactNumber !== undefined) post.contactNumber = contactNumber;
    if (address !== undefined) post.address = address;

    // 4. Handle Password Update (Only if provided)
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      post.password = await bcrypt.hash(password, salt);
    }

    // 5. Handle Officer Assignment (Resolve Force ID -> Object ID)
    if (officerForceId && officerForceId.trim() !== "") {
      const officer = await Officer.findOne({ forceNumber: officerForceId });
      
      if (!officer) {
        return NextResponse.json(
          { success: false, message: `Officer with Force ID '${officerForceId}' not found.` },
          { status: 400 }
        );
      }
      post.officerInCharge = officer._id;
    } else if (officerForceId === "") {
      // If sent as empty string, unassign the officer
      post.officerInCharge = null;
    }

    // 6. Save Changes
    await post.save();

    return NextResponse.json({
      success: true,
      message: "Post details updated successfully.",
      data: post,
    });

  } catch (error: any) {
    console.error("Update Post Error:", error);
    
    // Handle Duplicate Key Error (e.g., if renaming to an existing Post Name)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A station with this Name already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}