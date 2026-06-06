import { getTeacherSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { CLASS_LEVELS } from "@/lib/classes";

export async function GET() {
  const session = await getTeacherSession();
  if (!session?.teacherId) return jsonError("Unauthorized", 401);

  const grouped = await prisma.student.groupBy({
    by: ["classLevel"],
    where: { isArchived: false },
    _count: { id: true },
  });

  const countMap = new Map(grouped.map((g) => [g.classLevel, g._count.id]));

  const classes = CLASS_LEVELS.map((classLevel) => ({
    classLevel,
    studentCount: countMap.get(classLevel) ?? 0,
  }));

  return jsonOk(classes);
}
