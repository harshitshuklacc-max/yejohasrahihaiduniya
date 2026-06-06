import { NextRequest } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { jsonError, jsonOk, handleZodError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { attendanceMarkSchema } from "@/lib/validators";
import { monthRange, parseAttendanceDate } from "@/lib/attendance";

export async function GET(req: NextRequest) {
  const session = await getStudentSession();
  if (!session?.studentId) return jsonError("Unauthorized", 401);

  const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  const month = Number(req.nextUrl.searchParams.get("month")) || new Date().getMonth() + 1;
  const { start, end } = monthRange(year, month);

  const records = await prisma.attendance.findMany({
    where: {
      studentId: session.studentId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  });

  return jsonOk({ records });
}

export async function POST(req: NextRequest) {
  const session = await getStudentSession();
  if (!session?.studentId) return jsonError("Unauthorized", 401);

  try {
    const body = attendanceMarkSchema.parse(await req.json());
    const date = parseAttendanceDate(body.date);

    const record = await prisma.attendance.upsert({
      where: {
        studentId_date: { studentId: session.studentId, date },
      },
      create: {
        studentId: session.studentId,
        date,
        status: body.status,
      },
      update: { status: body.status },
    });

    return jsonOk(record);
  } catch (e) {
    return handleZodError(e);
  }
}
