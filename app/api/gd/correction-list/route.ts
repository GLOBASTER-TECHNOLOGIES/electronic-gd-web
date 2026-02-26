import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import GdCorrection from "@/models/gdCorrection.model";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const status = req.nextUrl.searchParams.get("status");
    
    // We use an aggregation pipeline to flatten the history array
    const pipeline: any[] = [];

    // 1. $unwind deconstructs the history array so every correction log 
    // acts like its own separate document for filtering and sorting.
    pipeline.push({ $unwind: "$history" });

    // 2. $match filters the unwound documents by status (if provided)
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      pipeline.push({ 
        $match: { "history.status": status } 
      });
    }

    // 3. $sort puts the newest correction requests at the top
    pipeline.push({ 
      $sort: { "history.createdAt": -1 } 
    });

    // 4. Execute the aggregation
    const corrections = await GdCorrection.aggregate(pipeline);

    // Optional: Map over the results to flatten the data structure
    // so the frontend doesn't have to write `item.history.status` everywhere.
    const formattedData = corrections.map((doc) => ({
      _id: doc.history._id, // The specific log ID
      containerId: doc._id, // The parent document ID
      dailyGDId: doc.dailyGDId,
      postCode: doc.postCode,
      diaryDate: doc.diaryDate,
      originalEntryId: doc.history.originalEntryId,
      entryNo: doc.history.entryNo,
      correctionType: doc.history.correctionType,
      status: doc.history.status,
      previousData: doc.history.previousData,
      newData: doc.history.newData,
      reason: doc.history.reason,
      requestedBy: doc.history.requestedBy, // Name, rank, forceNumber already here!
      approvedBy: doc.history.approvedBy,
      correctedAt: doc.history.correctedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        count: formattedData.length,
        data: formattedData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Correction List API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}