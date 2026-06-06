import { NextRequest } from "next/server";
import { getTeacherSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getTeacherSession();
  if (!session?.teacherId) return jsonError("Unauthorized", 401);

  const classLevel = req.nextUrl.searchParams.get("classLevel");
  if (!classLevel) return jsonError("classLevel required");

  const students = await prisma.student.findMany({
    where: { classLevel, isArchived: false },
    include: { user: { select: { name: true, username: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return jsonOk(students);
}
