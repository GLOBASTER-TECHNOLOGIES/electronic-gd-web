import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/post.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Extract Query Parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // <--- NEW: Extract ID
    const search = searchParams.get("search") || "";
    const division = searchParams.get("division") || "ALL";
    const officerId = searchParams.get("officerInCharge");

    // 2. Build the MongoDB Query Object
    const query: any = {};

    // 👇 NEW: If ID is present, return that specific post immediately
    if (id) {
      const post = await Post.findById(id).populate(
        "officerInCharge",
        "name rank forceNumber",
      );
      if (!post) {
        return NextResponse.json(
          { success: false, message: "Post not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: post }, { status: 200 }); // Returns SINGLE object
    }

    /* ... Rest of your existing logic for lists ... */
    if (division !== "ALL") {
      query.division = division;
    }
    if (officerId) {
      query.officerInCharge = officerId;
    }
    if (search) {
      query.$or = [
        { postName: { $regex: search, $options: "i" } },
        { postCode: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query)
      .populate("officerInCharge", "name rank forceNumber")
      .sort({ division: 1, postName: 1 });

    return NextResponse.json({ success: true, data: posts }, { status: 200 }); // Returns ARRAY
  } catch (error) {
    console.error("Filter Posts Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
