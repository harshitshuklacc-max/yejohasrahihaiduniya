import { NextRequest } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getBiometricRecordsForPerson } from "@/lib/biometric-attendance";

export async function GET(req: NextRequest) {
  const session = await getStudentSession();
  if (!session?.studentId) return jsonError("Unauthorized", 401);

  const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  const month = Number(req.nextUrl.searchParams.get("month")) || new Date().getMonth() + 1;

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: { user: { select: { name: true } } },
  });

  if (!student) return jsonError("Student not found", 404);

  const data = await getBiometricRecordsForPerson({
    personType: "STUDENT",
    personName: student.user.name,
    studentId: student.id,
    year,
    month,
  });

  return jsonOk(data);
}
