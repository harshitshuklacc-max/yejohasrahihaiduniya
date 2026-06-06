import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { archiveExpiredStudents } from "@/lib/archive";
import { CLASS_LEVELS } from "@/lib/classes";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  await archiveExpiredStudents();

  const [students, teachers, pendingLeaves, fees] = await Promise.all([
    prisma.student.count({ where: { isArchived: false } }),
    prisma.teacher.count(),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.feeRecord.findMany({ include: { student: { include: { user: true } } } }),
  ]);

  const totalDue = fees.reduce((s, f) => s + (f.totalFees - f.paidFees), 0);
  const totalCollected = fees.reduce((s, f) => s + f.paidFees, 0);

  const classCounts = await prisma.student.groupBy({
    by: ["classLevel"],
    where: { isArchived: false },
    _count: { id: true },
  });

  const countMap = new Map(classCounts.map((c) => [c.classLevel, c._count.id]));

  return jsonOk({
    stats: {
      students,
      teachers,
      classes: CLASS_LEVELS.length,
      pendingLeaves,
      totalDue,
      totalCollected,
    },
    chart: CLASS_LEVELS.map((classLevel) => ({
      label: classLevel,
      value: countMap.get(classLevel) ?? 0,
    })).filter((c) => c.value > 0),
  });
}
