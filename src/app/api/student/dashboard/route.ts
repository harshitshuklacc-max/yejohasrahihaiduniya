import { getStudentSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { resolveTargetStudentIds } from "@/lib/notifications";

function matchesStudentTarget(targetStudentIds: string, studentId: string) {
  const ids = resolveTargetStudentIds(targetStudentIds);
  return ids.length === 0 || ids.includes(studentId);
}

export async function GET() {
  const session = await getStudentSession();
  if (!session?.studentId) return jsonError("Unauthorized", 401);

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      user: { select: { name: true, username: true, phone: true, email: true } },
      feeRecord: { include: { payments: { orderBy: { paidAt: "desc" } } } },
    },
  });

  if (!student) return jsonError("Student not found", 404);

  const [allHomeworks, allMaterials, allTests, announcements, notifications] =
    await Promise.all([
      prisma.homework.findMany({
        where: { classLevel: student.classLevel },
        orderBy: { dueDate: "asc" },
        take: 20,
      }),
      prisma.studyMaterial.findMany({
        where: { classLevel: student.classLevel },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.testSchedule.findMany({
        where: { classLevel: student.classLevel },
        orderBy: { testDate: "asc" },
        take: 20,
      }),
      prisma.announcement.findMany({
        where: {
          OR: [
            { classLevel: student.classLevel },
            { classLevel: null },
            { targetRole: "STUDENT" },
            { targetRole: null },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

  const homeworks = allHomeworks.filter((h) =>
    matchesStudentTarget(h.targetStudentIds, student.id)
  );
  const tests = allTests.filter((t) =>
    matchesStudentTarget(t.targetStudentIds, student.id)
  );

  return jsonOk({
    student: {
      ...student,
      homeworks,
      materials: allMaterials,
      tests,
    },
    announcements,
    notifications,
  });
}
