import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "../_auth";

export async function GET(request, { params }) {
  const { id } = await params;

  const question = await prisma.questionReview.findFirst({
    where: {
      OR: [{ id }, { questionSlug: id }, { questionId: id }],
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question, { status: 200 });
}

export async function PATCH(request, { params }) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { text, codeJson, name, action } = body;

  if (action === "increment") {
    const question = await prisma.questionReview.update({
      where: { id },
      data: { reviewCount: { increment: 1 } },
    }).catch(() => null);

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question, { status: 200 });
  }

  const updateData = {};
  if (text !== undefined) updateData.text = text;
  if (codeJson !== undefined) updateData.codeJson = codeJson;
  if (name !== undefined) updateData.name = name;

  const question = await prisma.questionReview.update({
    where: { id },
    data: updateData,
  }).catch(() => null);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question, { status: 200 });
}

export async function DELETE(request, { params }) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  const question = await prisma.questionReview.delete({ where: { id } }).catch(() => null);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
