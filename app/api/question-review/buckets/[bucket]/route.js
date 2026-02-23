import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { requireAuth } from "../../_auth";

const s3 = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export async function GET(request, { params }) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { bucket } = await params;
  const questions = await prisma.questionReview.findMany({
    where: { bucketName: decodeURIComponent(bucket) },
    orderBy: [{ reviewCount: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(questions, { status: 200 });
}

export async function POST(request, { params }) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { bucket } = await params;
  const bucketName = decodeURIComponent(bucket);
  const body = await request.json();
  const { name, text, codeJson, imageBase64, questionId, questionSlug } = body;

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  let imageUrl = null;

  if (imageBase64) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid imageBase64" }, { status: 400 });
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
      })
    );

    const baseUrl = process.env.SUPABASE_S3_ENDPOINT.replace(/\/s3$/, "");
    imageUrl = `${baseUrl}/object/public/${process.env.SUPABASE_S3_BUCKET}/${key}`;
  }

  const question = await prisma.questionReview.create({
    data: {
      name: name ?? null,
      bucketName,
      text,
      codeJson: codeJson ?? [],
      imageUrl,
      questionId: questionId ?? null,
      questionSlug: questionSlug ?? null,
    },
  });

  return NextResponse.json(question, { status: 201 });
}
