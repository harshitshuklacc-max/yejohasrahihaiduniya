import { getStudentSession, getTeacherSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [studentSession, teacherSession] = await Promise.all([
    getStudentSession(),
    getTeacherSession(),
  ]);

  if (!studentSession?.studentId && !teacherSession?.teacherId) {
    return jsonError("Unauthorized", 401);
  }

  const image = await prisma.timetableImage.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk(image);
}
