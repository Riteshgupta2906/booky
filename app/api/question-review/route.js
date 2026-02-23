import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { requireAuth } from "./_auth";

const s3 = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export async function GET(request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");
  const take = parseInt(searchParams.get("take")) || 10;
  const skip = parseInt(searchParams.get("skip")) || 0;

  const where =
    bucket && bucket !== "ALL" && bucket !== "TODAY"
      ? { bucketName: bucket }
      : {};

  const questions = await prisma.questionReview.findMany({
    where,
    orderBy: [{ reviewCount: "asc" }, { createdAt: "asc" }],
    take,
    skip,
  });

  const total = await prisma.questionReview.count({ where });

  return NextResponse.json({ questions, total, take, skip }, { status: 200 });
}

export async function POST(request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const {
    imageBase64,
    bucketName,
    text,
    codeJson,
    name,
    questionId,
    questionSlug,
  } = body;

  console.log(bucketName, text, name, questionId, name);
  if (!bucketName || !text) {
    return NextResponse.json(
      { error: "bucketName and text are required" },
      { status: 400 },
    );
  }

  let imageUrl = null;

  if (imageBase64) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid imageBase64" },
        { status: 400 },
      );
    }
    const [, mimeType, data] = match;
    const ext = mimeType.split("/")[1] || "jpg";
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buf = Buffer.from(data, "base64");

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.SUPABASE_S3_BUCKET,
        Key: key,
        Body: buf,
        ContentType: mimeType,
      }),
    );

    const baseUrl = process.env.SUPABASE_S3_ENDPOINT.replace(/\/s3$/, "");
    imageUrl = `${baseUrl}/object/public/${process.env.SUPABASE_S3_BUCKET}/${key}`;
  }

  const question = await prisma.questionReview.create({
    data: {
      name: name ?? null,
      imageUrl,
      bucketName,
      text,
      codeJson: codeJson ?? [],
      questionId: questionId ?? null,
      questionSlug: questionSlug ?? null,
    },
  });

  return NextResponse.json(question, { status: 201 });
}
