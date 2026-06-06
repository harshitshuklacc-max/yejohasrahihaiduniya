import { NextRequest } from "next/server";
import { getTeacherSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getBiometricRecordsForPerson } from "@/lib/biometric-attendance";

export async function GET(req: NextRequest) {
  const session = await getTeacherSession();
  if (!session?.teacherId) return jsonError("Unauthorized", 401);

  const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  const month = Number(req.nextUrl.searchParams.get("month")) || new Date().getMonth() + 1;

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.teacherId },
    include: { user: { select: { name: true } } },
  });

  if (!teacher) return jsonError("Teacher not found", 404);

  const data = await getBiometricRecordsForPerson({
    personType: "TEACHER",
    personName: teacher.user.name,
    teacherId: teacher.id,
    year,
    month,
  });

  return jsonOk(data);
}
