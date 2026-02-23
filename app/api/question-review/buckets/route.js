import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "../_auth";

export async function GET(request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const rows = await prisma.questionReview.findMany({
    select: { bucketName: true },
    distinct: ["bucketName"],
    orderBy: { bucketName: "asc" },
  });
  return NextResponse.json(rows.map((r) => r.bucketName), { status: 200 });
}
