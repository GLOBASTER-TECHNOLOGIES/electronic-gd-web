import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/post.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Extract Query Parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const division = searchParams.get("division") || "ALL";

    // 2. Build the MongoDB Query Object
    const query: any = {};

    // Filter by Division (if not ALL)
    if (division !== "ALL") {
      query.division = division;
    }

    // Filter by Search Term (Post Name OR Post Code)
    if (search) {
      query.$or = [
        { postName: { $regex: search, $options: "i" } }, // Case-insensitive
        { postCode: { $regex: search, $options: "i" } },
      ];
    }

    // 3. Fetch from DB
    const posts = await Post.find(query)
      .populate("officerInCharge", "name rank forceNumber")
      .sort({ division: 1, postName: 1 });
    console.log(posts);
    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error) {
    console.error("Filter Posts Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
