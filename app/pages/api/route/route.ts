import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from "@prisma/client";

const client = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.json();
  await client.userFeedback.create({
    data: {
      username: body.username,
      rating: body.rating,
    },
  });
  return NextResponse.json({ message: "Feedback received" }, { status: 200 });
}

export async function GET(request: NextRequest) {
  const feedback = await client.userFeedback.findMany();
  return NextResponse.json("This is good");
}