import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, handleZodError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { timetableImageSchema } from "@/lib/validators";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  const image = await prisma.timetableImage.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk(image);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = timetableImageSchema.parse(await req.json());
    const existing = await prisma.timetableImage.findFirst();

    const image = existing
      ? await prisma.timetableImage.update({
          where: { id: existing.id },
          data: { imageUrl: body.imageUrl, title: body.title },
        })
      : await prisma.timetableImage.create({
          data: { imageUrl: body.imageUrl, title: body.title },
        });

    return jsonOk(image);
  } catch (e) {
    return handleZodError(e);
  }
}
