import { NextRequest } from "next/server";
import { getTeacherSession } from "@/lib/auth";
import { jsonError, jsonOk, handleZodError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { homeworkSchema } from "@/lib/validators";
import { notifyClassStudents } from "@/lib/notifications";

export async function GET() {
  const session = await getTeacherSession();
  if (!session?.teacherId) return jsonError("Unauthorized", 401);

  const items = await prisma.homework.findMany({
    where: { teacherId: session.teacherId },
    orderBy: { dueDate: "asc" },
  });
  return jsonOk(items);
}

export async function POST(req: NextRequest) {
  const session = await getTeacherSession();
  if (!session?.teacherId) return jsonError("Unauthorized", 401);

  try {
    const body = homeworkSchema.parse(await req.json());
    const targetStudentIds = body.targetStudentIds ?? [];

    const hw = await prisma.homework.create({
      data: {
        classLevel: body.classLevel,
        teacherId: session.teacherId,
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        attachments: JSON.stringify(body.attachments || []),
        targetStudentIds: JSON.stringify(targetStudentIds),
      },
    });

    await notifyClassStudents({
      classLevel: body.classLevel,
      targetStudentIds,
      title: `New Homework: ${body.title}`,
      body: body.description,
      type: "HOMEWORK",
      refId: hw.id,
    });

    return jsonOk(hw, 201);
  } catch (e) {
    return handleZodError(e);
  }
}
