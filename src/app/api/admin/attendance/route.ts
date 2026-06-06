import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, handleZodError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { biometricReportSchema } from "@/lib/validators";
import { parseDateOnly } from "@/lib/attendance";
import { matchStudentId, matchTeacherId } from "@/lib/name-match";
import { searchBiometricByName } from "@/lib/biometric-attendance";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  const month = Number(req.nextUrl.searchParams.get("month")) || new Date().getMonth() + 1;
  const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  const name = req.nextUrl.searchParams.get("name");
  const personType = req.nextUrl.searchParams.get("personType") || "STUDENT";

  if (name) {
    const result = await searchBiometricByName({
      name,
      personType: personType as "STUDENT" | "TEACHER",
      year,
      month,
    });
    return jsonOk(result);
  }

  const reports = await prisma.biometricAttendanceReport.findMany({
    where: { month, year },
    include: { _count: { select: { records: true } } },
    orderBy: { personType: "asc" },
  });

  return jsonOk({ reports, month, year });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = biometricReportSchema.parse(await req.json());

    const [students, teachers] = await Promise.all([
      prisma.student.findMany({
        where: { isArchived: false },
        include: { user: { select: { name: true } } },
      }),
      prisma.teacher.findMany({
        include: { user: { select: { name: true } } },
      }),
    ]);

    const report = await prisma.biometricAttendanceReport.upsert({
      where: {
        month_year_personType: {
          month: body.month,
          year: body.year,
          personType: body.personType,
        },
      },
      create: {
        month: body.month,
        year: body.year,
        pdfUrl: body.pdfUrl,
        personType: body.personType,
      },
      update: { pdfUrl: body.pdfUrl },
    });

    if (body.records?.length) {
      await prisma.biometricAttendanceRecord.deleteMany({ where: { reportId: report.id } });

      await prisma.biometricAttendanceRecord.createMany({
        data: body.records.map((r) => ({
          reportId: report.id,
          personName: r.personName.trim(),
          date: parseDateOnly(r.date),
          status: r.status,
          studentId:
            body.personType === "STUDENT"
              ? matchStudentId(r.personName, students)
              : null,
          teacherId:
            body.personType === "TEACHER"
              ? matchTeacherId(r.personName, teachers)
              : null,
        })),
      });
    }

    const count = await prisma.biometricAttendanceRecord.count({
      where: { reportId: report.id },
    });

    return jsonOk({ report, recordCount: count }, 201);
  } catch (e) {
    return handleZodError(e);
  }
}
